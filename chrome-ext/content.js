function injectCoreScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('core-filter.js');
    (document.head || document.documentElement).appendChild(script);
    return script;
}

// Just inject the core script. 
// The core script now handles its own remote config fetching.
injectCoreScript();
