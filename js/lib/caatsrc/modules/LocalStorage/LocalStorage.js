/**
 * @author  Hyperandroid  ||  http://hyperandroid.com/
 *
 **/

(function() {
    /**
     * Local storage management.
     * @constructor
     */
    CAAT.modules.LocalStorage= function() {
        return this;
    };

    CAAT.modules.LocalStorage.prototype= {
        /**
         * Stores an object in local storage. The data will be saved as JSON.stringify.
         * @param key {string} key to store data under.
         * @param data {object} an object.
         * @return this
         *
         * @static
         */
        save : function( key, data ) {
            localStorage.setItem( key, JSON.stringify(data) );
            return this;
        },
        /**
         * Retrieve a value from local storage.
         * @param key {string} the key to retrieve.
         * @return {object} object stored under the key parameter.
         *
         * @static
         */
        load : function( key ) {
            return JSON.parse(localStorage.getItem( key ));
        },
        /**
         * Removes a value stored in local storage.
         * @param key {string}
         * @return this
         *
         * @static
         */
        remove : function( key ) {
            localStorage.removeItem(key);
            return this;
        }
    };

})();
