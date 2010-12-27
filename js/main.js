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

		preloadImages();
	}

	function preloadImages()
	{
		var base = './images/';
		var imagesToLoad = [];
		imagesToLoad.push({id: "heads" + GRAVEDANGER.Circle.prototype.GROUPS.BLUE, url: base + "blue.png"});
		imagesToLoad.push({id: "island", url: base + "float2.png"});

		GRAVEDANGER.CAATHelper.imagePreloader = new CAAT.ImagePreloader();
		// Fired when images have been preloaded
		var that = this;
		GRAVEDANGER.CAATHelper.imagePreloader.loadImages(imagesToLoad,
			function(counter, images) {
				if(counter != images.length) return; // Wait until last load

				// Images ready!
				onCAATReady();
			});
	}

	function onCAATReady()
	{
		// Initialize CAAT
		GRAVEDANGER.director = new CAAT.Director().initialize(window.innerWidth - 20, window.innerHeight - 20);
		GRAVEDANGER.director.imagesCache = GRAVEDANGER.CAATHelper.imagePreloader.images;

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

	/**
	 * Catches calls to console::* to prevent errors
	 */
	function initConsoleRouter()
	{
		if (!window.console || !console.firebug)
		{
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