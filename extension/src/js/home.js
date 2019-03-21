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
let reorderingElement;
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
        (event.ctrlKey) ? startReordering(card) : chrome.tabs.create({ 'url': bookmark.url, 'active': settingsFocusControl.checked });
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
    let computedStyle = window.getComputedStyle(bookmarksContainer);

    let firstBookmarkDomRect = bookmarksContainer.children[0].getBoundingClientRect();

    let templateColumns = computedStyle.gridTemplateColumns.split(' ');
    let templateRows = computedStyle.gridTemplateRows.split(' ');
    let cardWidth = parseInt(templateColumns[0]);
    let cardHeight = parseInt(templateRows[0]);
    let gapX = parseInt(computedStyle.gridColumnGap);
    let gapY = parseInt(computedStyle.gridRowGap);

    isReordering = true;
    reorderingBookmarkIndex = calcBookmarkIndex(ele);
    reorderingElement = ele;
    reorderingCellCount = bookmarksContainer.children.length;
    reorderingColumnCount = templateColumns.length;
    reorderingRowCount = Math.ceil(reorderingCellCount / reorderingColumnCount);
    reorderingOriginX = firstBookmarkDomRect.left;
    reorderingOriginY = firstBookmarkDomRect.top;
    reorderingCellWidth = cardWidth + gapX;
    reorderingCellHeight = cardHeight + gapY;

    reorderingElement.children[0].className = 'bookmark-data-reordering';

    document.addEventListener('mousemove', doReordering);
    document.addEventListener('mousedown', endReordering);
    window.addEventListener('resize', cancelReordering);
}

function endReordering() {
    cancelReordering();
    let newIndex = calcCellIndex(event.clientX, event.clientY);
    if (reorderingBookmarkIndex !== newIndex) {
        storage.reorderBookmark(reorderingBookmarkIndex, newIndex);
    }
}

function cancelReordering() {
    document.removeEventListener('mousemove', doReordering);
    document.removeEventListener('mousedown', endReordering);
    window.removeEventListener('resize', cancelReordering);
    reorderingElement.children[0].className = 'bookmark-data';
    //delay state change slightly
    //incase clicking to end reordering while mouse is over a card; this would trigger opening a new tab
    setTimeout(() => isReordering = false, 100);
}

function doReordering(event) {
    let currentIndex = calcCellIndex(event.clientX, event.clientY);
    if (currentIndex > reorderingBookmarkIndex) {
        reorderingBookmarkIndex = currentIndex;
        bookmarksContainer.insertBefore(reorderingElement, bookmarksContainer.children[currentIndex + 1]);
    } else if (currentIndex < reorderingBookmarkIndex) {
        reorderingBookmarkIndex = currentIndex;
        bookmarksContainer.insertBefore(reorderingElement, bookmarksContainer.children[currentIndex]);
    }
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
    editformContainer.addEventListener('click', closeEditForm);
}

function closeEditForm(event) {
    //if called by form container click listener, ensure click is outside of form, else ignore it
    if (event && event.target !== event.currentTarget) return;
    editformContainer.removeEventListener('click', closeEditForm);
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

storage.registerBookmarksChangeListener(addBookmarksToDisplay);
loadSettings();
initEditForm();
addBookmarksToDisplay();


