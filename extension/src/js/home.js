import * as storage from './storage.js';
import Bookmark from './bookmark.js';
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
 * @param {Bookmark} bookmark - The bookmark to populate card with
 * @returns {htmlelement} - Generated HTML
 */
function buildBookmarkCardHTML(bookmark) {
    const card = bookmarkCardTemplate.cloneNode(true);
    const cardData = card.children[0];
    const cardIcon = cardData.children[0];
    const cardTitle = cardData.children[1];
    const cardEdit = card.children[1];
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
    cardIcon.src = bookmark.iconUrl || './../icons/icon32.png';
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
 * @param {htmlelement} element - Root node of the card to move
 */
function startReordering(element) {
    let computedStyle = window.getComputedStyle(bookmarksContainer);

    let firstBookmarkDomRect = bookmarksContainer.children[0].getBoundingClientRect();

    let templateColumns = computedStyle.gridTemplateColumns.split(' ');
    let templateRows = computedStyle.gridTemplateRows.split(' ');
    let cardWidth = parseInt(templateColumns[0]);
    let cardHeight = parseInt(templateRows[0]);
    let gapX = parseInt(computedStyle.gridColumnGap);
    let gapY = parseInt(computedStyle.gridRowGap);

    isReordering = true;
    reorderingBookmarkIndex = reorderingBookmarkStartIndex  = calcBookmarkIndex(element);
    reorderingElement = element;
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
    window.addEventListener('resize', cleanupReordering);
}

/**
 * Conclude card re-positioning
 * 
 * @param {mouseevent} event - MouseDown event
 */
function stopReordering(event) {
    cleanupReordering();
    const newIndex = calcCellIndex(event.clientX, event.clientY);
    if (reorderingBookmarkStartIndex !== newIndex) {
        storage.reorderBookmark(reorderingBookmarkStartIndex, newIndex);
    }
}

/**
 * Tidy up after re-positioning
 */
function cleanupReordering() {
    document.removeEventListener('mousemove', doReordering);
    document.removeEventListener('mousedown', stopReordering);
    window.removeEventListener('resize', cleanupReordering);
    reorderingElement.children[0].className = 'bookmark-data';
    //delay state change slightly incase mouse is over a card when clicking
    //to end reordering; this would trigger opening a new tab if reordering was not still true
    setTimeout(() => isReordering = false, 100);
}

/**
 * Update card position.
 * 
 * @param {mouseevent} event expects MouseMove event
 */
function doReordering(event) {
    const currentIndex = calcCellIndex(event.clientX, event.clientY);
    if (currentIndex > reorderingBookmarkIndex) {
        bookmarksContainer.insertBefore(reorderingElement, bookmarksContainer.children[currentIndex + 1]);
        reorderingBookmarkIndex = currentIndex;
    } else if (currentIndex < reorderingBookmarkIndex) {
        bookmarksContainer.insertBefore(reorderingElement, bookmarksContainer.children[currentIndex]);
        reorderingBookmarkIndex = currentIndex;
    }
}

/**
 * Calculate position index for a given screen position
 * 
 * @param {number} x - screen x position
 * @param {number} y - screen y position
 * @returns {number} - position index
 */
function calcCellIndex(x, y) {
    const xpos = Math.max(0, x - reorderingOriginX);
    const ypos = Math.max(0, y - reorderingOriginY);
    const cellX = Math.min(reorderingColumnCount - 1, Math.floor(xpos / reorderingCellWidth));
    const cellY = Math.min(reorderingRowCount - 1, Math.floor(ypos / reorderingCellHeight));
    return Math.min(reorderingCellCount - 1, cellX + reorderingColumnCount * cellY);
}

/**
 * Find card position index for associated bookmark
 * 
 * @param {Bookmark} bookmark - the bookmark to find index for
 * @returns {number} - position index
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
 * @param {Bookmark} bookmark - the bookmark to edit 
 */
function openEditForm(bookmark) {
    editformContainer.style.display = 'block';
    if (bookmark) {
        editformHeading.innerHTML = "Edit Bookmark";
        editformIdInput.value = bookmark.id;
        editformUrlInput.value = bookmark.url;
        editformTitleInput.value = bookmark.title;
        editformIconInput.value = bookmark.iconUrl;
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
 * @param {mouseevent} [event] - optional
 */

function closeEditForm(event) {
    //if called by form container click listener, ensure click is outside of form, else ignore it
    if (event && event.target !== event.currentTarget) return;
    editformContainer.removeEventListener('click', closeEditForm);
    editformContainer.style.display = 'none';
}

/**
 * Prepare listeners.
 */
function initListeners() {
    //storage
    storage.addBookmarksChangeEventListener(addBookmarksToDisplay);
    //search bar
    document.getElementById('searchInput').addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target.value.length > 0) {
            chrome.tabs.create({ 'url': 'https://google.com/search?q=' + event.target.value });
        }
    });
    //controls
    document.getElementById('controlAdd').addEventListener('click', (event) => openEditForm());
    document.getElementById('controlClearAll').addEventListener('click', (event) => {
        if (confirm("Are you sure you want to delete ALL bookmarks?")) storage.removeAllBookmarks();
    });
    //options
    optionsFocusControl.addEventListener('change', saveOptions);
    //edit form
    editform.addEventListener('submit', () => {
        if (!editformUrlInput.validity.valid) return;
        const id = editformIdInput.value;
        const url = editformUrlInput.value;
        const title = editformTitleInput.value;
        const iconUrl = editformIconInput.value;
        if (editformIdInput.value) {
            const bookmark = new Bookmark(id, url, title, iconUrl);
            storage.updateBookmark(bookmark, closeEditForm);
        } else {
            storage.addBookmark(url, title, iconUrl, closeEditForm);
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
    storage.getOptions((data) => {
        optionsFocusControl.checked = data['focusOnOpen'];
    });
}

/**
 * Retrieve user options from display and save to storage
 */
function saveOptions() {
    const obj = {}
    obj['focusOnOpen'] = optionsFocusControl.checked;
    storage.setOptions(obj);
}

/**
 * initialise.
 * 
 * 1) Setup listeners
 * 2) Load/display options settings
 * 3) Load/display bookmarks
 */
initListeners();
loadOptions();
addBookmarksToDisplay();