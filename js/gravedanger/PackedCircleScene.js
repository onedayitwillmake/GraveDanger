/**
 * PackedCircleScene
 */
(function() {
	GRAVEDANGER.PackedCircleScene = function() {
		return this;
	};

	GRAVEDANGER.PackedCircleScene.prototype =
	{
// Meta info
		targetDelta			: 31, // Determined by framerate 16 = 60fps

		// CAAT Info
		packedCircleManager	: null,
		director			: null,
		scene				: null,

		// Mouse information
		mousePosition		: null,
		isDragging			: false,		// True on mouseDown, false on mouse up

		// Current game info
		activeIslands		: null,
		colorMonster		: null,
		timeLeft			: 0,
		score				: 0,
		level				: 0,

		// Current timing info
		gameTick			: 0,			// Zero based tick
		gameClock			: 0,			// Zero based time reset each game
		clockActualTime		: 0,			// Actual Date.getTime()
		lastFrameDelta		: 0,			// Deltatime between last frame
		speedFactor			: 1, 			// A number where 1.0 means we're running exactly at the desired framerate, 0.5 means half, and of course 2.0 means double

		// HUD
		hud					: null,

		// CURRENT GAME
		timeLeftStart		: 45 * 1000,
		timeLeftDepleteRate : 0.001,		// How fast the anchor will decrease, gets faster as game progresses

		// Statistics kept while playing
		stats				: {
			dropsAttempts	: 0,
			headsMatched	: 0,
			dropsMade		: 0,
			speedLevel		: 0
		},

		// Difficulty progression
		currentMaxHeads			: 25,
		currentFallspeed		: 1.0,
		currentFallspeedRange	: 0,

		init: function(director)
		{
			this.initDirector(director);
			this.initLayers();
			this.initBackground();
			this.initObjectPools();
			this.initCircles();
			this.initMouseEvents();
			this.initIslands();
			this.initColorMonster();
			this.initHud();
			this.initFinal();
		},

		/**
		 * Main initialization.
		 * Creates the packed circle manager
		 */
		initDirector: function()
		{
			this.director = GRAVEDANGER.CAATHelper.getDirector();
			this.scene = new CAAT.Scene().
				create();

			// store pointer to scene, used to get scene.time in various parts of the game
			GRAVEDANGER.CAATHelper.setScene(this.scene);

			// Collision simulation
			this.packedCircleManager = new CAAT.modules.CircleManager.PackedCircleManager();
			this.packedCircleManager.setBounds(0, 0, this.director.width, this.director.height);
			this.packedCircleManager.setNumberOfCollisionPasses(1);
			this.packedCircleManager.setNumberOfTargetingPasses(0);

			// Add to the director
			this.scene.mouseEnabled = false;
			this.scene.fillStyle = "#000000";
			this.director.addScene(this.scene);
		},

		/**
		 * Creates the layers where objects live
		 * Layers are stored in CAATHelper.layers
		 */
		initLayers: function()
		{
			for(var i = 0; i <= 2; i++)
			{
				var aLayer = new CAAT.ActorContainer().
					create().
					setBounds(0,0, this.director.width, this.director.height);
				this.scene.addChild( aLayer );

				aLayer.mouseEnabled = false;
				GRAVEDANGER.CAATHelper.currentSceneLayers.push( aLayer );
			}
		},

		/**
		 * Initialize the game background
		 */
		initBackground: function()
		{
			var imageRef = GRAVEDANGER.director.getImage("gameBackground"),
				compoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1),
				backgroundActor = null;

			if( GRAVEDANGER.CAATHelper.getUseCanvas() )
			{
				backgroundActor = new CAAT.SpriteActor().
					create().
					setSpriteImage(compoundImage)
			} else {
				backgroundActor = new CAAT.CSSActor();
				backgroundActor.createOneday( GRAVEDANGER.CAATHelper.getContainerDiv() )
					.setClassName("actor")
					.setBackground( compoundImage.image.src )
					.setSize(compoundImage.singleWidth, compoundImage.singleHeight);
			}

			GRAVEDANGER.CAATHelper.currentSceneLayers[0].addChild(backgroundActor)
		},

		/**
		 * Initialize the object pools
		 */
		initObjectPools: function()
		{
			this.circlePool = new CAAT.ObjectPool()
				.create('GRAVEDANGER.Circle', false)
				.setPoolConstructor(GRAVEDANGER.Circle)
				.allocate(25);
		},

		/**
		 * Creates the circles which will be used in the scene
		 */
		initCircles: function()
		{
			// Create a bunch of circles!
			var total = 25;

			// temp place groups into array to pull from randomly
			var allColors = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.GREEN, GRAVEDANGER.Circle.prototype.GROUPS.BLUE];

			var tempArray = [];
			for(var i = 0; i < total; i++)
			{
				// Size
				var aRadius = 18;

				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var circle = this.circlePool.getObject()
					.setRadius(aRadius)
					.setColor( GRAVEDANGER.UTILS.randomFromArray( allColors ) )
					.create()
					.setLocation(this.director.width*0.5, -100)
					.setDefaultScale(GRAVEDANGER.Config.DEFAULT_SCALE + GRAVEDANGER.UTILS.randomFloat(-0.1, 0.1) );
//					.setVisible(false)

				// Add to the collision simulation
				this.packedCircleManager.addCircle( circle.getPackedCircle() );

				// Add actor to the scene
				GRAVEDANGER.CAATHelper.currentSceneLayers[1].addChild( circle.getCAATActor() );
				tempArray.push(circle);
			}

			// put them all back
			for(i = 0; i < tempArray.length; i++) {
				this.circlePool.setObject(tempArray[i]);
			}

			// Listen for circle complete -
			GRAVEDANGER.SimpleDispatcher.addListener(GRAVEDANGER.Circle.prototype.EVENTS.ON_CIRCLE_COMPLETE, this.onCircleComplete, this)
			// Listen for circle complete -
			GRAVEDANGER.SimpleDispatcher.addListener(GRAVEDANGER.Circle.prototype.EVENTS.ON_CIRCLE_INTOABYSS, this.onCircleIntoAbyss, this);
		},

		/**
		 * Creates the floating islands where 'circles' are placed
		 */
		initIslands: function()
		{
			this.activeIslands = new SortedLookupTable();

			// DRY:
			var allColors = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.BLUE, GRAVEDANGER.Circle.prototype.GROUPS.GREEN];

			var totalIslands = 2;
			var padding = 150;
			for(var i = 0; i < totalIslands; i++)
			{
				// Create the circle, that holds our 'CAAT' actor, and 'PackedCircle'
				var island = new GRAVEDANGER.Island()
					.setRadius(115)
					.setSide(i)
					.setColor( GRAVEDANGER.UTILS.randomFromArray( allColors ) )
					.create()
					.setLocation( padding + ((this.director.width - (padding*2)) * i) , this.director.height - 175)
					.setCollisionMaskAndGroup(GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.HEADS,
						GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.ISLANDS);




				this.packedCircleManager.addCircle( island.getPackedCircle() );
				GRAVEDANGER.CAATHelper.currentSceneLayers[0].addChild( island.getCAATActor() );

				// The debris must be added after the island is in the scene
				island.createDebrisPieces();
				this.activeIslands.setObjectForKey(island, island.uuid)
			}
		},

		initColorMonster: function ()
		{
			var radius = 115;
			this.colorMonster = new GRAVEDANGER.ColorMonster()
			.setRadius(radius)
			.create()
			.setLocation(this.director.width/2, this.director.height);

			this.packedCircleManager.addCircle( this.colorMonster.getPackedCircle() );
		   	GRAVEDANGER.CAATHelper.currentSceneLayers[0].addChild( this.colorMonster.getCAATActor() );

//			this.colorMonster.showForDuration(1000);
		},

		/**
		 * Creates MouseEvent listeners
		 */
		initMouseEvents: function()
		{
			this.mousePosition = new CAAT.Point(this.director.width/2, this.director.height/2);
			GRAVEDANGER.CAATHelper.setMousePosition(this.mousePosition);

			var that = this;

			// TODO: move from anonymous function
			// listen for the mouse
			GRAVEDANGER.CAATHelper.getContainerDiv().addEventListener("mousemove", function(e) {
				that.mouseMove(e);
			}, true);

			GRAVEDANGER.CAATHelper.getContainerDiv().addEventListener("mousedown", function(e) {
				that.mouseDown(e);
			}, true);

			window.addEventListener("mouseup", function(e) {
				that.mouseUp(e);
			}, true);
		},


		/**
		 * One final place to do any necessary initialization
		 * It's assumed all other initialization took place and objects exist!
		 */
		initHud: function()
		{
			this.hud = new GRAVEDANGER.HudController().create();

			var buffer = 20,
				gameDimensions = GRAVEDANGER.CAATHelper.getGameDimensions();

			// Place the gauge and add it to the HUD layer
			this.hud.setLocation(buffer, buffer-5);
			GRAVEDANGER.CAATHelper.currentSceneLayers[2].addChild( this.hud.getActor() );
			GRAVEDANGER.CAATHelper.currentSceneLayers[2].addChild( this.hud.getMask() );

			// Place and add the score
			var scoreField = this.hud.getScorefield();
			GRAVEDANGER.CAATHelper.currentSceneLayers[2].addChild( scoreField );
			scoreField.setLocation(gameDimensions.width - scoreField.textWidth - 32, buffer-6);

			// Place and add the score
			var levelField = this.hud.getLevelField();
			GRAVEDANGER.CAATHelper.currentSceneLayers[2].addChild( levelField );
			levelField.setLocation(63, 53);


			// Place and add the score
			var statusField = this.hud.getStatusText();
			GRAVEDANGER.CAATHelper.currentSceneLayers[2].addChild( statusField );
			statusField.setLocation(325, 40);
		},

		/**
		 * One final place to do any necessary initialization
		 * It's assumed all other initialization took place and objects exist!
		 */
		initFinal: function()
		{
			// Force all packedCircles to move to the position of their delegates
			this.packedCircleManager.forceCirclesToMatchDelegatePositions();
			this.packedCircleManager.setCallback(this.onCollision, this);
		},

		/**
		 * Final prep-work and start the game loop
		 */
		start: function()
		{
			// Reset temporal info
			this.clockActualTime = new Date().getTime();
			this.gameClock = 0; // Our game clock is relative
			this.gameTick = 0;
			this.score = 0;
			this.level = 0;
			this.timeLeft = this.timeLeftStart;

			// framerate
			var that = this;
			this.director.loop(this.targetDelta, function(director, delta){
				that.loop(director, delta);
			});
		},

		/**
		 * Collision between two circles has occured.
		 * Determine if chain should add link
		 * @param {CAAT.modules.CircleManager.PackedCircle}	ci	CircleA of the collision
		 * @param {CAAT.modules.CircleManager.PackedCircle}	cj	CircleB of the collision
		 * @param {CAAT.Point}	v		Inverse normal of the collision
		 */
		onCollision: function(ci, cj, v)
		{
			// Check if one of them is the color monster
			var collidedCircle = this.colorMonster.returnCollidedCircle(ci, cj);
			if(collidedCircle)
			{
				this.hud.popStatusText("YUM YUM!!", 2, 200);
				var colorMonsterActor = this.colorMonster.getCAATActor();
				var bumpScale = 1.2;
				var bumpTime = 100;

				// Create the 2 behaviors, scale up then down
				var scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(colorMonsterActor, this.scene.time, bumpTime, 1.0, bumpScale, new CAAT.Interpolator().createPennerEaseInQuad());
				scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_BOTTOM;
				scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(colorMonsterActor, this.scene.time+bumpTime, bumpTime, bumpScale, 1.0, new CAAT.Interpolator().createPennerEaseOutQuad());
				scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_BOTTOM;

				// animate the head
				collidedCircle.delegate.delegate.animateIntoIsland(this.colorMonster, this.director.time, 200, 0, false);
			}


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
				this.onLinkAdded(atLeastOneAdded);
		},

		/**
		 * Main loop
		 * @param director
		 * @param delta
		 */
		loop: function(director, delta)
		{

			this.gameTick++;
			this.updateGameClock();

			// HUD
			this.timeLeft -= this.lastFrameDelta;
			if(this.timeLeft > this.timeLeftStart) {
				this.timeLeft = this.timeLeftStart;
			} else if (this.timeLeft < 0) {
//				this.onTimeExpired();
				return;
			}


			this.hud.setTimeGaugeScale(this.timeLeft/this.timeLeftStart);
			this.hud.updateScoreAndLevel(this.score, this.level);

			// Handle current chain
			if(this.currentChain) {
				this.currentChain.chaseTarget(this.mousePosition);
			}

			this.packedCircleManager.handleCollisions();

			var circleList = this.packedCircleManager.allCircles,
				len = circleList.length;
			while(len--)
			{
				var packedCircle = circleList[len];
				var circle = packedCircle.delegate.delegate;

				circle.onTick(this.gameTick, this.gameClock, this.speedFactor);
			}

			// Add new heads
			this.dropHead();
		},

		/**
		 * Updates the internal game clock
		 * Also sets 'speedFactor' a number which we use to base our animations and etc, incase the game is running slightly slower or faster than we intended
		 */
		updateGameClock: function()
		{
			// Store the previous clockTime, then set it to whatever it is no, and compare time
			var oldTime = this.clockActualTime;
			var now = this.clockActualTime = new Date().getTime();
			var delta = ( now - oldTime );			// Note (var framerate = 1000/delta);

			// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago
			this.gameClock += delta;

			// Framerate independent motion
			// Any movement should take this value into account,
			// otherwise faster machines which can update themselves more accurately will have an advantage
			var speedFactor = delta / ( this.targetDelta );
			if (speedFactor <= 0) speedFactor = 1;

			this.lastFrameDelta = delta;
			this.speedFactor = speedFactor;

		},

		dropHead: function()
		{
			// heads and islands combined collision group
			var collisionGroup = GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.HEADS | GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.ISLANDS;

			// Too soon to release
			if(this.gameTick % GRAVEDANGER.Config.DROP_EVERY != 0)
				return;

			var head = this.circlePool.getObject();

			if(!head) return;

			var fallspeed = ( head.defaultScale/GRAVEDANGER.Config.DEFAULT_SCALE ) * this.currentFallspeed;

			head.setLocation( Math.random() * this.director.width, -head.radius*2, true)
				.setState( GRAVEDANGER.Circle.prototype.STATES.ACTIVE )
				.setToRandomSpriteInSheet()
				.setFallSpeed( fallspeed + GRAVEDANGER.UTILS.randomFloat(-this.currentFallspeedRange, this.currentFallspeedRange) )
					// Set collision mask to heads and island, and collision group to heads
				.setCollisionMaskAndGroup(GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.HEADS | GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.ISLANDS,
					GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.HEADS);


			// Animate in
			GRAVEDANGER.CAATHelper.animateScale(head.getCAATActor(), this.scene.time, 500, 2.0, head.defaultScale,
					new CAAT.Interpolator().createPennerEaseOutQuad());

			GRAVEDANGER.CAATHelper.animateInUsingAlpha(head.getCAATActor(),this.scene.time, 1000, 0, 1.0,
					new CAAT.Interpolator().createPennerEaseInQuad());


		},

		/**
		 * Dispatched by GRAVEDANGER.Circle once it has 'completed' which means:
		 * 	It has dropped and animated into the abyss
		 * 	It has animated into the island
		 * @param aCircle
		 */
		onCircleComplete: function (eventName, circle)
		{
			this.circlePool.setObject(circle);
		},

		onCircleIntoAbyss: function (eventName, circle)
		{
			this.timeLeft -= 5;
			this.hud.popStatusText("AW OH!", 1, 100);
		},

