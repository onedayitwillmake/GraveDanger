/**
 * Entry point for the game
 */
(function ()
{
	function onDocumentReady()
	{
		// Always be a good neighbor, remove event listeners, even when superflous
		window.removeEventListener('load', onDocumentReady, false);

		// Initialize CAAT
		GRAVEDANGER.director = new CAAT.Director().initialize(window.innerWidth - 20, window.innerHeight - 20);
		CAAT.GlobalDisableEvents();

		// Add it to the document
		var container = document.getElementById('container');
		container.appendChild(GRAVEDANGER.director.canvas);

		// Create the packedCircleScene
		var packedCircleScene = new GRAVEDANGER.PackedCircleScene();
		packedCircleScene.initDirector(GRAVEDANGER.director);
		packedCircleScene.initMouseEvents();
		packedCircleScene.initTouchEventRouter();
		// Start it up
		packedCircleScene.start();
	}

	// Listen for browser ready
	window.addEventListener('load', onDocumentReady, false);
})();