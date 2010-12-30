(function() {

	// SINGLETON
	var imageName = "chain",
	imageRef = null,
	conpoundImage = null;

	GRAVEDANGER.EffectsChainAnnounce = function() {
	 return this;
	};


	GRAVEDANGER.EffectsChainAnnounce.prototype = {
		create: function(anActor, chainCount)
		{
			imageRef = imageRef || GRAVEDANGER.director.getImage(imageName);
			conpoundImage = conpoundImage || new CAAT.CompoundImage().initialize(imageRef, 8, 1);

			var actor = new CAAT.SpriteActor()
				.create()
				.setSpriteImage(conpoundImage);
			actor.spriteIndex = chainCount;

			var startX = anActor.x + anActor.width*0.5 + GRAVEDANGER.UTILS.randomInt(8, 15),
				startY = anActor.y-5;
			actor.setLocation(startX, startY);

			var behaviorContainer = new CAAT.ContainerBehavior();
			behaviorContainer.setFrameTime(GRAVEDANGER.scene.time, 500);

			// Alpha behavior
			var ab= new CAAT.AlphaBehavior();
			ab.setFrameTime( 400, 200 );
			ab.startAlpha= 1;
			ab.endAlpha= 0;
			behaviorContainer.addBehavior(ab);

			// Scale behavior
			var scaleBehavior = new CAAT.ScaleBehavior();
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			actor.scaleX = actor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = 0.2;  // Fall from the 'sky' !
			scaleBehavior.endScaleX = scaleBehavior.endScaleY = 1;
			scaleBehavior.setFrameTime( 0, GRAVEDANGER.UTILS.randomInt(200, 400));
			scaleBehavior.setCycle(false);
			scaleBehavior.setInterpolator( new CAAT.Interpolator().createExponentialOutInterpolator(2, false));
			behaviorContainer.addBehavior(scaleBehavior);

			var tb= new CAAT.PathBehavior();
			tb.setFrameTime( 0, 600 );
			tb.setPath(
					new CAAT.Path().setLinear(
							startX, startY,
							startX, startY - GRAVEDANGER.UTILS.randomInt(20, 30)) );
			behaviorContainer.addBehavior(tb);

			behaviorContainer.addListener(
			{
				behaviorExpired: function(behavior, time, actor) {
					actor.discardable = true;
					actor.setExpired(true);
				}
			});



			actor.addBehavior(behaviorContainer);
			return actor;
		},

		dealloc: function(aGravityBehavior)
		{

		}
	 }
})();
