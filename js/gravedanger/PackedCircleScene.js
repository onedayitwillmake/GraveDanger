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
			this.initFinal();

			GRAVEDANGER.SimpleDispatcher.addListener("warWereDeclared", this.onWarWereDeclared, this);


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
			this.director = director;
			this.scene = new CAAT.Scene().
				create();

			// store pointer
			GRAVEDANGER.CAATHelper.setScene(this.scene);

			// Collision simulation
			this.packedCircleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCircleManager.setBounds(0, 0, director.width, director.height);
			this.packedCircleManager.setNumberOfCollisionPasses(1);
			this.packedCircleManager.setNumberOfTargetingPasses(0);

			// Add to the director
			this.scene.mouseEnabled = false;
			this.scene.fillStyle = "#2a2a2a";
			this.director.addScene(this.scene);
		},

		/**
		 * Creates the layers where objects live
		 * Layers are stored in CAATHelper.layers
		 */
		initLayers: function()
		{
			for(var i = 0; i < 3; i++)
			{
				var aLayer = new CAAT.ActorContainer().
					create().
					setBounds(0,0, GRAVEDANGER.director.width, GRAVEDANGER.director.height);
				this.scene.addChild( aLayer );

				aLayer.mouseEnabled = false;
				GRAVEDANGER.CAATHelper.currentSceneLayers.push( aLayer );
			}
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
			var allColors = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.GREEN, GRAVEDANGER.Circle.prototype.GROUPS.BLUE];

			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = 30;
				                      //circle.getPackedCircle().position.x
				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var circle = new GRAVEDANGER.Circle()
					.setColor( GRAVEDANGER.UTILS.randomFromArray( allColors ) )
					.create(aRadius)
					.setFallSpeed( Math.random() * 4 + 3)
					.setLocation( Math.random() * this.director.width, -aRadius )
					.setToRandomSpriteInSheet()
					.setDefaultScale(0.6);


				// Add to the collision simulation
				this.packedCircleManager.addCircle( circle.getPackedCircle() );

				// Add actor to the scene
				GRAVEDANGER.CAATHelper.currentSceneLayers[1].addChild( circle.getCAATActor() );

				// Animate in
				GRAVEDANGER.CAATHelper.animateInUsingScale(circle.getCAATActor(), this.director.time+Math.random() * 2000, 500, 0.1, circle.getCAATActor().scaleX );
			}
		},

		/**
		 * Creates the floating islands where 'circles' are placed
		 */
		initIslands: function()
		{
			// DRY:
			var allColors = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.BLUE, GRAVEDANGER.Circle.prototype.GROUPS.GREEN];

			var totalIslands = 2;
			var padding = 150;
			for(var i = 0; i < totalIslands; i++) {
				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var island = new GRAVEDANGER.Island()
					.setColor( GRAVEDANGER.UTILS.randomFromArray( allColors ) )
					.create( 120 )
					.setLocation( padding + ((this.director.width - (padding*2)) * i) , this.director.height - 175);

				this.packedCircleManager.addCircle( island.getPackedCircle() );
				GRAVEDANGER.CAATHelper.currentSceneLayers[1].addChild( island.getCAATActor() );

				// The debris must be added after the island is in the scene
				island.createDebrisPieces();
			}
		},

		/**
		 * Creates MouseEvent listeners
		 */
		initMouseEvents: function()
		{
			this.mousePosition = new CAAT.Point(this.director.width/2, this.director.height/2);
			GRAVEDANGER.CAATHelper.setMousePosition(this.mousePosition);

			var that = this;

			// listen for the mouse
			GRAVEDANGER.CAATHelper.getContainerDiv().addEventListener("mousemove", function(e) {
				that.mouseMove(e);
			}, true);

			GRAVEDANGER.CAATHelper.getContainerDiv().addEventListener("mousedown", function(e) {
				that.mouseDown(e);
			}, true);

			GRAVEDANGER.CAATHelper.getContainerDiv().addEventListener("mouseup", function(e) {
				that.mouseUp(e);
			}, true);
		},

		/**
		 * One final place to do any necessary initialization
		 * It's assumed all other initialization took place and objects exist!
		 */
		initFinal: function() {
			// Force all packedCircles to move to the position of their delegates
			this.packedCircleManager.forceCirclesToMatchDelegatePositions();
			this.packedCircleManager.setCallback(this.onCollision, this);
		},

		/**
		 * Final prep-work and start the game loop
		 */
		start: function()
		{
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

			// Check if one of the two objects colliding is the head circle of the chain
			var head = this.currentChain.returnHeadInSet(circleA, circleB);
			if(!head) return; // Neither is the chain head - no good.

			//
			var atLeastOneAdded = this.currentChain.shouldAddLink(circleA) || this.currentChain.shouldAddLink(circleB);

			// do something!
			if(atLeastOneAdded)
				this.onLinkAdded();
		},

		loop: function(director, delta)
		{
			this.packedCircleManager.handleCollisions();

			// Handle current chain
			if(this.currentChain) {
				this.currentChain.chaseTarget(this.mousePosition);
			}


			var circleList = this.packedCircleManager.allCircles,
				len = circleList.length;
			while(len--)
			{
				var packedCircle = circleList[len];
				var circle = packedCircle.delegate.delegate;
				circle.onTick();
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
			this.isDragging = true;

			this.onLinkAdded();
		},

		onLinkAdded: function() {

//			this.stutterDirector(90); // ~2 frames
		},

		/**
		 * Stops then resumes the director loop for X time
		 * @param {Number} duration A pause duration in ms
		 */
		stutterDirector: function(duration)
		{
			console.log('stutter!')

			clearTimeout(this.stutterTimeout);

			this.director.stop();

			var that = this;
			this.stutterTimeout = setTimeout(function(director, delta){
				that.start();
			}, duration);
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
