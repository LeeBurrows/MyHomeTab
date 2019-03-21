import * as storage from './storage.js';

const bookmarksContainer = document.getElementById('bookmarksContainer');
const editformContainer = document.getElementById('editformContainer');
const editform = document.getElementById('editform');
const editformHeading = document.getElementById('editformHeading');
const editformIdInput = document.getElementById('editformId');
const editformUrlInput = document.getElementById('editformUrl');
const editformTitleInput = document.getElementById('editformTitle');
const editformIconInput = document.getElementById('editformIcon');
const editformCancelBtn = document.getElementById('editformCancel');
const editformDeleteBtn = document.getElementById('editformDelete');
const controlAdd = document.getElementById('control-add');
const controlClearAll = document.getElementById('control-clear-all');

const settingsFocusControl = document.getElementById('settingsFocusOnOpen');

const bookmarkCardTemplate = bookmarksContainer.firstElementChild.cloneNode(true);

let isReordering = false;
let reorderingBookmarkIndex;
let reorderingColumnCount;
let reorderingRowCount;
let reorderingCellCount;
let reorderingOriginX;
let reorderingOriginY;
let reorderingCellWidth;
let reorderingCellHeight;

/*--------------------------------------------------------------------------------
    search
--------------------------------------------------------------------------------*/

document.getElementById('searchInput').addEventListener('keydown', (event) => {
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
            <img class="bookmark-data-icon" src="">
            <p class="bookmark-data-title"></p>
        </div>
        <div class="bookmark-control">EDIT</div>
    </div>
*/

function buildBookmarkHTML(bookmark) {
    let card = bookmarkCardTemplate.cloneNode(true);
    let cardData = card.children[0];
    let cardIcon = cardData.children[0];
    let cardTitle = cardData.children[1];
    let cardEdit = card.children[1];
    //if title exists, tooltip = title+url, else tooltip = url
    cardData.title = (bookmark.title) ? (bookmark.title + "\n" + bookmark.url) : bookmark.url;
    cardData.onclick = (event) => {
        if (isReordering) return;
        (event.ctrlKey) ? startReordering(event.currentTarget.parentNode) : chrome.tabs.create({ 'url': bookmark.url, 'active': settingsFocusControl.checked });
    };
    //edit button
    cardEdit.onclick = (event) => {
        openEditForm(bookmark);
    }
    //icon. show default if none exists
    cardIcon.src = bookmark.icon || './../icons/icon32.png';
    //description. if title exists, use that, else use url
    cardTitle.innerHTML = bookmark.title || bookmark.url;
    return card;
}

function removeBookmarksFromDisplay() {
    while (bookmarksContainer.hasChildNodes()) {
        bookmarksContainer.removeChild(bookmarksContainer.firstChild);
    }
}

function addBookmarksToDisplay() {
    removeBookmarksFromDisplay();
    storage.getBookmarks((data) => {
        for (let i = 0; i < data.length; i++) {
            bookmarksContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
            // bookmarkContainer.appendChild(buildBookmarkHTML(data[i]));
        }
    });
}

/*--------------------------------------------------------------------------------
    reordering
--------------------------------------------------------------------------------*/

function startReordering(ele) {
    isReordering = true;

    var computedStyle = window.getComputedStyle(bookmarksContainer, null);

    let paddingLeft = parseInt(computedStyle.paddingLeft);
    let paddingTop = parseInt(computedStyle.paddingTop);
    let gapX = parseInt(computedStyle.gridColumnGap);
    let gapY = parseInt(computedStyle.gridRowGap);
    let templateColumns = computedStyle.gridTemplateColumns.split(' ');
    let templateRows = computedStyle.gridTemplateRows.split(' ');
    let cardWidth = parseInt(templateColumns[0]);
    let cardHeight = parseInt(templateRows[0]);

    reorderingBookmarkIndex = calcBookmarkIndex(ele);
    reorderingColumnCount = templateColumns.length;
    reorderingCellCount = bookmarksContainer.children.length;
    reorderingRowCount = Math.ceil(reorderingCellCount / reorderingColumnCount);
    reorderingOriginX = paddingLeft;
    reorderingOriginY = paddingTop;
    reorderingCellWidth = cardWidth + gapX;
    reorderingCellHeight = cardHeight + gapY;

    document.addEventListener('mousemove', doReordering);
    document.addEventListener('mousedown', endReordering);
    window.addEventListener('resize', cancelReordering);
}

function endReordering() {
    document.removeEventListener('mousemove', doReordering);
    document.removeEventListener('mousedown', endReordering);
    window.removeEventListener('resize', cancelReordering);
    isReordering = false;
    let newIndex = calcCellIndex(event.clientX, event.clientY);
    if (reorderingBookmarkIndex !== newIndex) {
        storage.reorderBookmark(reorderingBookmarkIndex, newIndex);
    }
}

function cancelReordering() {
    document.removeEventListener('mousemove', doReordering);
    document.removeEventListener('mousedown', endReordering);
    window.removeEventListener('resize', cancelReordering);
    isReordering = false;
}

function doReordering(event) {
    let currentIndex = calcCellIndex(event.clientX, event.clientY);
    console.log(currentIndex);
}

function calcCellIndex(x, y) {
    let xpos = Math.max(0, x - reorderingOriginX);
    let ypos = Math.max(0, y - reorderingOriginY);
    let cellX = Math.min(reorderingColumnCount - 1, Math.floor(xpos / reorderingCellWidth));
    let cellY = Math.min(reorderingRowCount - 1, Math.floor(ypos / reorderingCellHeight));
    return Math.min(reorderingCellCount - 1, cellX + reorderingColumnCount * cellY);
}

function calcBookmarkIndex(bookmark) {
    for (let i = 0; i < bookmarksContainer.children.length; i++) {
        if (bookmark === bookmarksContainer.children[i]) {
            return i;
        }
    }
}

/*--------------------------------------------------------------------------------
    form
--------------------------------------------------------------------------------*/

function openEditForm(bookmark) {
    editformContainer.style.display = 'block';
    if (bookmark) {
        editformHeading.innerHTML = "Edit Bookmark";
        editformIdInput.value = bookmark.id;
        editformUrlInput.value = bookmark.url;
        editformTitleInput.value = bookmark.title;
        editformIconInput.value = bookmark.icon;
        editformTitleInput.focus();
    } else {
        editformHeading.innerHTML = "Add Bookmark";
        editformIdInput.value = '';
        editformUrlInput.value = '';
        editformTitleInput.value = '';
        editformIconInput.value = '';
        editformUrlInput.focus();
    }
    editformDeleteBtn.style.display = (bookmark) ? 'block' : 'none';
}

function closeEditForm() {
    editformContainer.style.display = 'none';
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
    controls
--------------------------------------------------------------------------------*/

controlAdd.addEventListener('click', (event) => openEditForm());
controlClearAll.addEventListener('click', (event) => {
    if (confirm("Are you sure you want to delete ALL bookmarks?")) storage.removeAllBookmarks();
});
settingsFocusControl.addEventListener('change', saveSettings);

/*--------------------------------------------------------------------------------
    startup
--------------------------------------------------------------------------------*/

editformContainer.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeEditForm();
});

storage.registerBookmarksChangeListener(addBookmarksToDisplay);
loadSettings();
initEditForm();
addBookmarksToDisplay();


