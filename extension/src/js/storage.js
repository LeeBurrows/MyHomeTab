const chromeStorage = chrome.storage.local;
const bookmarksKey = 'bookmarks';
const settingsKey = 'settings';

/*--------------------------------------------------------------------------------
    settings
--------------------------------------------------------------------------------*/

function getSettings(callback) {
    chromeStorage.get(settingsKey, (data) => {
        callback(data[settingsKey] || {});
    });
}
function setSettings(data, callback) {
    let jsonObj = {};
    jsonObj[settingsKey] = data;
    chromeStorage.set(jsonObj, callback);
}

/*--------------------------------------------------------------------------------
    bookmarks
--------------------------------------------------------------------------------*/

function getBookmarks(callback) {
    chromeStorage.get(bookmarksKey, (data) => {
        callback(data[bookmarksKey] || []);
    });
}

function setBookmarks(data, callback) {
    let jsonObj = {};
    jsonObj[bookmarksKey] = data;
    chromeStorage.set(jsonObj, callback);
}


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

function addBookmark(value, callback) {
    getBookmarks((data) => {
        data.push(value);
        setBookmarks(data, callback);
    });
}

function updateBookmark(value, callback) {
    getBookmarks((data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].id === value.id) {
                data[i] = value;
                break;
            }
        }
        setBookmarks(data, callback);
    });
}

function removeAllBookmarks(callback) {
    chromeStorage.remove(bookmarksKey, callback);
}

function registerBookmarksChangeListener(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes[bookmarksKey]) callback();
    });
}

/*--------------------------------------------------------------------------------
    exports
--------------------------------------------------------------------------------*/

export {
    registerBookmarksChangeListener,
    getBookmarks,
    deleteBookmark,
    addBookmark,
    updateBookmark,
    removeAllBookmarks,
    getSettings,
    setSettings
};