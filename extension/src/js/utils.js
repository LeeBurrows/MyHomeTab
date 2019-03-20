function getFaviconUrl(url) {
    var regex = /([^\/\"\'>]*[^\/]*\/[^\/]*\/[^\/|\'\"]*)[\"\']?[^>]*/i;
    return url.match(regex)[1] + '/favicon.ico';
}

export {
    getFaviconUrl
}