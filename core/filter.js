(function() {
    let config = {
        remoteConfigUrl: "https://raw.githubusercontent.com/toanpsn2201/facebook_ext/main/core/config.json",
        postContainerSelector: "div[data-pagelet^='FeedUnit_'], div[role='article']",
        adSelectors: [
            "[data-ad-rendering-role='like_button']",
            "[data-ad-rendering-role='comment_button']",
            "[data-ad-rendering-role='share_button']",
            "a[href*='/ads/about']",
            "a[aria-label='Sponsored']",
            "a[aria-label='Được tài trợ']",
            "svg > use[href*='sponsored']"
        ],
        suggestedPageSelectors: [
            "div[aria-label='Follow']",
            "div[aria-label='Theo dõi']",
            "div[aria-label='Suggested for you']",
            "div[aria-label='Gợi ý cho bạn']"
        ],
        suggestedKeywords: ["Suggested for you", "Gợi ý cho bạn"],
        removalText: "🛡️ Đã xóa nội dung quảng cáo/gợi ý"
    };

    let blockedCount = 0;
    let statusUI = null;

    function log(msg) {
        console.log("[FB-Filter] " + msg);
    }

    function createStatusUI() {
        if (document.getElementById('fb-filter-status')) return;
        
        const container = document.createElement("div");
        container.id = "fb-filter-status";
        container.style.position = "fixed";
        container.style.bottom = "20px";
        container.style.right = "20px";
        container.style.zIndex = "9999";
        container.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        container.style.color = "white";
        container.style.padding = "8px 12px";
        container.style.borderRadius = "20px";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.fontSize = "12px";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.pointerEvents = "none";
        container.style.transition = "opacity 0.3s";

        const dot = document.createElement("div");
        dot.style.width = "8px";
        dot.style.height = "8px";
        dot.style.backgroundColor = "#42b72a";
        dot.style.borderRadius = "50%";
        dot.style.marginRight = "8px";
        dot.style.boxShadow = "0 0 5px #42b72a";

        const text = document.createElement("span");
        text.id = "fb-filter-count-text";
        text.innerText = "FB Filter: 0";

        container.appendChild(dot);
        container.appendChild(text);
        document.body.appendChild(container);
        statusUI = container;
    }

    function updateCounter() {
        blockedCount++;
        const text = document.getElementById("fb-filter-count-text");
        if (text) {
            text.innerText = `FB Filter: ${blockedCount}`;
        }
    }

    async function fetchRemoteConfig() {
        if (!config.remoteConfigUrl || config.remoteConfigUrl.includes("YOUR_USER")) return;
        try {
            const response = await fetch(config.remoteConfigUrl + "?t=" + Date.now());
            if (!response.ok) throw new Error("Fetch failed");
            const newConfig = await response.json();
            Object.assign(config, newConfig);
            log("Remote config applied successfully.");
            runFilter();
        } catch (e) {
            log("Failed to fetch remote config, using defaults.");
        }
    }

    function createRemovalBar() {
        const bar = document.createElement("div");
        bar.style.padding = "10px";
        bar.style.margin = "8px 0";
        bar.style.backgroundColor = "#f0f2f5";
        bar.style.textAlign = "center";
        bar.style.color = "#65676b";
        bar.style.fontSize = "13px";
        bar.style.fontWeight = "600";
        bar.style.borderRadius = "8px";
        bar.innerText = config.removalText;
        bar.className = "fb-filter-removed-bar";
        return bar;
    }

    function isUnwanted(post) {
        const postText = post.innerText || "";
        
        // 1. Check Keywords in text (Deep scanning)
        const allKeywords = [...config.suggestedKeywords, "Sponsored", "Được tài trợ", "Follow", "Theo dõi"];
        for (let keyword of allKeywords) {
            if (postText.includes(keyword)) {
                log(`Found unwanted keyword: ${keyword}`);
                return true;
            }
        }

        // 2. Check Ad-Rendering Specific Roles (Secondary signal)
        for (let selector of config.adSelectors) {
            if (post.querySelector(selector)) {
                log(`Found unwanted selector: ${selector}`);
                return true;
            }
        }

        return false;
    }

    function processNode(node) {
        // Find all potential post containers
        const posts = node.querySelectorAll ? node.querySelectorAll(config.postContainerSelector) : [];
        
        // If the node itself is a post container
        if (node.matches && node.matches(config.postContainerSelector)) {
            posts.push(node);
        }

        posts.forEach(post => {
            if (post.hasAttribute('data-fb-filter-checked')) return;

            if (isUnwanted(post)) {
                post.setAttribute('data-fb-filter-checked', 'true');
                log("Removing unwanted post...");
                post.innerHTML = "";
                post.appendChild(createRemovalBar());
                updateCounter();
            } else {
                // If it's a clean post, we mark it after a delay to ensure lazy elements are loaded
                setTimeout(() => {
                    if (post && !post.innerHTML.includes("fb-filter-removed-bar")) {
                        post.setAttribute('data-fb-filter-checked', 'true');
                    }
                }, 3000);
            }
        });
    }

    function runFilter() {
        processNode(document.body);
        createStatusUI();
    }

    // Set up MutationObserver for infinite scroll
    const observer = new MutationObserver((mutations) => {
        let timeout;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            runFilter();
        }, 300);
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback Polling (Every 2 seconds) for cases where MutationObserver might miss something
    setInterval(runFilter, 2000);

    // Initial run
    runFilter();
    fetchRemoteConfig();

    log("Filter script initialized.");

    // Function to update config remotely (can be called by extension or injected again)
    window.updateFBFilterConfig = function(newConfig) {
        config = Object.assign(config, newConfig);
        log("Config updated.");
        runFilter();
    };
})();
