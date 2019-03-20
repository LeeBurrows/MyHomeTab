import { getBookmarks, deleteBookmark, addBookmark, updateBookmark, registerBookmarksChangeListener, removeAllBookmarks, getSettings, setSettings } from './storage.js';

const bookmarkContainer = document.getElementById('bookmarks');
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

function buildBookmarkHTML(value) {
    let card = cardTemplate.cloneNode(true);
    let cardData = card.children[0];
    let cardIcon = cardData.children[0];
    let cardTitle = cardData.children[1];
    let cardEdit = card.children[1];
    //if title exists, tooltip = title+url, else tooltip = url
    cardData.title = (value.title) ? (value.title + "\n" + value.url) : value.url;
    cardData.onclick = (event) => {
        chrome.tabs.create({ 'url': value.url, 'active': settingsFocusControl.checked });
    };
    //edit button
    cardEdit.onclick = (event) => {
        openEditForm(value);
    }
    //icon, show default if loading error
    cardIcon.onerror = (event) => { event.target.src = './../icons/icon32.png' };
    cardIcon.src = value.icon;
    //description. if title exists, use that, else use url
    cardTitle.innerHTML = (value.title) ? value.title : value.url;
    return card;
}

function removeBookmarksFromDisplay() {
    while (bookmarkContainer.hasChildNodes()) {
        bookmarkContainer.removeChild(bookmarkContainer.firstChild);
    }
}

function addBookmarksToDisplay() {
    removeBookmarksFromDisplay();
    getBookmarks((data) => {
        for (let i = 0; i < data.length; i++) {
            bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
        }
    });
}

/*--------------------------------------------------------------------------------
    form
--------------------------------------------------------------------------------*/

function openEditForm(value) {
    editformModal.style.display = 'block';
    if (value == null) {
        editformIdInput.value = '';
        editformUrlInput.value = '';
        editformTitleInput.value = '';
        editformIconInput.value = '';
        editformDescription.innerHTML = "Add Bookmark";
        editformUrlInput.focus();
    } else {
        editformIdInput.value = value.id;
        editformUrlInput.value = value.url;
        editformTitleInput.value = value.title;
        editformIconInput.value = value.icon;
        editformDescription.innerHTML = "Edit Bookmark";
    }
    editformDeleteBtn.style.display = (value == null) ? 'none' : 'block';
}
function closeEditForm() {
    editformModal.style.display = 'none';
}

function initEditForm() {
    editform.addEventListener('submit', () => {
        if (!editformUrlInput.validity.valid) return;
        let bookmark = {};
        bookmark['id'] = editformIdInput.value || (new Date()).getTime().toString();
        bookmark['url'] = editformUrlInput.value;
        bookmark['title'] = editformTitleInput.value;
        bookmark['icon'] = editformIconInput.value;
        if (editformIdInput.value) {
            updateBookmark(bookmark, closeEditForm);
        } else {
            addBookmark(bookmark, closeEditForm);
        }
    });
    editformCancelBtn.addEventListener('click', () => {
        closeEditForm();
    });
    editformDeleteBtn.addEventListener('click', () => {
        deleteBookmark(editformIdInput.value, closeEditForm);
    });
}

/*--------------------------------------------------------------------------------
    settings
--------------------------------------------------------------------------------*/

function loadSettings() {
    getSettings((data) => {
        settingsFocusControl.checked = data['focusOnOpen'];
    });
}

function saveSettings() {
    let jsonObj = {}
    jsonObj['focusOnOpen'] = settingsFocusControl.checked;
    setSettings(jsonObj);
}

/*--------------------------------------------------------------------------------
    startup
--------------------------------------------------------------------------------*/

controlAdd.addEventListener('click', (event) => openEditForm());
controlClearAll.addEventListener('click', (event) => {
    if (confirm("Are you sure you want to delete ALL bookmarks?")) removeAllBookmarks();
});
settingsFocusControl.addEventListener('change', saveSettings);

registerBookmarksChangeListener(addBookmarksToDisplay);
loadSettings();
initEditForm();
addBookmarksToDisplay();


