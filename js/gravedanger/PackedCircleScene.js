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

			GRAVEDANGER.SimpleDispatcher.addListener("warWereDeclared", this.onWarWereDeclared, this)
		},

		onWarWereDeclared: function(event, data) {
//		   console.log("(PackedCircleScene)::onWarWereDeclared - Event: '", event, "' | Data :"+ data.circle + " | this:", this);
		},

		initDirector: function(director)
		{
			this.mousePosition = new CAAT.Point(director.width/2, director.height/2);
			this.director = director;
			this.scene = new CAAT.Scene().
				create();

			// Create a 'layer' for all the circles
			this.circleLayer = new CAAT.ActorContainer().
				create().
				setBounds(0,0, director.width, director.height);
			this.scene.addChild( this.circleLayer );

			// Collision simulation
			this.packedCircleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCircleManager.setBounds(0, 0, director.width, director.height);
			this.packedCircleManager.setNumberOfCollisionPasses(1);
			this.packedCircleManager.setNumberOfTargetingPasses(0);

			// Add to the director
			this.circleLayer.mouseEnabled = this.scene.mouseEnabled = false;
			this.director.addScene(this.scene);
		},

		initCircles: function()
		{
			// Create a bunch of circles!
			var colorHelper = new CAAT.Color(),
				rgb = new CAAT.Color.RGB(0, 0, 0),
				total = 30;

			// temp place groups into array to pull from randomly
			var groups = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.BLUE, GRAVEDANGER.Circle.prototype.GROUPS.GREEN];
			var combinedGroups = GRAVEDANGER.Circle.prototype.GROUPS.RED | GRAVEDANGER.Circle.prototype.GROUPS.BLUE | GRAVEDANGER.Circle.prototype.GROUPS.GREEN;

			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = 36;
				                      //circle.getPackedCircle().position.x
				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var circle = new GRAVEDANGER.Circle()
					.setColor( GRAVEDANGER.CAATHelper.prototype.randomFromArray( groups ) )
					.create(aRadius)
					.setFallSpeed( Math.random() * 2 + 1)
					.setLocation( Math.random() * this.director.width,200 );

				// Random mask
				var totalImages = circle.conpoundImage.cols * circle.conpoundImage.rows;
				circle.setSpriteIndex( Math.floor( Math.random() * totalImages ) );

				      //Math.random() * this.director.height
				// Add to the collision simulation
				this.packedCircleManager.addCircle( circle.getPackedCircle() );

				// Add actor to the scene
				this.circleLayer.addChild( circle.getCAATActor() );

				// Animate in
				GRAVEDANGER.CAATHelper.prototype.animateInUsingScale(circle.getCAATActor(), this.director.time+Math.random() * 2000, 500, 0.1, circle.getCAATActor().scaleX );
			}
		},

		initMouseEvents: function()
		{
			var that = this;
//			// Listen for resize
//			window.addEventListener("resize", function(e) {
//				var edge = 10;
//				that.director.width = window.innerWidth - edge*2;
//				that.director.height = window.innerHeight - edge*2;
//				that.scene.setBounds(0, 0, that.director.width, that.director.height);
//			}, true);

			// listen for the mouse
			window.addEventListener("mousemove", function(e) {
				that.mouseMove(e);
			}, true);
		},

		initIslands: function()
		{
			// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
			var island = new GRAVEDANGER.Island()
				.create( 240  )
				.setLocation( this.director.width/2, this.director.height - 250 );

			this.packedCircleManager.addCircle( island.getPackedCircle() );
			this.circleLayer.addChild( island.getCAATActor() );
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
			this.director.loop(30, function(director, delta){
				that.loop(director, delta);
			});
		},

		onCollision: function(ci, cj, v) {

			// TODO: Seems hacky, delegates delegate?
			var circleA = ci.delegate.delegate,
				circleB = cj.delegate.delegate;

			if(circleA.color === circleB.color)
			{
//				circleA.actor.alpha = Math.random();
//				circleB.actor.alpha = Math.random();
			}
		},

		loop: function(director, delta)
		{
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
				var circle = packedCircle.delegate.delegate;
				var circleActor = packedCircle.delegate;

				circle.onTick();
//				this.packedCircleManager.handleBoundaryForCircle(packedCircle);

				circleActor.x = packedCircle.position.x-circleActor.width*0.5;
				circleActor.y = packedCircle.position.y-circleActor.width*0.5;
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
