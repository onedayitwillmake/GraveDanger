/**
 * PackedCircleScene
 */
(function() {
	if(GRAVEDANGER.PackedCircleScene) {
		console.log("Don't exeest");
	};


	GRAVEDANGER.PackedCircleScene = function() {
		return this;
	};

	GRAVEDANGER.PackedCircleScene.prototype= {
		packedCirleManager: null,
		director:	null,
		scene:	null,
		root:	null,
		mousePosition: null,
		sineOffset: 1212, // some arbitary number i liked

		initDirector: function(director)
		{
			this.mousePosition = new CAAT.Point(director.canvas.width/2, director.canvas.height/2);
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
				total = 75;
			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = Math.random() * 25 + 9;

				// color it
				var	hue = (360-((i/total) * 90) ), // HSV uses 0 - 360
					hex = colorHelper.hsvToRgb(hue, 80, 99).toHex(); // Convert to hex value

				var circleActor = new CAAT.ShapeActor().create()
					.setShape( CAAT.ShapeActor.prototype.SHAPE_CIRCLE )
					.setLocation( Math.random() * director.canvas.width, Math.random() * director.canvas.height)
					.setSize(aRadius*2, aRadius*2) // Size is in diameters
					.setFillStyle('#' + hex );

				// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
				var packedCircle = new CAAT.modules.CircleManager.PackedCircle()
					.setDelegate(circleActor)
					.setRadius(aRadius)
					.setCollisionMask(1)	// packedCircle instnace - will collide against this group
					.setCollisionGroup(1) // packedCircle instance - is in this group
					.setTargetPosition(this.mousePosition)
					.setTargetChaseSpeed(Math.random() * 0.02);

				// disable mouse on specific circle
				packedCircle.mouseEnabled = false;

				this.animateInUsingScale(circleActor, director.time+Math.random() * 3000, 500, 0.1, 1);

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
			this.director.loop(60, function(director, delta){
				that.loop(director, delta);
			});
		},

		loop: function(director, delta)
		{
			this.packedCirleManager.pushAllCirclesTowardTarget();
			this.packedCirleManager.handleCollisions();
			this.sineOffset += 0.01;
			var circleList = this.packedCirleManager.allCircles,
				len = circleList.length;

			// color it
			var color = new CAAT.Color();
			var longestDistance = 40000 + Math.sin(this.sineOffset) * 30000;
			if(longestDistance < 0) longestDistance *= -1; // abs
			while(len--) {
				var packedCircle = circleList[len];
				var circleActor = packedCircle.delegate;
				var distanceFromTarget = packedCircle.position.getDistanceSquared(packedCircle.targetPosition);
				if(distanceFromTarget > longestDistance) distanceFromTarget = longestDistance;

				var amplitude = (distanceFromTarget / longestDistance);
				var	hue = 360 - (amplitude * 95);

				circleActor.x = packedCircle.position.x-packedCircle.radius;
				circleActor.y = packedCircle.position.y-packedCircle.radius;
			    // color
				circleActor.setFillStyle('#' + color.hsvToRgb(hue, 95, 99).toHex() );

				// Here we are doing an interesting trick.
				// By randomly changing the targetChaseSpeed +/- 0.002 randomly
				// we introduce a seemingly complex hive behavior whereby certain circles
				// seem to want to 'leave' sometimes, and others decide to force their way to the center more strongly
				if(Math.random() < 0.2)
					packedCircle.setTargetChaseSpeed(packedCircle.targetChaseSpeed + Math.random() * 0.004 - 0.002);
			}
		},

		initMouseEvents: function()
		{
			var that = this;

			// Listen for resize
			window.addEventListener("resize", function(e) {
				var edge = 10;
				that.director.canvas.width = window.innerWidth - edge*2;
				that.director.canvas.height = window.innerHeight - edge*2;
				that.scene.setBounds(0, 0, that.director.canvas.width, that.director.canvas.height);
			}, true);

			// listen for the mouse
			window.addEventListener("mousemove", function(e) {
				that.mouseMove(e);
			}, true);
		},

		initTouchEventRouter: function()
		{
			// [WebkitMobile] Convert iphone touchevent to mouseevent
			function touchEventRouter(event)
			{
				var touches = event.changedTouches,
						first = touches[0],
						type = "";

				switch (event.type)
				{
					case "touchstart": type = "mousedown"; break;
					case "touchmove": type = "mousemove"; break;
					case "touchend": type = "mouseup"; break;
					default: return;
				}

				var fakeMouseEvent = document.createEvent("MouseEvent");
				fakeMouseEvent.initMouseEvent(type, true, true, window, 1,
						first.screenX, first.screenY,
						first.clientX, first.clientY, false,
						false, false, false, 0/*left*/, null);

				first.target.dispatchEvent(fakeMouseEvent);
				event.preventDefault(); // Block iOS scrollview
			}

			// Catch iOS touch events
			document.addEventListener("touchstart", touchEventRouter, true);
			document.addEventListener("touchmove", touchEventRouter, true);
			document.addEventListener("touchend", touchEventRouter, true);
			document.addEventListener("touchcancel", touchEventRouter, true);
		},

		mouseMove: function(e) {
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
			scaleBehavior.setFrameTime( starTime, starTime+endTime );
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
