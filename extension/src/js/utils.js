function getRootUrl(url) {
    var regex = /([^\/\"\'>]*[^\/]*\/[^\/]*\/[^\/|\'\"]*)[\"\']?[^>]*/i;
    return url.match(regex)[1];
}

function lookForImage(url, callback) {
    let img = new Image();
    img.onload = () => {
        callback(url);
    };
    img.onerror = () => {
        callback();
    };
    img.src = url;
}

function findIcon(url, callback) {
    const rootUrl = getRootUrl(url);
    lookForImage(rootUrl + '/favicon.png', (result) => {
        if (result) {
            callback(result);
        } else {
            lookForImage(rootUrl + '/favicon.ico', (result) => {
                if (result) {
                    callback(result);
                } else {
                    callback('');
                }
            });
        }
    });
}

export {
    findIcon
}