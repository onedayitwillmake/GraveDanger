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
		draggedCircle: undefined,
		isDragging: false,

		init: function(director)
		{
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

			// Collision simulation
			this.packedCircleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCircleManager.setBounds(0, 0, director.width, director.height);
			this.packedCircleManager.setNumberOfCollisionPasses(1);
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
					.setColor( GRAVEDANGER.UTILS.randomFromArray( groups ) )
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

			// listen for the mouse
			GRAVEDANGER.director.canvas.addEventListener("mousemove", function(e) {
				that.mouseMove(e);
			}, true);

			GRAVEDANGER.director.canvas.addEventListener("mousedown", function(e) {
				that.mouseDown(e);
			}, true);

			GRAVEDANGER.director.canvas.addEventListener("mouseup", function(e) {
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

		onCollision: function(ci, cj, v) {

			// TODO: Seems hacky, delegates delegate?
			var circleA = ci.delegate.delegate,
				circleB = cj.delegate.delegate;

//			if(circleA.color === circleB.color)
//			{
////				circleA.actor.alpha = Math.random();
////				circleB.actor.alpha = Math.random();
//			}
		},

		loop: function(director, delta)
		{
			this.packedCircleManager.handleCollisions();

			if(this.draggedCircle) {
				this.draggedCircle.delegate.delegate.chaseTarget(this.mousePosition);
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
		},

/**
 * User Interaction
 */
		mouseMove: function(e) {

			if(!this.isDragging || !this.draggedCircle) return;

//			debugger;
			var mouseX = e.offsetX;
			var mouseY = e.offsetY;
			console.log('MousePosition', mouseX, mouseY);
			this.mousePosition.set(mouseX, mouseY);

//			CAAT.getCanvasCoord(this.mousePosition, e);

//			this.draggedCircle |= this.packedCircleManager.getCircleAt(mouseX, mouseY, 0);

			if(this.draggedCircle) {
				this.draggedCircle.delegate.scaleX = this.draggedCircle.delegate.scaleY = 1;
				this.draggedCircle.isFixed = true;
			}

//			console.log(grabbedCircle);
//			this.packedCircleManager.get
//			if(this.isDragging)
//				console.log(this.mousePosition.toString())
//			console.log("(PackedCircleScene)::mouseMove", this.draggedCircle);
		},

		mouseUp: function(e) {
			this.isDragging = false;
			if(this.draggedCircle) {
//				this.draggedCircle.isFixed = false;
				console.log("(PackedCircleScene)::mouseUp");
				this.draggedCircle = null;
			}
		},

		mouseDown: function(e) {

			var mouseX = e.offsetX;
			var mouseY = e.offsetY;
			this.draggedCircle = this.packedCircleManager.getCircleAt(mouseX, mouseY, 0);
			this.isDragging = this.draggedCircle != null;

			console.log("(PackedCircleScene)::mouseDown");
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
