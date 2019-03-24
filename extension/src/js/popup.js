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
const messageElement1 = document.getElementById('activeMessage');
const messageElement2 = document.getElementById('completeMessage');

/**
 * Respond to user click.
 * 1, Hide button and show busy message
 * 2, Get current tab info
 * 3, Search for favicon
 * 4, Add bookmark (tab url, tab title, favicon) to storage
 * 5, Hide busy message, show complete message
 * 6, Pause so user can see complete message before popup closes
 */
buttonElement.onclick = () => {
    messageElement1.style.display = 'block';
    buttonElement.style.display = 'none';
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const url = tabs[0].url;
        const title = tabs[0].title.substring(0, 100);
        findFavicon(url, (iconUrl) => {
            messageElement1.style.display = 'none';
            messageElement2.style.display = 'block';
            addBookmark(url, title, iconUrl, () => {
                setTimeout(window.close, 2000);
            });
        });
    });
};
