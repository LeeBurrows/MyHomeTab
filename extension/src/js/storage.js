/**
 * ======================================================================
 * storage.js
 * 
 * Extension-specific service for Chrome Storage CRUD operations.
 * ======================================================================
 */




const chromeStorage = chrome.storage.local; //chrome.storage.sync also works
const storageKey_bookmarks = 'bookmarks'; // key for bookmarks store
const storageKey_options = 'options'; // key for user option store

/**
 * Read user options.
 * 
 * Callback signature: callback(user-options:object)
 */
function getUserOptions(callback) {
    chromeStorage.get(storageKey_options, (data) => {
        callback(data[storageKey_options] || {});
    });
}

/**
 * Write user options.
 * 
 * @param {object} data - User options
 * Callback signature: callback()
 */
function setUserOptions(data, callback) {
    let jsonObj = {};
    jsonObj[storageKey_options] = data;
    chromeStorage.set(jsonObj, callback);
}

/**
 * Read bookmarks.
 * 
 * Callback signature: callback(bookmarks:array)
 */
function getBookmarks(callback) {
    chromeStorage.get(storageKey_bookmarks, (data) => {
        callback(data[storageKey_bookmarks] || []);
    });
}

/**
 * Write bookmarks.
 * 
 * @param {array} data - bookmarks
 * Callback signature: callback()
 */
function setBookmarks(data, callback) {
    let jsonObj = {};
    jsonObj[storageKey_bookmarks] = data;
    chromeStorage.set(jsonObj, callback);
}

/**
 * Delete bookmark.
 * 
 * @param {string} id - ID of bookmark to delete
 * Callback signature: callback()
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
 * Callback signature: callback()
 */
function addBookmark(url, title, icon, callback) {
    getBookmarks((data) => {
        let obj = {};
        obj['id'] = (new Date()).getTime().toString();
        obj['url'] = url || '';
        obj['title'] = title || '';
        obj['icon'] = icon || '';
        data.push(obj);
        setBookmarks(data, callback);
    });
}

/**
 * Update bookmark.
 * 
 * @param {object} bookmark - Bookmark to update
 * Callback signature: callback()
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
 * @param {int} oldIndex - Index of bookmark to move
 * @param {int} newIndex - Index of new bookmark location
 * Callback signature: callback()
 */
function reorderBookmark(oldIndex, newIndex, callback) {
    getBookmarks((data) => {
        let bookmarkToMove = data.splice(oldIndex, 1)[0];
        data.splice(newIndex, 0, bookmarkToMove);
        setBookmarks(data, callback);
    });
}

/**
 * Deleta all bookmarks.
 * 
 * Callback signature: callback()
 */
function removeAllBookmarks(callback) {
    chromeStorage.remove(storageKey_bookmarks, callback);
}

/**
 * Add callback event for changes to bookmarks.
 * 
 * Event callback signature: callback()
 * 
 * TODO:
 * Add removeBookmarksChangeEventListener
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
    addBookmarksChangeEventListener as registerBookmarksChangeListener,
    getBookmarks,
    deleteBookmark,
    addBookmark,
    updateBookmark,
    reorderBookmark,
    removeAllBookmarks,
    getUserOptions as getSettings,
    setUserOptions as setSettings
};