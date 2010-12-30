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
		currentChain: null,
		isDragging: false,

		init: function(director)
		{
			this.tick = 0;
			this.initDirector(director);
			this.initLayers();
			this.initCircles();
			this.initMouseEvents();
			this.initIslands();

			GRAVEDANGER.SimpleDispatcher.addListener("warWereDeclared", this.onWarWereDeclared, this)
		},

		onWarWereDeclared: function(event, data) {
//		   console.log("(PackedCircleScene)::onWarWereDeclared - Event: '", event, "' | Data :"+ data.circle + " | this:", this);
		},

		/**
		 * Main initilization, creates the packed circle manager
		 * @param director
		 */
		initDirector: function(director)
		{
			this.mousePosition = new CAAT.Point(director.width/2, director.height/2);
			this.director = director;
			this.scene = new CAAT.Scene().
				create();

			// store pointer
			GRAVEDANGER.scene = this.scene;

			// Collision simulation
			this.packedCircleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCircleManager.setBounds(0, 0, director.width, director.height);
			this.packedCircleManager.setNumberOfCollisionPasses(2);
			this.packedCircleManager.setNumberOfTargetingPasses(0);

			// Add to the director
			this.scene.mouseEnabled = false;
			this.director.addScene(this.scene);
		},

		/**
		 * Creates the layers where objects live
		 * For now the layers are created manually for more fine grained control
		 */
		initLayers: function()
		{
			// Create a 'layer' for all the circles
			this.circleLayer = new CAAT.ActorContainer().
				create().
				setBounds(0,0, GRAVEDANGER.director.width, GRAVEDANGER.director.height);
			this.scene.addChild( this.circleLayer );
			this.scene.fillStyle = "#2a2a2a";

			GRAVEDANGER.otherScene = new CAAT.ActorContainer().
				create().
				setBounds(0,0, GRAVEDANGER.director.width, GRAVEDANGER.director.height);
			this.scene.addChild( GRAVEDANGER.otherScene );

			GRAVEDANGER.otherScene.mouseEnabled = this.circleLayer.mouseEnabled = false;
		},

		/**
		 * Creates the circles which will be used in the scene
		 */
		initCircles: function()
		{
			// Create a bunch of circles!
			var colorHelper = new CAAT.Color(),
				rgb = new CAAT.Color.RGB(0, 0, 0),
				total = 20;

			// temp place groups into array to pull from randomly
			var groups = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.BLUE, GRAVEDANGER.Circle.prototype.GROUPS.GREEN];
			var combinedGroups = GRAVEDANGER.Circle.prototype.GROUPS.RED | GRAVEDANGER.Circle.prototype.GROUPS.BLUE | GRAVEDANGER.Circle.prototype.GROUPS.GREEN;

			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = 17;
				                      //circle.getPackedCircle().position.x
				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var circle = new GRAVEDANGER.Circle()
					.setColor( GRAVEDANGER.UTILS.randomFromArray( groups ) )
					.create(aRadius)
					.setFallSpeed( Math.random() * 2 + 1)
					.setLocation( Math.random() * this.director.width,200 )
					.colorRandomly();
				// Add to the collision simulation
				this.packedCircleManager.addCircle( circle.getPackedCircle() );

				// Add actor to the scene
				this.circleLayer.addChild( circle.getCAATActor() );

				// Animate in
				GRAVEDANGER.CAATHelper.prototype.animateInUsingScale(circle.getCAATActor(), this.director.time+Math.random() * 2000, 500, 0.1, circle.getCAATActor().scaleX );
			}
		},

		/**
		 * Creates the floating islands where 'circles' are placed
		 */
		initIslands: function()
		{
			var totalIslands = 2;
			var padding = 150;
			for(var i = 0; i < totalIslands; i++) {
				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var island = new GRAVEDANGER.Island()
					.create( 120  )
					.setLocation( padding + ((this.director.width - (padding*2)) * i) , this.director.height - 250);

				this.packedCircleManager.addCircle( island.getPackedCircle() );
				this.circleLayer.addChild( island.getCAATActor() );

				// The debris must be added after the island is in the scene
				island.createDebrisPieces();
			}
		},

		/**
		 * Creates MouseEvent listeners
		 */
		initMouseEvents: function()
		{
			var that = this;

//			console.log(GRAVEDANGER.director.canvas)
			// listen for the mouse
			GRAVEDANGER.CAATHelper.prototype.getContainerDiv().addEventListener("mousemove", function(e) {
				that.mouseMove(e);
			}, true);

			GRAVEDANGER.CAATHelper.prototype.getContainerDiv().addEventListener("mousedown", function(e) {
				that.mouseDown(e);
			}, true);

			GRAVEDANGER.CAATHelper.prototype.getContainerDiv().addEventListener("mouseup", function(e) {
				that.mouseUp(e);
			}, true);
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

		onCollision: function(ci, cj, v)
		{
			if(!this.currentChain)
				return;

			// TODO: Seems hacky, delegate.delegate?
			var circleA = ci.delegate.delegate,
				circleB = cj.delegate.delegate;

			var head = this.currentChain.returnHeadInSet(circleA, circleB);

			// Neither is the chain head - no good.
			if(!head) return;

			this.currentChain.shouldAddLink(circleA);
			this.currentChain.shouldAddLink(circleB);

//			console.log(this.currentChain.color, circleA.color, circleB.color);
			if(circleA.color === circleB.color)
			{
//				console.log(circleA.uuid, circleB.uuid)
				circleA.actor.alpha = Math.random();
				circleB.actor.alpha = Math.random();
			}
		},

		loop: function(director, delta)
		{
			this.packedCircleManager.handleCollisions();

			if(this.currentChain) {
				this.currentChain.chaseTarget(this.mousePosition);
			}

			var circleList = this.packedCircleManager.allCircles,
				len = circleList.length;

			// color it
			var color = new CAAT.Color();

			while(len--)
			{
				var packedCircle = circleList[len];
				var circle = packedCircle.delegate.delegate;
				var circleActor = packedCircle.delegate;
				circle.onTick();

				// position
				circleActor.x = packedCircle.position.x-circleActor.width*0.5;
				circleActor.y = packedCircle.position.y-circleActor.height*0.5;
			}

			this.tick++;
		},

/**
 * User Interaction
 */
		mouseMove: function(e) {

			if(!this.isDragging) return;

			var mouseX = e.clientX - GRAVEDANGER.director.canvas.offsetLeft;
			var mouseY = e.clientY - GRAVEDANGER.director.canvas.offsetTop;
			this.mousePosition.set(mouseX, mouseY);
		},

		mouseUp: function(e)
		{
			this.isDragging = false;
			if(this.currentChain) {
				this.currentChain.releaseAll();
				this.currentChain.dealloc();
				this.currentChain = null;
			}
		},

		mouseDown: function(e) {
			var mouseX = e.clientX - GRAVEDANGER.director.canvas.offsetLeft;
			var mouseY = e.clientY - GRAVEDANGER.director.canvas.offsetTop;
			this.mousePosition.set(mouseX, mouseY);

			// Store old one to compare if new
			var newDraggedCircle = this.packedCircleManager.getCircleAt(mouseX, mouseY, 0);

			// Nothing to see here
			if(!newDraggedCircle)
				return;

			// Create a new Chain
			this.currentChain = new GRAVEDANGER.Chain();

			// Looks weird but the "PackedCircle's CircleActor's Circle"!!
			this.currentChain.shouldAddLink(newDraggedCircle.delegate.delegate);
			this.isDragging = true
		},

/**
 * Memory Management
 */		dealloc: function() {
			this.packedCircleManager.dealloc();

			this.packedCircleManager = null, delete this.mousePosition;
			this.mousePosition = null, delete this.mousePosition;

		}
	}
})();
