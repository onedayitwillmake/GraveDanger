/**
 * @author  Hyperandroid  ||  http://hyperandroid.com/
 *
 * Image/Resource preloader.
 *
 *
 **/


(function() {
    /**
     * This class is a image resource loader. It accepts an object of the form:
     *
     * {
     *   id1: string_url1,
     *   id2: string_url2,
     *   id3: string_url3,
     *   ...
     * }
     *
     * and on resources loaded correctly, will return an object of the form:
     *
     * {
     *   id1: HTMLImageElement,
     *   id2: HTMLImageElement,
     *   id3: HTMLImageElement,
     *   ...
     * }
     *
     * @constructor
     */
    CAAT.ImagePreloader = function()   {
        this.images = new Array();
        return this;
    };

    CAAT.ImagePreloader.prototype =   {

        images:                 null,   // a list of elements to load
        notificationCallback:   null,   // notification callback invoked for each image loaded.
        imageCounter:           0,      // elements counter.

        /**
         * Start images loading asynchronous process. This method will notify every image loaded event
         * and is responsibility of the caller to count the number of loaded images to see if it fits his
         * needs.
         * 
         * @param aImages {{ id:{url}, id2:{url}, ...} an object with id/url pairs.
         * @param callback_loaded_one_image {function( imageloader {CAAT.ImagePreloader}, counter {number}, images {{ id:{string}, image: {Image}}} )}
         * function to call on every image load.
         */
        loadImages: function( aImages, callback_loaded_one_image ) {
            var me= this;
            this.notificationCallback = callback_loaded_one_image;
            this.images= [];
            for( var i=0; i<aImages.length; i++ ) {
                this.images.push( {id:aImages[i].id, image: new Image() } );
                this.images[i].image.onload = function imageLoaded() {
                    me.imageCounter++;
                    me.notificationCallback.call(this, me.imageCounter, me.images);
                };
                this.images[i].image.src= aImages[i].url;
            }
        }

    };
})();