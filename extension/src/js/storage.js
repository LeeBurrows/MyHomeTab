import Bookmark from './bookmark.js';
/**
 * ======================================================================
 * storage.js
 * 
 * Extension-specific service for Chrome Storage CRUD operations.
 * ======================================================================
 */




const chromeStorage = chrome.storage.local; //chrome.storage.sync also works
const storageKey_bookmarks = 'bookmarks'; // key for bookmarks store
const storageKey_options = 'options'; // key for user options store

/**
 * Read user options.
 * 
 * @param {function} callback - Signature: callback(object)
 */
function getOptions(callback) {
    chromeStorage.get(storageKey_options, (data) => {
        callback(data[storageKey_options] || {});
    });
}

/**
 * Write user options.
 * 
 * @param {object} data - User options
 * @param {function} callback - Signature: callback()
 */
function setOptions(data, callback) {
    const obj = {};
    obj[storageKey_options] = data;
    chromeStorage.set(obj, callback);
}

/**
 * Read bookmarks.
 * 
 * @param {function} callback - Signature: callback(Bookmark[])
 */
function getBookmarks(callback) {
    chromeStorage.get(storageKey_bookmarks, (data) => {
        callback(data[storageKey_bookmarks] || []);
    });
}

/**
 * Write bookmarks.
 * 
 * @param {Bookmark[]} data - bookmarks
 * @param {function} callback - Signature: callback()
 */
function setBookmarks(data, callback) {
    const obj = {};
    obj[storageKey_bookmarks] = data;
    chromeStorage.set(obj, callback);
}

/**
 * Delete bookmark.
 * 
 * @param {string} id - ID of bookmark to delete
 * @param {function} callback - Signature: callback()
 */
function deleteBookmark(id, callback) {
    getBookmarks((data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                data.splice(i, 1);
                break;
            }
        }
        setBookmarks(data, callback);
    });
}

/**
 * Add bookmark.
 * 
 * @param {string} url - bookmark URL
 * @param {string} title - bookmark title
 * @param {string} icon - bookmark icon URL
 * @param {function} callback - Signature: callback()
 */
function addBookmark(url, title, iconUrl, callback) {
    getBookmarks((data) => {
        const bookmark = new Bookmark((new Date()).getTime().toString(), url, title, iconUrl);
        data.push(bookmark);
        setBookmarks(data, callback);
    });
}

/**
 * Update bookmark.
 * 
 * @param {Bookmark} bookmark - Bookmark to update
 * @param {function} callback - Signature: callback()
 */
function updateBookmark(bookmark, callback) {
    getBookmarks((data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].id === bookmark.id) {
                data[i] = bookmark;
                break;
            }
        }
        setBookmarks(data, callback);
    });
}

/**
 * Reposition bookmark in stored data list.
 * 
 * @param {number} oldIndex - Index of bookmark to move
 * @param {number} newIndex - Index of new bookmark location
 * @param {function} callback - Signature: callback()
 */
function reorderBookmark(oldIndex, newIndex, callback) {
    getBookmarks((data) => {
        const bookmarkToMove = data.splice(oldIndex, 1)[0];
        data.splice(newIndex, 0, bookmarkToMove);
        setBookmarks(data, callback);
    });
}

/**
 * Deleta all bookmarks.
 * 
 * @param {function} callback - Signature: callback()
 */
function removeAllBookmarks(callback) {
    chromeStorage.remove(storageKey_bookmarks, callback);
}

/**
 * Add callback event for changes to bookmarks.
 * 
 * @param {function} callback - Signature: callback()
 * 
 * TODO:
 * Implement removeBookmarksChangeEventListener
 */
function addBookmarksChangeEventListener(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes[storageKey_bookmarks]) callback();
    });
}

/**
 * Exports
 */
export {
    addBookmarksChangeEventListener,
    getBookmarks,
    deleteBookmark,
    addBookmark,
    updateBookmark,
    reorderBookmark,
    removeAllBookmarks,
    getOptions,
    setOptions
};