import { addBookmark } from './storage.js';
import { findIcon } from './utils.js';

const txt = document.getElementById('successText');
const btn = document.getElementById('addBtn');

btn.onclick = () => {
    txt.style.display = 'block';
    btn.style.display = 'none';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let url = tabs[0].url;
        let title = tabs[0].title.substring(0, 100);
        findIcon(tabs[0].url, (icon) => {
            addBookmark(url, title, icon, () => {
                setTimeout(window.close, 2000);
            });
        });
    });
};
