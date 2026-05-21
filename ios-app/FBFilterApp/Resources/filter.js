(function() {
    let config = {
        remoteConfigUrl: "https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/core/config.json",
        postContainerSelector: "div[data-pagelet^='FeedUnit_'], div[role='article']",
        adSelectors: [
            "a[href*='/ads/about']",
            "a[aria-label='Sponsored']",
            "a[aria-label='Được tài trợ']"
        ],
        suggestedPageSelectors: [
            "div[aria-label='Follow']",
            "div[aria-label='Theo dõi']"
        ],
        suggestedKeywords: ["Suggested for you", "Gợi ý cho bạn"],
        removalText: "🛡️ Đã xóa nội dung quảng cáo/gợi ý"
    };

    function log(msg) {
        console.log("[FB-Filter] " + msg);
    }

    async function fetchRemoteConfig() {
        if (!config.remoteConfigUrl || config.remoteConfigUrl.includes("YOUR_USER")) return;
        try {
            const response = await fetch(config.remoteConfigUrl);
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
        // Check Ad Selectors
        for (let selector of config.adSelectors) {
            if (post.querySelector(selector)) return true;
        }

        // Check Suggested Page Selectors
        for (let selector of config.suggestedPageSelectors) {
            if (post.querySelector(selector)) return true;
        }

        // Check Keywords in text
        const postText = post.innerText || "";
        for (let keyword of config.suggestedKeywords) {
            if (postText.includes(keyword)) return true;
        }

        // Special check for 'Sponsored' text hidden in nested spans (FB common tactic)
        // This is a basic check; a more advanced one would look for visually rendered text
        return false;
    }

    function processPost(post) {
        if (post.hasAttribute('data-fb-filter-checked')) return;
        post.setAttribute('data-fb-filter-checked', 'true');

        if (isUnwanted(post)) {
            log("Removing unwanted post...");
            post.innerHTML = "";
            post.appendChild(createRemovalBar());
        }
    }

    function runFilter() {
        const posts = document.querySelectorAll(config.postContainerSelector);
        posts.forEach(processPost);
    }

    // Set up MutationObserver for infinite scroll
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Check if the node itself is a post or contains posts
                    if (node.matches && node.matches(config.postContainerSelector)) {
                        processPost(node);
                    } else {
                        const nestedPosts = node.querySelectorAll(config.postContainerSelector);
                        nestedPosts.forEach(processPost);
                    }
                }
            });
        });
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

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
