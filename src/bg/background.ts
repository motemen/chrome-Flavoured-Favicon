/// <reference path="../../DefinitelyTyped/chrome/chrome.d.ts" />

import sk = require('../lib/storage-key');

var tabWorking: { [index: number]: boolean } = {};

function getConfigFromUrl (url: string) {
    var m = /^\w+:\/\/([^:\/]+)/.exec(url);
    if (!m) return null;

    var hostname = m[1];
    var storedRules = new sk.StorageKey('options.rules');
    var rules = storedRules.get() || {};

    for (var p in rules) {
        var regexp = new RegExp('^' + p.replace(/\*/g, '.+?') + '$');
        if (regexp.test(hostname)) {
            return rules[p];
        }
    }
}

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            if (getConfigFromUrl(tab.url)) {
                tabWorking[tabId] = true;
                chrome.tabs.executeScript(tabId, { file: 'js/inject/inject.js' })
            } else {
                delete tabWorking[tabId];
            }
        }
    }
);

chrome.runtime.onMessage.addListener(
    function (message: any, sender: chrome.runtime.MessageSender, sendResponse: (any) => void) {
        if (tabWorking[sender.tab.id]) {
            delete tabWorking[sender.tab.id];
            loadImage(message.url, function (image) {
                var config = getConfigFromUrl(sender.tab.url);
                var faviconDataURL = generateFlavouredFaviconDataURL(config, image);
                sendResponse({ url: faviconDataURL });
            });
            return true;
        }
    }
);

function loadImage(url: string, callback: (HTMLImageElement) => any) {
    var image = new Image();
    image.onload = function (e: Event) {
        callback(image);
    };
    image.src = url;
}

function generateFlavouredFaviconDataURL (config: any, image: HTMLImageElement): string {
    var w = image.naturalWidth, h = image.naturalHeight;

    function mkCanvasContext () {
        var canvas = document.createElement('canvas');
            canvas.width  = w;
            canvas.height = h;
        return canvas.getContext('2d');
    }

    var mask = mkCanvasContext();
        mask.drawImage(image, 0, 0);
        mask.globalCompositeOperation = 'source-atop';
        mask.fillStyle = config.color;
        mask.fillRect(0, 0, w, h);

    var i = new Image();
        i.src = mask.canvas.toDataURL();

    var context = mkCanvasContext();
        context.drawImage(image, 0, 0);
        context.globalCompositeOperation = 'lighten';
        context.drawImage(i, 0, 0);

    return context.canvas.toDataURL();
}
