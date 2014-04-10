/// <reference path="../../DefinitelyTyped/chrome/chrome.d.ts" />

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        console.log('onUpdated', tabId);
        if (/./.exec(tab.url)) {
            chrome.tabs.executeScript(tabId, { file: 'js/inject/inject.js' })
        }
    }
);
