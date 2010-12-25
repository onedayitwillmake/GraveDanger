require(['lib/caat', 'lib/Stats'], function()
{
	require.ready(function()
	{
		var director = new CAAT.Director().initialize(900, 600);
		// Insert into HTML
		$(director.canvas).appendTo(  $('body') );

		// Start our scene created below
		var packedCircleScene = new PackedCircleScene();
		packedCircleScene.initWithDirector(director);
		packedCircleScene.start();

		CAAT.GlobalDisableEvents();
		// listen for the mouse
		window.addEventListener("mousemove", function(e) {
			packedCircleScene.mouseMove(e);
		}, true);
	})
});

(function() {
	PackedCircleScene = function() {
		return this;
	};

	PackedCircleScene.prototype= {
		packedCirleManager: null,
		director:	null,
		scene:	null,
		root:	null,
		mousePosition: null,

		initWithDirector: function(director)
		{
			this.mousePosition = new CAAT.Point(0, 0);
			this.director = director;
			this.scene = new CAAT.Scene().
				create();
			this.root = new CAAT.ActorContainer().
				create().
				setBounds(0,0, director.canvas.width, director.canvas.height);

			this.scene.addChild( this.root );

			// Collision simulation
			this.packedCirleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCirleManager.setBounds(0, 0, director.width, director.height);
			this.packedCirleManager.setNumberOfCollisionPasses(2);
			this.packedCirleManager.setNumberOfTargetingPasses(1);

			// Create a bunch of circles!
			var colorHelper = new CAAT.Color(),
				rgb = new CAAT.Color.RGB(0, 0, 0),
				total = 100;
			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = Math.random() * 23 + 10;

				// color it
				var	hue = (((i/total) * 90) ), // HSV uses 0 - 360
					hex = colorHelper.hsvToRgb(hue, 99, 99).toHex(); // Convert to hex value

				var circleActor = new CAAT.ShapeActor().create();
				circleActor.setShape( CAAT.ShapeActor.prototype.SHAPE_CIRCLE ).
						setLocation( Math.random() * director.canvas.width, Math.random() * director.canvas.height).
						setSize(aRadius*2, aRadius*2). // Size is in diameters
						setFillStyle('#' + hex );

				// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
				var packedCircle = new CAAT.modules.CircleManager.PackedCircle();
				packedCircle.setDelegate(circleActor);
				packedCircle.setRadius(aRadius);
				packedCircle.setCollisionMask(1);	// packedCircle instnace - will collide against this group
				packedCircle.setCollisionGroup(1);	// packedCircle instance - is in this group
				packedCircle.setTargetPosition(this.mousePosition);
				packedCircle.setTargetChaseSpeed(Math.random() * 0.02);
				packedCircle.mouseEnabled = false;

				// Add to the collision simulation
				this.packedCirleManager.addCircle(packedCircle);

				// Add actor to the scene
				this.root.addChild(circleActor);
			}

			this.root.mouseEnabled = this.scene.mouseEnabled = false;
			this.director.addScene(this.scene);

			// Force all packedCircles to move to the position of their delegates
			this.packedCirleManager.forceCirclesToMatchDelegatePositions();
		},

		start: function()
		{
			var that = this;
			this.director.loop(60, function(){
				that.loop();
			});
		},

		loop: function()
		{
			this.packedCirleManager.pushAllCirclesTowardTarget();
			this.packedCirleManager.handleCollisions();
			var circleList = this.packedCirleManager.allCircles,
				len = circleList.length;

			while(len--) {
				var packedCircle = circleList[len],
					circleActor = packedCircle.delegate;

				circleActor.x = packedCircle.position.x-packedCircle.radius;
				circleActor.y = packedCircle.position.y-packedCircle.radius;

				// Here we are doing an interesting trick.
				// By randomly changing the targetChaseSpeed +/- 0.002 randomly
				// we introduce a seemingly complex hive behavior whereby certain circles
				// seem to want to 'leave' sometimes, and others decide to force their way to the center more strongly
				if(Math.random() < 0.2)
					packedCircle.setTargetChaseSpeed(packedCircle.targetChaseSpeed + Math.random() * 0.004 - 0.002);
			}
		},

		mouseMove: function(e) {
			//var canvasMousePosition = CAAT.getCanvasCoord(CAAT.mousePoint, e);
			var mouseX = e.clientX;
			var mouseY = e.clientY;
			this.mousePosition.set(mouseX, mouseY);
		},

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 */
		animateInUsingScale: function(actor, starTime, endTime, startScale, endScale)
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
		},

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 */
		animateInUsingAlpha: function(actor, starTime, endTime, startAlpha, endAlpha)
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
	}
})();
