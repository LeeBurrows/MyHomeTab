/**
 * Class representing a bookmark
 */
export default class Bookmark {
    /**
     * Create a bookmark.
     * 
     * @param {string} id - Unique identifier
     * @param {string} url - The URL value
     * @param {string} title - The bookmark title
     * @param {string} iconUrl - Th path to icon image
     */
    constructor(id, url, title, iconUrl) {
        this.id = id;
        this.url = url || '';
        this.title = title || '';
        this.iconUrl = iconUrl || '';
    }
}