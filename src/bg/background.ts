/// <reference path="../../DefinitelyTyped/chrome/chrome.d.ts" />

function getConfigFromUrl (url: string) {
    var storedRules = new StorageKey('options.rules');
    var rules = storedRules.get() || {};
    var hostname = /^\w+:\/\/([^:\/]+)/.exec(url)[1];

    console.log(rules);

    for (var p in rules) {
        var regexp = new RegExp('^' + p.replace(/\*/g, '.+?') + '$');
        console.log(regexp);

        if (regexp.test(hostname)) {
            return rules[p];
        }
    }
}

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        console.log('onUpdated', tabId);

        if (getConfigFromUrl(tab.url)) {
            chrome.tabs.executeScript(tabId, { file: 'js/inject/inject.js' })
        }

        var storedRules = new StorageKey('options.rules');
        var rules = storedRules.get() || {};
        var hostname = /^\w+:\/\/([^:\/]+)/.exec(tab.url)[1];

        console.log(rules);

        for (var p in rules) {
            var regexp = new RegExp('^' + p.replace(/\*/g, '.+?') + '$');
            console.log(regexp);

            if (regexp.test(hostname)) {
                chrome.tabs.executeScript(tabId, { code: 'window._j = ' + JSON.stringify(rules[p]) });
            }
        }
    }
);

chrome.runtime.onMessage.addListener(
    function (message: any, sender: chrome.runtime.MessageSender, sendResponse: (any) => void) {
        var config = getConfigFromUrl(sender.tab.url);
        if (config) {
            sendResponse(config);
        }
    }
);
