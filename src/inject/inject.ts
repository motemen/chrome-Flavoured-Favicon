/// <reference path="../../DefinitelyTyped/chrome/chrome.d.ts" />

console.log('** START **', document.readyState);

chrome.runtime.sendMessage({}, function (response: any) {

    var faviconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    var faviconURL = faviconLinks.length === 0
                   ? '//' + location.host + '/favicon.ico'
                   : (<HTMLElement>faviconLinks[0]).getAttribute('href');

    console.log(faviconURL);

    // TODO
    if (faviconURL.indexOf('data:') === -1) {
        loadImage(faviconURL, function (image) {
            var faviconDataURL = generateFlavouredFaviconDataURL(image);
            replaceFavicon(faviconDataURL);
        });
    }

    function loadImage(url: string, callback: (HTMLImageElement) => any) {
        var image = new Image();
        image.onload = function (e: Event) {
            console.log('onload', e);
            callback(image);
        };
        image.src = url;
    }

    function generateFlavouredFaviconDataURL (image: HTMLImageElement): string {
        var w = image.naturalWidth, h = image.naturalHeight;

        function mkCanvas () {
            var canvas = document.createElement('canvas');
            canvas.width  = w;
            canvas.height = h;
            return canvas;
        }

        var canvas = mkCanvas(),
            mask   = mkCanvas();

        var ctxMask = mask.getContext('2d');
        ctxMask.drawImage(image, 0, 0);
        ctxMask.globalCompositeOperation = 'source-atop';
        ctxMask.fillStyle = response.overlay;
        ctxMask.fillRect(0, 0, w, h);

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        // context.globalCompositeOperation = 'source-atop';
        // context.globalCompositeOperation = 'lighten';
        context.globalCompositeOperation = 'lighten';
        /*
        // context.globalAlpha = 0.5;
        context.fillStyle = response.overlay;
        context.fillRect(0, 0, w, h);
        */
        var i = new Image();
        i.src = ctxMask.canvas.toDataURL();
        context.drawImage(i, 0, 0);

        return canvas.toDataURL();
    }

    function replaceFavicon (faviconURL: string) {
        for (var i = 0, el; el = faviconLinks[i]; i++) {
            el.parentNode.removeChild(el);
        }

        var link = document.createElement('link');
        link.setAttribute('rel', 'icon');
        link.setAttribute('href', faviconURL);

        document.querySelector('head').appendChild(link);
    }

});
