/**
 * Entry point for the game
 */
(function ()
{
	function onDocumentReady()
	{
		// Always be a good neighbor, remove event listeners, even when superflous
		window.removeEventListener('load', onDocumentReady, false);

		initConsoleRouter();

		// Initialize CAAT
		GRAVEDANGER.director = new CAAT.Director().initialize(window.innerWidth - 20, window.innerHeight - 20);
		GRAVEDANGER.CAATHelper.prototype.initTouchEventRouter();
		CAAT.GlobalDisableEvents();

		// Add it to the document
		var container = document.getElementById('container');
		container.appendChild( GRAVEDANGER.director.canvas );

		// Create the packedCircleScene
		var packedCircleScene = new GRAVEDANGER.PackedCircleScene();
		packedCircleScene.init(GRAVEDANGER.director);

		// Start it up
		packedCircleScene.start();
	}

	function initConsoleRouter()
	{
		if (!window.console || !console.firebug)
		{
			if(console) return;
			var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
			"group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

			window.console = {};
			for (var i = 0; i < names.length; ++i)
				window.console[names[i]] = function() {}
		}
	}

	// Listen for browser ready
	window.addEventListener('load', onDocumentReady, false);
})();