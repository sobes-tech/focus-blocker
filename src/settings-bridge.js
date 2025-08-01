// This script runs in the content script context and can access chrome.storage
// It bridges the settings between chrome.storage and the MAIN world content script

const DEFAULT_BLOCKED_EVENTS = [
    "visibilitychange",
    "webkitvisibilitychange",
    "mozvisibilitychange",
    "msvisibilitychange",
    "blur",
    "focus",
    "focusin",
    "focusout"
];

const DEFAULT_WHITELIST_DOMAINS = ["code.yandex-team.ru"];

// Check if current domain is whitelisted
function checkWhitelist(whitelistDomains) {
    const currentHost = window.location.hostname;
    
    return whitelistDomains.some(pattern => {
        // Convert wildcard pattern to regex
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(currentHost);
    });
}

// Load initial settings
chrome.storage.sync.get(['blockedEvents', 'whitelistDomains'], (result) => {
    const blockedEvents = result.blockedEvents || DEFAULT_BLOCKED_EVENTS;
    const whitelistDomains = result.whitelistDomains || DEFAULT_WHITELIST_DOMAINS;
    const isEnabled = checkWhitelist(whitelistDomains);
    
    window.postMessage({ 
        type: 'FOCUS_BLOCKER_SETTINGS', 
        blockedEvents,
        isEnabled
    }, '*');
});

// Listen for changes in settings
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        chrome.storage.sync.get(['blockedEvents', 'whitelistDomains'], (result) => {
            const blockedEvents = result.blockedEvents || DEFAULT_BLOCKED_EVENTS;
            const whitelistDomains = result.whitelistDomains || DEFAULT_WHITELIST_DOMAINS;
            const isEnabled = checkWhitelist(whitelistDomains);
            
            window.postMessage({ 
                type: 'FOCUS_BLOCKER_SETTINGS', 
                blockedEvents,
                isEnabled
            }, '*');
        });
    }
});