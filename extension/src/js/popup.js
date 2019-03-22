import { addBookmark } from './storage.js';
import { findFavicon } from './utils.js';
/**
 * ======================================================================
 * popup.js
 * 
 * Scripts for popup.html
 * ======================================================================
 */




const buttonElement = document.getElementById('control');
const messageElement = document.getElementById('message');

/**
 * Respond to user click.
 * 1, Hide button and show message
 * 2, Get current tab info
 * 3, Search for favicon
 * 4, Add bookmark (tab url, tab title, favicon) to storage
 * 5, Pause so user can see message before popup closes
 */
buttonElement.onclick = () => {
    messageElement.style.display = 'block';
    buttonElement.style.display = 'none';
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let url = tabs[0].url;
        let title = tabs[0].title.substring(0, 100);
        findFavicon(tabs[0].url, (icon) => {
            addBookmark(url, title, icon, () => {
                setTimeout(window.close, 2000);
            });
        });
    });
};
