/**
 * PackedCircleScene
 */
(function() {
	GRAVEDANGER.PackedCircleScene = function() {
		return this;
	};

	GRAVEDANGER.PackedCircleScene.prototype= {
		packedCircleManager: null,
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
			this.initIslands();
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
			this.packedCircleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCircleManager.setBounds(0, 0, director.width, director.height);
			this.packedCircleManager.setNumberOfCollisionPasses(2);
			this.packedCircleManager.setNumberOfTargetingPasses(1);

			// Add to the director
			this.circleLayer.mouseEnabled = this.scene.mouseEnabled = false;
			this.director.addScene(this.scene);
		},

		initCircles: function()
		{
			// Create a bunch of circles!
			var colorHelper = new CAAT.Color(),
				rgb = new CAAT.Color.RGB(0, 0, 0),
				total = 125;

			// temp place groups into array to pull from randomly
			var groups = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.BLUE, GRAVEDANGER.Circle.prototype.GROUPS.GREEN];
			var combinedGroups = GRAVEDANGER.Circle.prototype.GROUPS.RED | GRAVEDANGER.Circle.prototype.GROUPS.BLUE | GRAVEDANGER.Circle.prototype.GROUPS.GREEN;

			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = Math.random() * 25 + 9;
				                      //circle.getPackedCircle().position.x
				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var circle = new GRAVEDANGER.Circle()
					.create(aRadius)
					.setColor( GRAVEDANGER.CAATHelper.prototype.randomFromArray( groups ) )
					.setLocation( Math.random() * this.director.canvas.width, -10 );
				circle.setTargetPosition( new CAAT.Point(circle.getCAATActor().x, this.director.canvas.height + 250) );

				      //Math.random() * this.director.canvas.height
				// Add to the collision simulation
				this.packedCircleManager.addCircle( circle.getPackedCircle() );

				// Add actor to the scene
				this.circleLayer.addChild( circle.getCAATActor() );

				// Animate in
				GRAVEDANGER.CAATHelper.prototype.animateInUsingScale(circle.getCAATActor(), this.director.time+Math.random() * 3000, 500, 0.1, 1);
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

		initIslands: function()
		{
			console.log(GRAVEDANGER.Island);
		},

		/**
		 * Final prep-work and start the game loop
		 */
		start: function()
		{
			// Force all packedCircles to move to the position of their delegates
			this.packedCircleManager.forceCirclesToMatchDelegatePositions();
			this.packedCircleManager.setCallback(this.onCollision, this);
			var that = this;
			this.director.loop(60, function(director, delta){
				that.loop(director, delta);
			});
		},

		onCollision: function(ci, cj, v) {

			// TODO: Seems hacky, delegates delegate?
			var circleA = ci.delegate.delegate,
				circleB = cj.delegate.delegate;

//			console.log(circleA.color, circleB.color);
			if(circleA.color === circleB.color)
			{
				circleA.actor.alpha = Math.random();
				circleB.actor.alpha = Math.random();
			}
		},

		loop: function(director, delta)
		{
			this.packedCircleManager.pushAllCirclesTowardTarget();
			this.packedCircleManager.handleCollisions();
			this.sineOffset += 0.01;
			var circleList = this.packedCircleManager.allCircles,
				len = circleList.length;

			// color it
			var color = new CAAT.Color();
			var longestDistance = 40000 + Math.sin(this.sineOffset) * 30000;
			if(longestDistance < 0) longestDistance *= -1; // abs
			while(len--)
			{
				var packedCircle = circleList[len];
				var circleActor = packedCircle.delegate;
				this.packedCircleManager.handleBoundaryForCircle(packedCircle);

				circleActor.x = packedCircle.position.x-packedCircle.radius;
				circleActor.y = packedCircle.position.y-packedCircle.radius;

//				circleActor.x =

			     // color
//				circleActor.setFillStyle('#' + color.hsvToRgb(hue, 95, 99).toHex() );

				// Here we are doing an interesting trick.
				// By randomly changing the targetChaseSpeed +/- 0.002 randomly
				// we introduce a seemingly complex hive behavior whereby certain circles
				// seem to want to 'leave' sometimes, and others decide to force their way to the center more strongly
//				if(Math.random() < 0.2)
//					packedCircle.setTargetChaseSpeed(packedCircle.targetChaseSpeed + Math.random() * 0.004 - 0.002);
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
//			this.packedCircleManager.dealloc();
		}
	}
})();