///// User Interaction
		/**
		 * MouseMove function. Ignored if MouseDown did not set this.isDragging to true
		 * @param e
		 */
		mouseMove: function(e)
		{
			if(!this.isDragging)
				return;

			var mouseX = e.clientX - this.director.canvas.offsetLeft;
			var mouseY = e.clientY - this.director.canvas.offsetTop;

			this.mousePosition.set(mouseX, mouseY);
		},

		/**
		 * MouseUp event, release chains
		 * @param e
		 */
		mouseUp: function(e)
		{
			this.isDragging = false;

			if(this.currentChain) {
				this.onChainRelease();
			}
		},

		/**
		 * MouseDown event. Detect new chain
		 * @param e
		 */
		mouseDown: function(e) {
			var mouseX = e.clientX - this.director.canvas.offsetLeft;
			var mouseY = e.clientY - this.director.canvas.offsetTop;
			this.mousePosition.set(mouseX, mouseY);

			// Store old one to compare if new
			var newDraggedCircle = this.packedCircleManager.getCircleAt(mouseX, mouseY, 0);

			console.log('NewDraggedCircle', mouseX, mouseY,  this.packedCircleManager.allCircles[0].position.y, newDraggedCircle)
			// Nothing to see here
			if(!newDraggedCircle)
				return;

			// Create a new Chain - we'll let the chain decide if it is valid or not (for example cannot drag
			var possibleChainStart = new GRAVEDANGER.Chain();

			// Looks weird but the grab the "PackedCircle's CircleActor's Circle"!!
			possibleChainStart.shouldAddLink(newDraggedCircle.delegate.delegate);

			// Add the chain if it was considered valid
			if( possibleChainStart.getHead() ) {
				this.currentChain = possibleChainStart;
				this.isDragging = true;
			} else { // Link was considered invalid by the chain, ignore chain instance
				this.destroyChain(possibleChainStart);
			}
		},

