/**
 * PackedCircleScene
 */
(function() {
	GRAVEDANGER.PackedCircleScene = function() {
		return this;
	};

	GRAVEDANGER.PackedCircleScene.prototype= {
		packedCirleManager: null,
		director:	null,
		scene:	null,
		circleLayer:	null,
		mousePosition: null,
		sineOffset: Math.random() * 10, // some arbitary number i liked

		init: function(director)
		{
			this.initDirector(director);
			this.initCircles();
			this.initMouseEvents();
		},

		initDirector: function(director)
		{
			this.mousePosition = new CAAT.Point(director.canvas.width/2, director.canvas.height/2);
			this.director = director;
			this.scene = new CAAT.Scene().
				create();

			// Create a 'layer' for all the circles
			this.circleLayer = new CAAT.ActorContainer().
				create().
				setBounds(0,0, director.canvas.width, director.canvas.height);
			this.scene.addChild( this.circleLayer );

			// Collision simulation
			this.packedCirleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCirleManager.setBounds(0, 0, director.width, director.height);
			this.packedCirleManager.setNumberOfCollisionPasses(2);
			this.packedCirleManager.setNumberOfTargetingPasses(1);

			// Add to the director
			this.circleLayer.mouseEnabled = this.scene.mouseEnabled = false;
			this.director.addScene(this.scene);
		},

		initCircles: function()
		{
			// Create a bunch of circles!
			var colorHelper = new CAAT.Color(),
				rgb = new CAAT.Color.RGB(0, 0, 0),
				total = 75;

//			var groups
			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = Math.random() * 25 + 9;

				// color it
				var	hue = (360-((i/total) * 90) ), // HSV uses 0 - 360
					hex = colorHelper.hsvToRgb(hue, 80, 99).toHex(); // Convert to hex value

				var circleActor = new CAAT.ShapeActor().create()
					.setShape( CAAT.ShapeActor.prototype.SHAPE_CIRCLE )
					.setLocation( Math.random() * this.director.canvas.width, Math.random() * this.director.canvas.height)
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

				GRAVEDANGER.CAATHelper.prototype.animateInUsingScale(circleActor, this.director.time+Math.random() * 3000, 500, 0.1, 1);

				// Add to the collision simulation
				this.packedCirleManager.addCircle(packedCircle);

				// Add actor to the scene
				this.circleLayer.addChild(circleActor);
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

		/**
		 * Final prep-work and start the game loop
		 */
		start: function()
		{
			// Force all packedCircles to move to the position of their delegates
			this.packedCirleManager.forceCirclesToMatchDelegatePositions();

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

		mouseMove: function(e) {
			var mouseX = e.clientX;
			var mouseY = e.clientY;
			this.mousePosition.set(mouseX, mouseY);
		},

/**
 * Memory Management
 */		dealloc: function() {
//			this.packedCirleManager.dealloc();
		}
	}
})();
