/// <reference path="../../DefinitelyTyped/chrome/chrome.d.ts" />

console.log('** START **', document.readyState);

var faviconURL = document.querySelector('link[rel$=icon]').getAttribute('href');

if (faviconURL.indexOf('data:') === -1) {
    loadImage(faviconURL, function (image) {
        var faviconDataURL = generateOverlainFaviconDataURL(image);
        replaceFavicon(faviconDataURL);
    });
}

function loadImage(url: string, callback: (HTMLImageElement) => any) {
    console.log('loadImage', url);
    var image = new Image();
    image.onload = function (e: Event) {
        console.log('onload', e);
        callback(image);
    };
    image.src = url;
}

function generateOverlainFaviconDataURL (image: HTMLImageElement): string {
    console.log('generateOverlainFaviconDataURL', image);
    var canvas = document.createElement('canvas');
    var w = image.naturalWidth, h = image.naturalHeight;
    canvas.width  = w;
    canvas.height = h;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    context.globalCompositeOperation = 'source-atop';
    context.globalAlpha = 0.8;
    context.fillStyle = '#F00';
    context.fillRect(0, 0, w, h);

    return canvas.toDataURL();
}

function replaceFavicon (faviconURL: string) {
    var existingFaviconLinks = document.querySelectorAll('link[rel$=icon]');
    for (var i = 0, el; el = existingFaviconLinks[i]; i++) {
        el.parentNode.removeChild(el);
    }

    var link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', faviconURL);

    document.querySelector('head').appendChild(link);
}
