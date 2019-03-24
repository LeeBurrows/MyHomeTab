# MyHomeTab
Chrome Extension with speed dial functionality

v0.1 BETA

## Summary
* Displays cards representing bookmarks.  
* Card data stored in Chrome Storage.  
* Card data: 
  * URL,
  * Title,
  * URL to an image.
* Add new card with toolbar button (![Image](./extension/icons/icon16.png "toolbar icon")) while on any page.  
* Card data filled with page URL, page Title and (if found) site favicon.  
* Click card to open new tab (option to jump to new tab when opening, control in footer).  
* Add new card manually with "Add" button in footer.  
* Delete all cards with "Delete All" button in footer.  
* Reorder cards by ctrl-clicking card, then use mouse to move card to a new position.  
* Hover over card to reveal EDIT button; click to open editing form.  
* Type in searchbar and hit ENTER to open new tab with google search results.  

## Installation
1. Open the Extension Management page by navigating to [chrome://extensions](chrome://extensions) (the Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions).  
2. Enable Developer Mode by clicking the toggle switch next to Developer mode.  
3. Click the LOAD UNPACKED button and select the "extension" directory of this project (ie: the directory with the manifest.json file).  