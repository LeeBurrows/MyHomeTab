/**
 * ======================================================================
 * utils.js
 * 
 * Helper functions.
 * 
 * TODO:
 * testImageExistence() - use Promises; will enable findFavicon to test
 * more variations of favicon URL without indentation insanity
 * ======================================================================
 */




/**
 * Determine if image exists at URL.
 * 
 * @param {string} url - a URL to test
 * @param {function} callback - Signature: callback(url:string = null)
 * Success: callback(validated url)
 * Failed: callback(null)
 */
function testImageExistence(url, callback) {
    const img = new Image();
    img.onload = () => {
        callback(url);
    };
    img.onerror = () => {
        callback(null);
    };
    img.src = url;
}

/**
 * Search for favicon at domain of URL.
 * Checks <domain>/favicon.png and then <domain>/favicon.ico
 * 
 * @param {string} url - a URL for website
 * @param {function} callback - Signature: callback(url:string = null)
 * Success: callback(favicon url)
 * Failed: callback(null)
 */
function findFavicon(url, callback) {
    const domainUrl = url.match(/([^\/\"\'>]*[^\/]*\/[^\/]*\/[^\/|\'\"]*)[\"\']?[^>]*/i)[1]; // extract domain from URL
    testImageExistence(domainUrl + '/favicon.png', (result) => {
        if (result) {
            callback(result);
        } else {
            testImageExistence(domainUrl + '/favicon.ico', (result) => {
                if (result) {
                    callback(result);
                } else {
                    callback(null);
                }
            });
        }
    });
}

/**
 * Exports
 */
export {
    findFavicon
}