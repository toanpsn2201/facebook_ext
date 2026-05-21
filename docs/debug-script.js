(function() {
    console.log("%c[FB-Filter Deep Inspector] Đang khởi động...", "color: #42b72a; font-weight: bold; font-size: 16px;");

    const signals = [
        "Sponsored", "Được tài trợ", "Suggested for you", "Gợi ý cho bạn", "Follow", "Theo dõi"
    ];

    function findByText(text) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const found = [];
        while(node = walker.nextNode()) {
            if (node.textContent.includes(text)) {
                found.push(node.parentElement);
            }
        }
        return found;
    }

    console.group("1. Kiểm tra tín hiệu chữ (Visual Text)");
    signals.forEach(s => {
        const elements = findByText(s);
        if (elements.length > 0) {
            console.log(`%c[OK] Tìm thấy "${s}": ${elements.length} vị trí.`, "color: #42b72a");
            elements.slice(0, 3).forEach(el => {
                const container = el.closest("[role='article']") || el.closest("[data-pagelet]");
                if (container) {
                    container.style.outline = "5px solid lime";
                    console.log("-> Thẻ cha (Container):", container);
                }
            });
        } else {
            console.log(`%c[MISS] Không thấy chữ "${s}"`, "color: #999");
        }
    });
    console.groupEnd();

    console.group("2. Kiểm tra Selector Đặc biệt (Ad-Rendering)");
    const adRoles = ["[data-ad-rendering-role='like_button']", "[data-ad-rendering-role='comment_button']"];
    adRoles.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
            console.log(`%c[OK] Tìm thấy Selector: ${sel}`, "color: #42b72a");
            el.closest("[role='article']").style.outline = "5px solid cyan";
        } else {
            console.log(`%c[MISS] Không thấy Selector: ${sel}`, "color: #999");
        }
    });
    console.groupEnd();

    console.log("%c[HƯỚNG DẪN] Nếu bạn thấy bài nào có VIỀN XANH LÁ/XANH DƯƠNG -> Logic đang chạy đúng.", "background: #000; color: #fff; padding: 5px;");
})();
