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

		initStats();
		preloadImages();
	}

	/**
	* Stats
	* Create stats module, and attach to top left
	*/
	function initStats()
	{
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		document.body.appendChild( stats.domElement );
		setInterval( function () {
			stats.update();
		}, 1000 / 30 );
	}

	function preloadImages()
	{
		var base = './images/';
		var imagesToLoad = [];
		imagesToLoad.push({id: "heads" + GRAVEDANGER.Circle.prototype.GROUPS.RED, url: base + "red.png"});
		imagesToLoad.push({id: "heads" + GRAVEDANGER.Circle.prototype.GROUPS.GREEN, url: base + "yellow.png"});
		imagesToLoad.push({id: "heads" + GRAVEDANGER.Circle.prototype.GROUPS.BLUE, url: base + "blue.png"});
		imagesToLoad.push({id: "island", url: base + "float2.png"});

		GRAVEDANGER.CAATHelper.imagePreloader = new CAAT.ImagePreloader();
		// Fired when images have been preloaded
		var that = this;
		GRAVEDANGER.CAATHelper.imagePreloader.loadImages(imagesToLoad,
			function(counter, images)
			{
				if(counter != images.length)
					return; // Wait until last load

				// Images ready!
				onCAATReady();
			});
	}

	function onCAATReady()
	{
		// Don't use CANVAS if iOS
		GRAVEDANGER.CAATHelper.prototype.setUseCanvas( !GRAVEDANGER.CAATHelper.prototype.getIsIOS() );
		var useCanvas = GRAVEDANGER.CAATHelper.prototype.getUseCanvas();
		useCanvas = false; // dev

		// Pointer to container
		var container = document.getElementById('container');

		// Initialize CAAT
		GRAVEDANGER.director = new CAAT.Director();

		// Game size - focus on iphone
		var gameWidth = 320*2,
			gameHeight = 356*2;

		// If we aren't using canvas, i believe CAAT is still needs one, so create a canvas that is 1 pixel in size
		if(useCanvas)
		{
			GRAVEDANGER.director.initialize(gameWidth, gameHeight);

			// Add it to the document
			container.appendChild( GRAVEDANGER.director.canvas );
		}
		else
		{
			GRAVEDANGER.director.initializeNoCanvas(gameWidth, gameHeight);
		}

		GRAVEDANGER.director.imagesCache = GRAVEDANGER.CAATHelper.imagePreloader.images;
		GRAVEDANGER.CAATHelper.prototype.initTouchEventRouter();
		CAAT.GlobalDisableEvents();

		// Store reference
		GRAVEDANGER.CAATHelper.prototype.setContainerDiv(container);

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
		if(window.console) return;

		var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
			"group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

		window.console = {};
		for (var i = 0; i < names.length; ++i)
			window.console[names[i]] = function() {}
	}

	// Listen for browser ready
	window.addEventListener('load', onDocumentReady, false);
})();