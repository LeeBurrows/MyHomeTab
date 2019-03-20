import { addBookmark } from './storage.js';

function getFaviconUrl(url) {
    var regex = /([^\/\"\'>]*[^\/]*\/[^\/]*\/[^\/|\'\"]*)[\"\']?[^>]*/i;
    return url.match(regex)[1] + '/favicon.ico';
}

document.getElementById('btn').onclick = () => {
    console.log("click");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let bookmark = {};
        bookmark['id'] = (new Date()).getTime().toString();
        bookmark['url'] = tabs[0].url;
        bookmark['title'] = tabs[0].title.substring(0, 100);
        bookmark['icon'] = getFaviconUrl(tabs[0].url);
        addBookmark(bookmark, () => {
            window.close();
        });
    });
};
