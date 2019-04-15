# MyHomeTab
Chrome Extension with speed dial functionality.

v0.2 BETA

## License
[This project is licensed under the terms of the MIT license.](./LICENSE.md)

## Instructions
* Add new card with toolbar button (![Image](./extension/icons/icon16.png "toolbar icon")) while on any page.
* Click card to open new tab (option to jump to new tab when opening, control in footer).
* Add new card manually with "Add" button in footer.
* Delete all cards with "Delete All" button in footer.
* Re-order cards by ctrl-clicking card, then use mouse to move card to a new position.
* To edit or delete a card, hover over card to reveal EDIT button; click to open form for editing, or to delete.
* Type in searchbar and hit ENTER to open new tab with google search results.


## Installation
1. Open the Extension Management page by navigating to [**chrome://extensions**](chrome://extensions) (the Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions).
2. Enable Developer Mode by clicking the toggle switch next to Developer mode.
3. Click the LOAD UNPACKED button and select the "extension" directory of this project (ie: the directory containing the manifest.json file).


## Technical Notes
* No dependancies.
* No compiling/transpiling required.
* Bookmark data stored in Chrome Storage (Local, but Sync will work too).
* Bookmark data: 
  * UID,
  * Page URL,
  * Page Title,
  * Image URL.
* When new bookmark created with toolbar button, app looks for favicon file at root of site (png and then ico) to populate image URL.
* Re-ordering of cards depends on css grid layout.


## Todos
* Better documentation for JS, CSS, Readme.
* Save image data in storage, rather than requesting from remote resource each time (although browser cache does mitigate this issue).
* Grouping of bookmarks.
* Import / export.
* For "delete all" confirmation, replace native browser confirm dialog with custom markup/script.
* Edit form:
  * Validate URL.
  * Option to auto-grab URL Title.
  * Option to auto-grab (or refresh, when image data saved to storage has been implemented) image URL.
* User options:
  * Card size.
  * Background colours / picture.
  * Show/hide search.
  * Select alternative search engines.
