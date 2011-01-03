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
		imagesToLoad.push({id: "island" + GRAVEDANGER.Circle.prototype.GROUPS.GREEN, url: base + "island_green.png"});
		imagesToLoad.push({id: "island" + GRAVEDANGER.Circle.prototype.GROUPS.BLUE, url: base + "island_blue.png"});
		// Chains
		imagesToLoad.push({id: "chain" + GRAVEDANGER.Circle.prototype.GROUPS.RED, url: base + "chain_blue.png"});
		imagesToLoad.push({id: "chain" + GRAVEDANGER.Circle.prototype.GROUPS.GREEN, url: base + "chain_blue.png"});
		imagesToLoad.push({id: "chain" + GRAVEDANGER.Circle.prototype.GROUPS.BLUE, url: base + "chain_blue.png"});
		// HUD
		imagesToLoad.push({id: "hud_timeleft", url: base + "hud/timeleft.png"});
		imagesToLoad.push({id: "hud_timeleftMasker", url: base + "hud/timeleft_masker.png"});

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
		// Game size - focus on iphone
		var gameWidth = 320*2,
			gameHeight = 356*2;

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

		// Initialize CAAT
		GRAVEDANGER.CAATHelper.setContainerDiv(container);	//	Store reference to container div, used when creating events within a scenes
		GRAVEDANGER.CAATHelper.setGameDimensions(gameWidth, gameHeight);

		var director = new CAAT.Director();
		GRAVEDANGER.CAATHelper.setDirector( director );

		// If we aren't using canvas, i believe CAAT is still needs one, so create a canvas that is 1 pixel in size
		if(useCanvas) {
			director.initialize(gameWidth, gameHeight);
			// Add it to the document
			container.appendChild( director.canvas );
		} else {
			director.initializeNoCanvas(gameWidth, gameHeight);
		}

		// Place image cache back into director
		director.imagesCache = GRAVEDANGER.CAATHelper.imagePreloader.images;
		CAAT.GlobalDisableEvents();

		GRAVEDANGER.CAATHelper.initTouchEventRouter();		//	Map touch events to mouse events

		// Create the packedCircleScene
		var packedCircleScene = new GRAVEDANGER.PackedCircleScene();
		packedCircleScene.init();

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