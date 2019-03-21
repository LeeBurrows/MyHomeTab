import * as storage from './storage.js';

const bookmarkContainer = document.getElementById('bookmarksContainer');
const editformModal = document.getElementById('editformModal');
const editform = document.getElementById('editform');
const editformDescription = document.getElementById('editformDescription');
const editformIdInput = document.getElementById('editformId');
const editformUrlInput = document.getElementById('editformUrl');
const editformTitleInput = document.getElementById('editformTitle');
const editformIconInput = document.getElementById('editformIcon');
const editformCancelBtn = document.getElementById('editformCancel');
const editformDeleteBtn = document.getElementById('editformDelete');
const controlAdd = document.getElementById('control-add');
const controlClearAll = document.getElementById('control-clear-all');

const settingsFocusControl = document.getElementById('settingsFocusOnOpen');

const cardTemplate = bookmarkContainer.firstElementChild.cloneNode(true);

/*--------------------------------------------------------------------------------
    search
--------------------------------------------------------------------------------*/

document.getElementById('searching').addEventListener('keydown', (event) => {
    if (event.key == "Enter") {
        chrome.tabs.create({ 'url': 'https://google.com/search?q=' + event.target.value });
    }
});

/*--------------------------------------------------------------------------------
    bookmarks
--------------------------------------------------------------------------------*/

/*
    <div class="bookmark-card" title="">
        <div class="bookmark-data">
            <img class="bookmark-card-icon" src="">
            <p class="bookmark-card-title" ></p>
        </div>
        <div class="bookmark-controls">
            <a href="#" class="bookmark-card-edit"><img src="./images/edit.png" data-btn="edit"></a>
        </div>
    </div>
*/

function buildBookmarkHTML(bookmark) {
    let card = cardTemplate.cloneNode(true);
    let cardData = card.children[0];
    let cardIcon = cardData.children[0];
    let cardTitle = cardData.children[1];
    let cardEdit = card.children[1];
    //if title exists, tooltip = title+url, else tooltip = url
    cardData.title = (bookmark.title) ? (bookmark.title + "\n" + bookmark.url) : bookmark.url;
    cardData.onclick = (event) => {
        chrome.tabs.create({ 'url': bookmark.url, 'active': settingsFocusControl.checked });
    };
    //edit button
    cardEdit.onclick = (event) => {
        openEditForm(bookmark);
    }
    //icon, show default if none
    if (bookmark.icon === '') bookmark.icon = './../icons/icon32.png';
    cardIcon.src = bookmark.icon;
    //description. if title exists, use that, else use url
    cardTitle.innerHTML = ((bookmark.title) ? bookmark.title : bookmark.url);
    return card;
}

function removeBookmarksFromDisplay() {
    while (bookmarkContainer.hasChildNodes()) {
        bookmarkContainer.removeChild(bookmarkContainer.firstChild);
    }
}

function addBookmarksToDisplay() {
    removeBookmarksFromDisplay();
    storage.getBookmarks((data) => {
        for (let i = 0; i < data.length; i++) {
            bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
        }
    });
}

/*--------------------------------------------------------------------------------
    form
--------------------------------------------------------------------------------*/

function openEditForm(bookmark) {
    editformModal.style.display = 'block';
    if (bookmark) {
        editformIdInput.value = bookmark.id;
        editformUrlInput.value = bookmark.url;
        editformTitleInput.value = bookmark.title;
        editformIconInput.value = bookmark.icon;
        editformDescription.innerHTML = "Edit Bookmark";
        editformTitleInput.focus();
    } else {
        editformIdInput.value = '';
        editformUrlInput.value = '';
        editformTitleInput.value = '';
        editformIconInput.value = '';
        editformDescription.innerHTML = "Add Bookmark";
        editformUrlInput.focus();
    }
    editformDeleteBtn.style.display = (bookmark) ? 'block' : 'none';
}

function closeEditForm() {
    editformModal.style.display = 'none';
}

function initEditForm() {
    editform.addEventListener('submit', () => {
        if (!editformUrlInput.validity.valid) return;
        let id = editformIdInput.value;
        let url = editformUrlInput.value;
        let title = editformTitleInput.value;
        let icon = editformIconInput.value;
        if (editformIdInput.value) {
            let bookmark = {};
            bookmark['id'] = id;
            bookmark['url'] = url;
            bookmark['title'] = title;
            bookmark['icon'] = icon;
            storage.updateBookmark(bookmark, closeEditForm);
        } else {
            storage.addBookmark(url, title, icon, closeEditForm);
        }
    });
    editformCancelBtn.addEventListener('click', () => {
        closeEditForm();
    });
    editformDeleteBtn.addEventListener('click', () => {
        storage.deleteBookmark(editformIdInput.value, closeEditForm);
    });
}

/*--------------------------------------------------------------------------------
    settings
--------------------------------------------------------------------------------*/

function loadSettings() {
    storage.getSettings((data) => {
        settingsFocusControl.checked = data['focusOnOpen'];
    });
}

function saveSettings() {
    let jsonObj = {}
    jsonObj['focusOnOpen'] = settingsFocusControl.checked;
    storage.setSettings(jsonObj);
}

/*--------------------------------------------------------------------------------
    startup
--------------------------------------------------------------------------------*/

controlAdd.addEventListener('click', (event) => openEditForm());
controlClearAll.addEventListener('click', (event) => {
    if (confirm("Are you sure you want to delete ALL bookmarks?")) storage.removeAllBookmarks();
});
settingsFocusControl.addEventListener('change', saveSettings);

storage.registerBookmarksChangeListener(addBookmarksToDisplay);
loadSettings();
initEditForm();
addBookmarksToDisplay();


