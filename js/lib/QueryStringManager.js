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
	var _queryString = {};

	// TODO: Place into something, should not be global but does not belong in GRAVEDANGER namespace, so for now its global

	// Singleton
	window.QueryStringManager =
	{
		init: function()
		{
			// Always be a good neighbor, and remove event listeners -
			window.removeEventListener('load', window.QueryStringManager.init, false);

			if( location.search && location.search.length > 0 )
			{
				var splitPair = location.search.substring(1).split("&"),
					i = splitPair.length;

				while(i--)
				{
					var splitPiece = splitPair[i].split("="),
						name = splitPiece[0].trim(),
						value = decodeURI( splitPiece.length > 1 ? splitPiece[1].trim() : "" );

					_queryString[ name ] = value;
				}
			}

			console.log("(QueryStringManager) - QueryStringObject:", _queryString);
		},

		getQueryString: function( name )
		{
			return _queryString[ name ];
		},

		hasQueryString: function( name )
		{
			return name in _queryString;
		}
	};

	// Listen for browser ready
	window.addEventListener('load', window.QueryStringManager.init, false);
})();