///// Chainlink event
		/**
		 * Called when a chain has been released, this happens on mouseUp if the player has a chain
		 */
		onChainRelease: function()
		{
			this.stats.dropsAttempts++;

			var ownerIsland = null;

			// Find the owner if any
			this.activeIslands.forEach(function(key, anIsland)
			{
				if(ownerIsland) return; // Match already found
				var islandPackedCircle = anIsland.packedCircle;

				// If mouse is over this object, store and stop the loop
				if(islandPackedCircle.containsPoint( this.mousePosition )) {
					ownerIsland = anIsland;
				}
			},this);

			// Match was found
			if(ownerIsland && ownerIsland.canAbsorbColor(this.currentChain.color) )
			{
				this.onDropMade(ownerIsland)
			}

			this.destroyChain(this.currentChain);
			this.currentChain = null;
		},

		onDropMade: function(ownerIsland)
		{
			this.hud.popStatusText("GREAT!");

			// Increase game statistics
			this.stats.dropsMade++;

			// Grab the heads that were dropped
			var links = this.currentChain.getLinks(),
				linkCount = links.length;

			this.stats.headsMatched += linkCount;
			for(var i = 0; i < linkCount; i++)
			{
				var aCircle = links[i];
				var duration = 300,//+(i*30),
					delay= 100*i;

				aCircle.animateIntoIsland(ownerIsland, this.director.time+delay, duration, i, i === linkCount-1);
				this.colorMonster.showForDuration(6000);
			}


			// Add time to the clock and give points
			this.timeLeft += (linkCount*2) * 2000;
			this.score += GRAVEDANGER.Config.POINT_VALUES[Math.min(linkCount-1, GRAVEDANGER.Config.POINT_VALUES.length)];

			ownerIsland.isAbsorbing = true;

			// Increase difficulty
			if(this.stats.dropsMade % GRAVEDANGER.Config.LEVEL_UP_EVERY == 0) {
				this.level++;
				this.currentFallspeed += GRAVEDANGER.Config.SPEED_INCREASE;
			}
		},

		/**
		 * Called whenever a valid link is created, animates the circle to bring attention to it
		 * @param {GRAVEDANGER.Circle} aCircle A circle instance
		 */
		onLinkAdded: function(aCircle) {
			var duration = 200,
				scaleBy = 3;

			// Scale up
			GRAVEDANGER.CAATHelper.animateScale(aCircle.actor, this.director.time, duration, aCircle.defaultScale, aCircle.defaultScale*scaleBy);
			GRAVEDANGER.CAATHelper.animateScale(aCircle.actor, this.director.time+duration, duration, aCircle.defaultScale*scaleBy, aCircle.defaultScale);
		},

/////	Memory Management
		/**
		 * Dealocate a chain
		 * @param {GRAVEDANGER.Chain} aChain A chain to deallocate
		 */
		destroyChain: function(aChain) {

			aChain.releaseAll();
			aChain.dealloc();
		},

		/**
		 * Deallocate memory
		 */
		dealloc: function() {
			this.packedCircleManager.dealloc();

			this.packedCircleManager = null, delete this.mousePosition;
			this.mousePosition = null, delete this.mousePosition;

		}
	}
})();
