(function() {

	 GRAVEDANGER.EffectsDebris = {
		 create: function(ownerActor)
		 {
			 var rectangleActor = new CAAT.ShapeActor().create()
						.setShape( CAAT.ShapeActor.prototype.SHAPE_RECTANGLE )
						.setLocation( this.x + Math.random() * this.width, this.y)
						.setSize(5, 5)
						.setFillStyle('#ff0000');

				// path
				var path = new CAAT.LinearPath();
				path.setInitialPosition(ownerActor.x, ownerActor.y + 50);
				path.setFinalPosition(ownerActor.x, ownerActor.y + 350);

				var startTime = GRAVEDANGER.director.time + Math.random() * 2000,
					endTime = Math.random() * 2000;
				var startScale = 1,
					endScale = 0;

				 // setup up a path traverser for the path.
				var gravityBehavior = new CAAT.PathBehavior();
					gravityBehavior.setPath( path );
					gravityBehavior.setFrameTime(startTime, startTime);
					gravityBehavior.setInterpolator( new CAAT.Interpolator().createLinearInterpolator() );
				rectangleActor.addBehavior( gravityBehavior );

				// scale to zero as falling
				var scaleBehavior = new CAAT.ScaleBehavior();
					rectangleActor.scaleX = rectangleActor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
					scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
					scaleBehavior.setFrameTime( startTime, endTime );
					scaleBehavior.setInterpolator( new CAAT.Interpolator().createLinearInterpolator() );
				rectangleActor.addBehavior(scaleBehavior);


				// when scale Behavior finishes, start rotation Behavior.
				var that = this;
				var randFloat = GRAVEDANGER.UTILS.randomFloat;
				var randInt = GRAVEDANGER.UTILS.randomInt;

				// TODO: Hack - storing pointer to scaleBehavior inside grav behavior
				gravityBehavior.path = path;
				gravityBehavior.ownerActor = ownerActor;
				gravityBehavior.scaleBehavior = scaleBehavior;
				gravityBehavior.addListener( {
					behaviorExpired : function(behavior, time, actor)
					{
						var centerX = behavior.ownerActor.x + behavior.ownerActor.width * 0.5,
							centerY = behavior.ownerActor.y + behavior.ownerActor.height * 0.5 + 75 + Math.random() * 50;

						var startX = randFloat(centerX-75, centerX+75),
							startY = randFloat(centerY-20, centerY+20);
						var startScale = randFloat(1, 1.5);

						var startTime = time + randFloat(0, 50),
							endTime = 300 + randFloat(300, 700);


						// Reset
						behavior.path.setInitialPosition(startX, startY);
						behavior.path.setFinalPosition(startX, startY + randFloat(75, 150) );
						behavior.scaleBehavior.startScaleX = behavior.scaleBehavior.startScaleY = startScale;


						// Set rect to initial values
						actor.scaleX = actor.scaleY = startScale;
						actor.x = startX;
						actor.y = startY;

						// Restart the behaviors
						behavior.scaleBehavior.setFrameTime(startTime, endTime);
						behavior.setFrameTime(startTime, endTime );

				}});

			 return rectangleActor;
		 },

		dealloc: function(aGravityBehavior)
		{
			aGravityBehavior.scaleBehavior.setOutOfFrameTime();
			aGravityBehavior.scaleBehavior.setDiscardable(true);

			// remove references
			aGravityBehavior.scaleBehavior = null;
			aGravityBehavior.path = null;
			aGravityBehavior.ownerActor = null;

			// buh bye
			aGravityBehavior.setOutOfFrameTime();
			aGravityBehavior.setDiscardable(true);
		}
	 }
})();