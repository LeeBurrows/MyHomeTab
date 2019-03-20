import { addBookmark } from './storage.js';
import { getFaviconUrl } from './utils.js';

const txt = document.getElementById('successText');
const btn = document.getElementById('addBtn');

btn.onclick = () => {
    txt.style.display = 'block';
    btn.style.display = 'none';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let bookmark = {};
        bookmark['id'] = (new Date()).getTime().toString();
        bookmark['url'] = tabs[0].url;
        bookmark['title'] = tabs[0].title.substring(0, 100);
        bookmark['icon'] = getFaviconUrl(tabs[0].url);
        addBookmark(bookmark, () => {
            setTimeout(window.close, 2000);
        });
    });
};
