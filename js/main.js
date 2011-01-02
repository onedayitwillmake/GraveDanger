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

	/**
	 * Loads all game assets
	 * TODO: Move to own class
	 */
	function preloadImages()
	{
		var base = './images/game/';
		var imagesToLoad = [];

		// HEADS
		imagesToLoad.push({id: "heads" + GRAVEDANGER.Circle.prototype.GROUPS.RED, url: base + "heads_red.png"});
		imagesToLoad.push({id: "heads" + GRAVEDANGER.Circle.prototype.GROUPS.GREEN, url: base + "heads_yellow.png"});
		imagesToLoad.push({id: "heads" + GRAVEDANGER.Circle.prototype.GROUPS.BLUE, url: base + "heads_blue.png"});
		// ISLANDS
		imagesToLoad.push({id: "island" + GRAVEDANGER.Circle.prototype.GROUPS.RED, url: base + "island_red.png"});
		imagesToLoad.push({id: "island" + GRAVEDANGER.Circle.prototype.GROUPS.GREEN, url: base + "island_red.png"});
		imagesToLoad.push({id: "island" + GRAVEDANGER.Circle.prototype.GROUPS.BLUE, url: base + "island_red.png"});
		// Chains
		imagesToLoad.push({id: "chain" + GRAVEDANGER.Circle.prototype.GROUPS.RED, url: base + "chain_blue.png"});
		imagesToLoad.push({id: "chain" + GRAVEDANGER.Circle.prototype.GROUPS.GREEN, url: base + "chain_blue.png"});
		imagesToLoad.push({id: "chain" + GRAVEDANGER.Circle.prototype.GROUPS.BLUE, url: base + "chain_blue.png"});

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
		var useCanvas = !GRAVEDANGER.CAATHelper.getIsIOS();

		// Override above if query string provided
		if( window.QueryStringManager.getValue('useCanvas') )
			useCanvas = Boolean(window.QueryStringManager.getValue('useCanvas')); // dev

		// Store the final result
		GRAVEDANGER.CAATHelper.setUseCanvas( useCanvas );

		if(window.QueryStringManager.getValue('useCanvas')) {
			console.log("UseCanvas:", useCanvas)
		}

		// Pointer to container
		var container = document.getElementById('gameArea');

		// Game size - focus on iphone
		var gameWidth = 320*2,
			gameHeight = 356*2;

		// Initialize CAAT
		GRAVEDANGER.CAATHelper.setGameDimensions(gameWidth, gameHeight);

		GRAVEDANGER.director = new CAAT.Director();

		// If we aren't using canvas, i believe CAAT is still needs one, so create a canvas that is 1 pixel in size
		if(useCanvas) {
			GRAVEDANGER.director.initialize(gameWidth, gameHeight);

			// Add it to the document
			container.appendChild( GRAVEDANGER.director.canvas );
		} else {
			GRAVEDANGER.director.initializeNoCanvas(gameWidth, gameHeight);
		}

		container.style['width'] = gameWidth + "px";
		container.style['height'] = gameHeight + "px";

		// Place image cache back into director
		GRAVEDANGER.director.imagesCache = GRAVEDANGER.CAATHelper.imagePreloader.images;

		CAAT.GlobalDisableEvents();


		GRAVEDANGER.CAATHelper.initTouchEventRouter();		//	Map touch events to mouse events
		GRAVEDANGER.CAATHelper.setContainerDiv(container);	//	Store reference to container div, used when creating events within a scenes

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