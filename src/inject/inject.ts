/// <reference path="../../DefinitelyTyped/chrome/chrome.d.ts" />

var faviconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
var faviconURL = faviconLinks.length === 0
               ? '/favicon.ico'
               : (<HTMLElement>faviconLinks[0]).getAttribute('href');

var absolutizer = document.createElement('a');
    absolutizer.href = faviconURL;

chrome.runtime.sendMessage({ url: absolutizer.href }, function (response: any) {
    for (var i = 0, el; el = faviconLinks[i]; i++) {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    var link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', response.url);

    document.querySelector('head').appendChild(link);
});
