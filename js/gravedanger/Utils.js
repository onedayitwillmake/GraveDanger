/**
 File:
 	QueryStringManager
 Created By:
	 Adam Kirschner
 Project	:
 	Ogilvy Holiday Card 2010
 Abstract:
 	Retrieve and set the query string
 Basic Usage:

 */
(function() {
	// Singleton
	GRAVEDANGER.UTILS =
	{
		randomFromArray: function(anArray) {
			var randomIndex = Math.floor( Math.random() * anArray.length );
		    return anArray[randomIndex];
		},

		/**
		 * Returns a random float
		 * @param {Number} min	Minimum value
		 * @param {Number} max	Maxmimum value
		 */
		randomFloat: function(min, max) {
		   return Math.random() * (max-min)  + min;
		},

		/**
		 * Returns a random integer
		 * DRY Principal o
		 * @param {Number} min	Minimum value
		 * @param {Number} max	Maxmimum value
		 */
		randomInt: function(min, max) {
		   return Math.round( Math.random() * (max-min)  + min );
		}
	};
})();