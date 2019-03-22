import * as storage from './storage.js';
/**
 * ======================================================================
 * home.js
 * 
 * Scripts for home.html
 * ======================================================================
 */




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
const optionsFocusControl = document.getElementById('optionsFocusOnOpen');
const bookmarkCardTemplate = bookmarksContainer.firstElementChild.cloneNode(true);

let isReordering = false;
let reorderingElement;
let reorderingBookmarkIndex;
let reorderingBookmarkStartIndex;
let reorderingColumnCount;
let reorderingRowCount;
let reorderingCellCount;
let reorderingOriginX;
let reorderingOriginY;
let reorderingCellWidth;
let reorderingCellHeight;

/**
 * Generate HTML elements for bookmark card.
 * 
 * @param {object} bookmark - The bookmark to populate card with
 * @returns {HTMLElement}
 */
function buildBookmarkCardHTML(bookmark) {
    let card = bookmarkCardTemplate.cloneNode(true);
    let cardData = card.children[0];
    let cardIcon = cardData.children[0];
    let cardTitle = cardData.children[1];
    let cardEdit = card.children[1];
    //if title exists, tooltip = title+url, else tooltip = url
    cardData.title = (bookmark.title) ? (bookmark.title + "\n" + bookmark.url) : bookmark.url;
    cardData.onclick = (event) => {
        if (isReordering) return;
        (event.ctrlKey) ? startReordering(card) : chrome.tabs.create({ 'url': bookmark.url, 'active': optionsFocusControl.checked });
    };
    //edit button
    cardEdit.onclick = (event) => {
        openEditForm(bookmark);
    }
    //icon. show default if none stored, show default if fails to load
    cardIcon.onerror = () => cardIcon.src = './../icons/icon32.png';
    cardIcon.src = bookmark.icon || './../icons/icon32.png';
    //description. if title exists, use that, else use url
    cardTitle.innerHTML = bookmark.title || bookmark.url;
    return card;
}

/**
 * Remove all bookmark cards from DOM.
 */
function removeBookmarksFromDisplay() {
    while (bookmarksContainer.hasChildNodes()) {
        bookmarksContainer.removeChild(bookmarksContainer.firstChild);
    }
}

/**
 * Retrieve bookmarks from storage and add cards to DOM.
 * 
 * Removes any existing cards from DOM first
 */
function addBookmarksToDisplay() {
    removeBookmarksFromDisplay();
    storage.getBookmarks((data) => {
        for (let i = 0; i < data.length; i++) {
            bookmarksContainer.appendChild(buildBookmarkCardHTML(data[i]));
        }
    });
}

/**
 * Initiate card re-positioning
 * 
 * @param {HTMLElement} ele - Root node of the card to move
 */
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
    reorderingBookmarkIndex = reorderingBookmarkStartIndex  = calcBookmarkIndex(ele);
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
    document.addEventListener('mousedown', stopReordering);
    window.addEventListener('resize', exitReordering);
}

/**
 * Conclude card re-positioning
 * 
 * @param {mouseevent} event - MouseDown event
 */
function stopReordering(event) {
    exitReordering();
    let newIndex = calcCellIndex(event.clientX, event.clientY);
    if (reorderingBookmarkStartIndex !== newIndex) {
        storage.reorderBookmark(reorderingBookmarkStartIndex, newIndex);
    }
}

/**
 * Tidy up after re-positioning
 */
function exitReordering() {
    document.removeEventListener('mousemove', doReordering);
    document.removeEventListener('mousedown', stopReordering);
    window.removeEventListener('resize', exitReordering);
    reorderingElement.children[0].className = 'bookmark-data';
    //delay state change slightly incase mouse is over a card when clicking
    //to end reordering; this would trigger opening a new tab if reordering was not still true
    setTimeout(() => isReordering = false, 100);
}

/**
 * Update card position.
 * 
 * @param {mouseevent} event MouseMove event
 */
function doReordering(event) {
    let currentIndex = calcCellIndex(event.clientX, event.clientY);
    if (currentIndex > reorderingBookmarkIndex) {
        bookmarksContainer.insertBefore(reorderingElement, bookmarksContainer.children[currentIndex + 1]);
        reorderingBookmarkIndex = currentIndex;
    } else if (currentIndex < reorderingBookmarkIndex) {
        bookmarksContainer.insertBefore(reorderingElement, bookmarksContainer.children[currentIndex]);
        //reorderingBookmarkIndex = currentIndex;
    }
}

/**
 * Calculate position index for a given screen position
 * 
 * @param {int} x - screen x position
 * @param {int} y - screen y position
 * @returns {int} - position index
 */
function calcCellIndex(x, y) {
    let xpos = Math.max(0, x - reorderingOriginX);
    let ypos = Math.max(0, y - reorderingOriginY);
    let cellX = Math.min(reorderingColumnCount - 1, Math.floor(xpos / reorderingCellWidth));
    let cellY = Math.min(reorderingRowCount - 1, Math.floor(ypos / reorderingCellHeight));
    return Math.min(reorderingCellCount - 1, cellX + reorderingColumnCount * cellY);
}

/**
 * Find card position index for associated bookmark
 * 
 * @param {object} bookmark - the bookmark
 * @returns {int} - position index
 */
function calcBookmarkIndex(bookmark) {
    for (let i = 0; i < bookmarksContainer.children.length; i++) {
        if (bookmark === bookmarksContainer.children[i]) {
            return i;
        }
    }
}

/**
 * Open edit bookmark form
 * 
 * @param {object} bookmark - the bookmark to edit 
 */
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

/**
 * Close edit bookmark form.
 * 
 * @param {event} event - optional
 */

function closeEditForm(event) {
    //if called by form container click listener, ensure click is outside of form, else ignore it
    if (event && event.target !== event.currentTarget) return;
    editformContainer.removeEventListener('click', closeEditForm);
    editformContainer.style.display = 'none';
}

/**
 * Prepare edit bookmark form.
 */
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

/**
 * Retrieve user options from storage and populate display
 */
function loadOptions() {
    storage.getSettings((data) => {
        optionsFocusControl.checked = data['focusOnOpen'];
    });
}

/**
 * Retrieve user options from display and save to storage
 */
function saveOptions() {
    let obj = {}
    obj['focusOnOpen'] = optionsFocusControl.checked;
    storage.setSettings(obj);
}

/**
 * Setup search.
 * 
 * If user presses ENTER while search input has focus, and input is not empty,
 * open new tab and navigate to google
 */
document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.value.length > 0) {
        chrome.tabs.create({ 'url': 'https://google.com/search?q=' + event.target.value });
    }
});

/**
 * Setup controls.
 */
controlAdd.addEventListener('click', (event) => openEditForm());
controlClearAll.addEventListener('click', (event) => {
    if (confirm("Are you sure you want to delete ALL bookmarks?")) storage.removeAllBookmarks();
});
/**
 * Setup user options.
 */
optionsFocusControl.addEventListener('change', saveOptions);
loadOptions();

/**
 * Final setup.
 * 
 * 1) Listen for storage changes
 * 2) Prep the edit form
 * 3) Show bookmarks
 */
storage.registerBookmarksChangeListener(addBookmarksToDisplay);
initEditForm();
addBookmarksToDisplay();


