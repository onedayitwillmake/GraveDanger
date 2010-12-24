require(['lib/caat', 'lib/Stats'], function()
{
	require.ready(function()
	{

		var director = new CAAT.Director().initialize(900, 600);
		initWithDirector(director);
		// Insert canvas into HTML
		$(director.canvas).appendTo(  $('body') );
		director.loop(60);
	})
});

function initWithDirector(director)
{
	var scene = new CAAT.Scene().create();

	for(var i = 0; i < 50; i++)
	{
		var rectangleActor = new CAAT.ShapeActor().create();
		rectangleActor.setShape( CAAT.ShapeActor.prototype.SHAPE_RECTANGLE ).
				setLocation( Math.random() * director.canvas.width, Math.random() * director.canvas.height).
				setSize(60,60).
				setFillStyle('#ff00ff').
				setStrokeStyle('#ff0000');


		var scaleBehavior = animateInUsingScale(rectangleActor, Math.random() * 1000, 1200, Math.random() * 5, 0);
		scaleBehavior.setCycle(true);
		scaleBehavior.setPingPong(true);
		scene.addChild(rectangleActor);
	}

	director.addScene(scene);
}

/**
 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
 */
function animateInUsingScale(actor, starTime, endTime, startScale, endScale)
{
   var scaleBehavior = new CAAT.ScaleBehavior();
	scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
	actor.scaleX = actor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
	scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
	scaleBehavior.setFrameTime( starTime, endTime );
	scaleBehavior.setCycle(false);
	scaleBehavior.setInterpolator( new CAAT.Interpolator().createBounceOutInterpolator(false) );
	actor.addBehavior(scaleBehavior);

	return scaleBehavior;
}

/**
 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
 */
function animateInUsingAlpha(actor, starTime, endTime, startAlpha, endAlpha)
{
   var fadeBehavior = new CAAT.AlphaBehavior();
	fadeBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
	actor.alpha = fadeBehavior.startAlpha = startAlpha;
	fadeBehavior.endAlpha = endAlpha;
	fadeBehavior.setFrameTime( starTime, endTime );
	fadeBehavior.setCycle(false);
	fadeBehavior.setInterpolator( new CAAT.Interpolator().createExponentialOutInterpolator(2, false) );
	actor.addBehavior(fadeBehavior);

	return fadeBehavior;
}