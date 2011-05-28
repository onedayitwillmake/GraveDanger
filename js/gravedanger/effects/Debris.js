(function() {
	 GRAVEDANGER.EffectsDebris = function() {
		 this.delegate = null;
		 this.actor = null;
	 };

	GRAVEDANGER.EffectsDebris.prototype = {
		delegate: null,
		actor: null,
		color: 0x00000,

		create: function(ownerActor, aColor)
		{
			this.delegate = ownerActor;
			this.actor = new CAAT.ShapeActor().create()
					.setShape( CAAT.ShapeActor.prototype.SHAPE_RECTANGLE )
					.setLocation( -10, -100)
					.setSize(6,6);
			this.setColor( aColor );


			// path
			var path = new CAAT.LinearPath();
			path.setInitialPosition(ownerActor.x, ownerActor.y + 50);
			path.setFinalPosition(ownerActor.x, ownerActor.y + 350);

			var startTime = GRAVEDANGER.director.time + Math.random() * 2000,
				endTime = 1;
			var startScale = 1,
				endScale = 0;

			 // setup up a path traverser for the path.
			var gravityBehavior = new CAAT.PathBehavior();
				gravityBehavior.setPath( path );
				gravityBehavior.setFrameTime(startTime, startTime);
				gravityBehavior.setInterpolator( new CAAT.Interpolator().createLinearInterpolator(false, false));
			this.actor.addBehavior( gravityBehavior );

			// scale to zero as falling
			var scaleBehavior = new CAAT.ScaleBehavior();
				this.actor.scaleX = this.actor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
				scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
				scaleBehavior.setFrameTime( startTime, endTime );
				scaleBehavior.setInterpolator( new CAAT.Interpolator().createLinearInterpolator(false, false));
			this.actor.addBehavior(scaleBehavior);


			// Hide at first
		//			 	rectangleActor.scaleX = rectangleActor.scaleY = 0;
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

					var startX = randFloat(centerX-behavior.ownerActor.width*0.45, centerX+behavior.ownerActor.width*0.45),
						startY = randFloat(centerY-40, centerY+10);
					var startScale = randFloat(1, 1.5);

					var startTime = time;// + randFloat(0, 50),
						endTime = 200 + randFloat(200, 600);

					// Reset
					behavior.path.setInitialPosition(startX, startY);
					behavior.path.setFinalPosition(startX, startY + randFloat(50, 100) );
					behavior.scaleBehavior.startScaleX = behavior.scaleBehavior.startScaleY = startScale;


					// Set rect to initial values
					actor.scaleX = actor.scaleY = startScale;
					actor.x = startX;
					actor.y = startY;

					// Restart the behaviors
					behavior.scaleBehavior.setFrameTime(startTime, endTime);
					behavior.setFrameTime(startTime, endTime );

			}});

		 return this;
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
		},

///// ACCESSORS
		getActor: function()
		{
			return this.actor;
		},

		setColor: function(aColor)
		{
			this.color = aColor;

			// Convert to RGB String
			var rgbColor = GRAVEDANGER.Island.prototype.DEBRIS_COLORS[this.color],
				colorRGBAString = rgbColor.toRGBAString(0.9);

			this.actor.setFillStyle(colorRGBAString);
		}
	 }
})();