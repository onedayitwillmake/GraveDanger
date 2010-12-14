require(['lib/caat', 'lib/Stats'], function()
{
	require.ready(function()
	{

		var director = new CAAT.Director().initialize(100, 100);
		var scene = new CAAT.Scene().create();
		var circle = new CAAT.ShapeActor().create();
		circle.setLocation(20, 20).
				setSize(60,60).
				setFillStyle('#ff00ff').
				setStrokeStyle('#00ff00');

		scene.addChild(circle);
		director.addScene(scene);


		// Insert canvas into HTML
		$(director.canvas).appendTo(  $('body') );
		director.loop(1);
		/**
		 * Stats
		 * Create stats module, and attach to top left
		 */
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
//		$(stats.domElement).appendTo( $('body') );
		setInterval( function () {
			stats.update();
		}, 1000 / 30 );
	})
});