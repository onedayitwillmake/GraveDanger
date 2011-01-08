(function() {

	// SINGLETON
	var __CONPOUND_IMAGES = {};

	GRAVEDANGER.EffectsChainAnnounce = function() {
	 return this;
	};


	GRAVEDANGER.EffectsChainAnnounce.prototype = {
		create: function(anActor, chainCount)
		{
			this.color = anActor.delegate.color;

			var actor = new CAAT.SpriteActor()
				.create()
				.setSpriteImage(this.getImage());
			actor.spriteIndex = chainCount;

			var startX = anActor.x;// + anActor.width*0.5;// + GRAVEDANGER.UTILS.randomInt(20, 15),
				startY = anActor.y-10;
			actor.setLocation(startX, startY);

			var behaviorContainer = new CAAT.ContainerBehavior();
			behaviorContainer.setFrameTime(GRAVEDANGER.CAATHelper.currentScene.time, 500);

			// Alpha behavior
			var ab= new CAAT.AlphaBehavior();
			ab.setFrameTime( 400, 300 );
			ab.startAlpha= 1;
			ab.endAlpha= 0;
			behaviorContainer.addBehavior(ab);

			// Scale behavior
			var scaleBehavior = new CAAT.ScaleBehavior();
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			actor.scaleX = actor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = 0;  // Fall from the 'sky' !
			scaleBehavior.endScaleX = scaleBehavior.endScaleY = 0.75;
			scaleBehavior.setFrameTime( 0, 500);
			scaleBehavior.setCycle(false);
			scaleBehavior.setInterpolator( new CAAT.Interpolator().createExponentialOutInterpolator(2, false));
			behaviorContainer.addBehavior(scaleBehavior);

			var tb= new CAAT.PathBehavior();
			tb.setFrameTime( 0, 700 );
			tb.setPath(
					new CAAT.Path().setLinear(
							startX, startY,
							startX, startY - GRAVEDANGER.UTILS.randomInt(20, 30)) );
			behaviorContainer.addBehavior(tb);

			behaviorContainer.addListener(
			{
				behaviorExpired: function(behavior, time, actor) {
					actor.setExpired(true);
					actor.setDiscardable(true);
				}
			});



			actor.addBehavior(behaviorContainer);
			return actor;
		},

		getImage: function()
		{
			var imageName = "chain" + this.color;

			// Reuse one already made
			if(__CONPOUND_IMAGES[imageName])
				return __CONPOUND_IMAGES[imageName];

			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.compoundImage = new CAAT.CompoundImage().initialize(imageRef, 8, 1);

			// Store for next
			__CONPOUND_IMAGES[imageName]  = this.compoundImage;
			return this.compoundImage;
		},

		dealloc: function(aGravityBehavior)
		{

		}
	 }
})();
