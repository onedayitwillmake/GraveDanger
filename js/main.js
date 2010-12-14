require(['lib/caat', 'lib/Stats'], function()
{
	require.ready(function()
	{

		var director = new CAAT.Director().initialize(900, 600);


		initWithDirector(director);
		// Insert canvas into HTML
		$(director.canvas).appendTo(  $('body') );
		director.loop(60);
		/**
		 * Stats
		 * Create stats module, and attach to top left
		 */
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		$(stats.domElement).appendTo( $('body') );
		setInterval( function () {
			stats.update();
		}, 1000 / 30 );
	})
});

function initWithDirector(director)
{
	var scene = new CAAT.Scene().create();

	for(var i = 0; i < 50; i++)
	{
		var circle = new CAAT.ShapeActor().create();
		circle.setShape( CAAT.ShapeActor.prototype.SHAPE_RECTANGLE ).
				setLocation( Math.random() * director.canvas.width, Math.random() * director.canvas.height).
				setSize(60,60).
				setFillStyle('#ff00ff').
				setStrokeStyle('#00ff00');

		var alphaBehavior = new CAAT.AlphaBehavior();
		alphaBehavior.startAlpha = 1.0;
		alphaBehavior.endAlpha = 0.1;
		alphaBehavior.setFrameTime(Math.random() * 500, Math.random() * 5000 + 500);

		circle.addBehavior(alphaBehavior);

		scene.addChild(circle);
	}

	director.addScene(scene);
}