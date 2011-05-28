(function() {

	var __CONPOUND_IMAGES = {};
	var __colorGroups = {
			RED: 1 << 0,
			GREEN: 1 << 1,
			BLUE: 1 << 2
		};
	var __STATES = null; // Non tripple nested pointer to GRAVEDANGER.Circle.prototype.STATES
	var NEXTIMAGE = 0;
	GRAVEDANGER.Circle = function() {
		this.uuid = GRAVEDANGER.Circle.prototype.getNextUUID();
	    this.state = GRAVEDANGER.Circle.prototype.STATES.UNUSED;
	 	return this;
	};

	GRAVEDANGER.Circle.prototype = {
///// 'Class' properties
		NEXT_UUID: 0,

		GROUPS: __colorGroups,
		EVENTS: {
			ON_CIRCLE_DROP		: 'onCircleDrop',
			ON_CIRCLE_COMPLETE	: 'onCircleComplete',
			ON_CIRCLE_INTOABYSS	: 'ONCIRCLEABYSS'
		},

		COLLISION_GROUPS: {
			HEADS: 1 << 0,
			ISLANDS: 1 << 1
		},

		// The CSS Colors for each of the color groups
		GROUP_COLOR_VALUES: (function() { 		// Can't access own prototype by this pointyet so have to use local version
			var obj = {};
			obj[__colorGroups.RED] = new CAAT.Color.RGB(255,0,128);
			obj[__colorGroups.GREEN] = new CAAT.Color.RGB(255,239,153);
			obj[__colorGroups.BLUE] = new CAAT.Color.RGB(62,210,255);
			return obj;
		})(),

		STATES: {
			ACTIVE			: 1 << 0,
			ANIMATING_OUT	: 1 << 1,
			ANIMATING_IN	: 1 << 3,
			IS_PART_OF_CHAIN: 1 << 4,
			UNUSED			: 1 << 5
		},

		// DEV
		ACTOR_TYPES: {
			CANVAS_SPRITE: 1<< 0,
			CANVAS_SHAPE: 1 << 1,
			CSS_SPRITE: 1 << 2
		},
		getNextUUID: function() {
		   return ++GRAVEDANGER.Circle.prototype.NEXT_UUID;
		},

///// Instance properties
		uuid			: 0,
		actor			: null,
		packedCircle	: null,
		color			: 0,		// A color based on GRAVEDANGER.Circle.prototype.GROUPS - not an actual color value
		colorRGB		: '',		// String representing the hex value of this color type
		compoundImage	: null,
		radius			: 0,
		state			: 0,
		defaultScale	: 1,
		fallSpeed		: 0,
		timeoutStore	: null,		// Store reference to next timeout

		create: function()
		{
			if(this.actor == null) {
				throw "(GraveDanger.Circle) create called with no actor! - Call setColor first, which creates the Canvas/CSS Actor!"
			}

			// TODO: Hack - don't stuff variable in CAAT.Actor
			this.actor.delegate = this;

			// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
			this.packedCircle = new CAAT.modules.CircleManager.PackedCircle()
				.setDelegate(this.actor)
				.setRadius(this.radius)
				.setCollisionMask(0)	// packedCircle instance - will collide against this group
				.setCollisionGroup(0); // packedCircle instance - is in this group

			this.actor.mouseEnabled = false;
			return this;
		},

		onTick: function(gameTick, gameClock, speedFactor)
		{
			if(this.packedCircle.position.y > GRAVEDANGER.director.height-40 && this.state === __STATES.ACTIVE)
			{
				this.animateIntoAbyss();
			} else {
				this.packedCircle.position.y += this.fallSpeed;
			}

			// When animating out - force the packedCircle to where the actor is - otherwise the reverse occurs
			if(this.state === __STATES.ANIMATING_OUT) {
				this.packedCircle.position.y = this.actor.y;
				return;
			}

			// Position the actor to where the circle is located
			this.actor.x = this.packedCircle.position.x-this.actor.width*0.5;
			this.actor.y = this.packedCircle.position.y-this.actor.height*0.5;
		},

		// TODO: Violating DRY - this is duped in Debris.js
		animateIntoAbyss: function()
		{
			//popStatusText: function(textToDisplay)
			GRAVEDANGER.SimpleDispatcher.dispatch(GRAVEDANGER.Circle.prototype.EVENTS.ON_CIRCLE_INTOABYSS, this);

			this.state = GRAVEDANGER.Circle.prototype.STATES.ANIMATING_OUT;
			this.packedCircle.collisionGroup = 0;

			// path
			var center = GRAVEDANGER.director.width*0.5;
			var path = new CAAT.LinearPath();
			path.setInitialPosition(this.actor.x, this.actor.y);
			path.setFinalPosition(GRAVEDANGER.UTILS.randomFloat(center-100, center+100), this.actor.y + GRAVEDANGER.UTILS.randomFloat(50, 80));

			var startTime = GRAVEDANGER.director.time,
				endTime = 500 + Math.random() * 100;
			var startScale = this.actor.scaleX,
				endScale = 0;

			 // setup up a path traverser for the path.
			var gravityBehavior = new CAAT.PathBehavior();
				gravityBehavior.setPath( path );
				gravityBehavior.setFrameTime(startTime, endTime);
				gravityBehavior.setInterpolator(new CAAT.Interpolator().createExponentialInInterpolator(1, false));
			this.actor.addBehavior( gravityBehavior );

			// scale to zero as falling
			var scaleBehavior = new CAAT.ScaleBehavior();
				this.actor.scaleX = this.actor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
				scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
				scaleBehavior.setFrameTime( startTime, endTime );
				scaleBehavior.setInterpolator( new CAAT.Interpolator().createLinearInterpolator(false));
			this.actor.addBehavior(scaleBehavior);

			// Fire event when behavior is complete
			var that = this;
			gravityBehavior.addListener( {
				behaviorExpired : function(behavior, time, actor)
				{
					GRAVEDANGER.SimpleDispatcher.dispatch(GRAVEDANGER.Circle.prototype.EVENTS.ON_CIRCLE_COMPLETE, actor.delegate);
				}
			});
		},

		animateIntoIsland:function(island, startTime, duration, index, isFinal, offsetPosition)
		{
			var that = this;

			// Change the image to the skull in a sec
			clearTimeout(this.timeoutStore);
			this.timeoutStore = setTimeout(function() {
				that.setSpriteIndex(12);
			}, index*70);

			// Change state, and ignore collisions
			this.state = GRAVEDANGER.Circle.prototype.STATES.ANIMATING_OUT;
			this.packedCircle.collisionGroup = 0;
			this.packedCircle.collisionMask = 0;

			// Island center
			var center = island.getOpeningPosition();

			// Scale up, then to tiny before animating path
			var scaleBy = 1.1;
			var popDelay = 61;

			// scale to large size
			GRAVEDANGER.CAATHelper.animateScale(this.actor, startTime, popDelay, this.actor.scaleX, this.actor.scaleX+scaleBy);

			// scale to tiny size
			GRAVEDANGER.CAATHelper.animateScale(this.actor, startTime+popDelay, duration, this.actor.scaleX+scaleBy, 0.01);

			var pathBehavior = GRAVEDANGER.CAATHelper.animateABPath(this.actor,
					startTime+popDelay, duration,
					this.actor.x, this.actor.y,
					GRAVEDANGER.UTILS.randomFloat(center.x-10, center.x+10), center.y);

			// Dispatch event when complete
			pathBehavior.addListener( {
				behaviorExpired : function(behavior, time, actor)
				{
					// The last one makes the island stop absorbing.
					// TODO: A bit hacky?
					if(isFinal) {
						island.isAbsorbing = false;
					}

					GRAVEDANGER.SimpleDispatcher.dispatch(GRAVEDANGER.Circle.prototype.EVENTS.ON_CIRCLE_COMPLETE, actor.delegate);
				}
			});

			this.actor.addBehavior( pathBehavior );
		},

		chaseTarget: function(aTarget, speed)
		{
			var v = new CAAT.Point(),
				c = this.packedCircle;

			v.x = c.position.x - (aTarget.x);
			v.y = c.position.y - (aTarget.y);
			v.multiply(speed);
			c.position.x -= v.x;
			c.position.y -= v.y;
		},

 ///// Accessors
		setRadius: function(aRadius)
		{
			this.radius = aRadius;
			return this;
		},

		setLocation: function(x,y, movePackedCircle)
		{
			this.actor.setLocation(x,y);

			if(movePackedCircle)
			{
				this.packedCircle.position.x=this.actor.x+this.actor.width*0.5;
				this.packedCircle.position.y=this.actor.y+this.actor.height*0.5;
			}

			return this;
		},

		setColor: function(aColor)
		{
			this.color = aColor;
			this.colorRGB = GRAVEDANGER.Circle.prototype.GROUP_COLOR_VALUES[aColor];

			if(this.actor == null)
			{
				// CREATE THE ACTOR SPRITE
				if( GRAVEDANGER.CAATHelper.getUseCanvas() ) {
					this.actor = GRAVEDANGER.CAATHelper.createShapeActor(this, CAAT.ShapeActor.prototype.SHAPE_CIRCLE, this.colorRGB.toRGBAString(1.0), this.radius*2);
					this.actor = GRAVEDANGER.CAATHelper.createSpriteActor(this);
				} else {
					this.actor = GRAVEDANGER.CAATHelper.createCSSActor(this, this.getImage().singleWidth, this.getImage().singleHeight);
				}
			} else { // Actor already exist - call get image on our selves to return our correct color
				this.setImage(this.getImage());
			}
			return this;
		},

		getColor: function()
		{
			return this.color;
		},

		getImage: function()
		{
			var imageName = "heads" + this.color,
				imageRef,
				aCompoundImage;

			// Reuse one already made
			if(!__CONPOUND_IMAGES[imageName])  {
				imageRef = GRAVEDANGER.director.getImage(imageName);
				aCompoundImage = new CAAT.CompoundImage().initialize(imageRef, 4, 4);
				__CONPOUND_IMAGES[imageName]  = aCompoundImage;
			}

			// Store for next lookup
			this.compoundImage = __CONPOUND_IMAGES[imageName];
			return this.compoundImage;
		},

		setImage: function(anImage) {
			if(!this.actor || this.actorType === GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SHAPE) {
				throw "(Circle.Actor) No Actor exist!";
			}

			// CREATE THE ACTOR SPRITE
			if(this.actorType === GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SPRITE) {
				this.actor.setSpriteImage(anImage);
			} else if(this.actorType === GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CSS_SPRITE) {
				this.actor.setBackground( anImage.image.src )
					.setSize(anImage.singleWidth, anImage.singleHeight);
			}
		},

		setToRandomSpriteInSheet: function()
		{
			// Random mask
			if(this.actorType === GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SHAPE)
				return this;

			// bottom row is empty
			var totalImages = 12,		//this.compoundImage.cols * this.compoundImage.rows,
				index = GRAVEDANGER.UTILS.randomInt(0, totalImages-1);
			this.actor.spriteIndex = index;

			return this;
		},

		setSpriteIndex: function(anIndex)
		{
			if( GRAVEDANGER.CAATHelper.getUseCanvas() )
			{
				this.actor.spriteIndex = anIndex;
				return;
			}

			// Move CSS background image
			var sx0= Math.floor(anIndex % this.compoundImage.cols) * this.compoundImage.singleWidth;
			var sy0= Math.floor(anIndex / this.compoundImage.rows) * this.compoundImage.singleHeight;

			this.actor.domElement.style['background-position-x'] = sx0 + "px";
			this.actor.domElement.style['background-position-y'] = sy0 + "px";
		},

		setDefaultScale: function(aScale) {
			this.defaultScale = aScale;
		  	this.actor.setScale(this.defaultScale, this.defaultScale);
			return this;
		},

		getDefaultScale: function() {
			return this.defaultScale;
		},

		returnToDefaultScale: function() {
			this.actor.setScale(this.defaultScale, this.defaultScale);
			return this;
		},

		setTargetPosition: function(aPosition)
		{
			this.packedCircle.setTargetPosition(aPosition);
			return this;
		},

		setFallSpeed: function(aFallSpeed)
		{
			this.fallSpeed = aFallSpeed;
			return this;
		},

		setCollisionMaskAndGroup: function(cMask, cGroup)
		{
			this.packedCircle.collisionMask = cMask;
	      	this.packedCircle.collisionGroup = cGroup;

			return this;
		},

		/**
		 * Sets the current state of this Circle
		 * Note: No check is made for the validity of the state!
		 * It should be one of the valid types
		 * @param {Number} aState A valid GRAVEDANGER.Circle.prototype.STATES.ACTIVE enum type
		 */
		setState: function(aState)
		{
			this.state = aState;
			return this;
		},

		getCAATActor: function() {
			return this.actor;
		},

		getPackedCircle: function() {
			return this.packedCircle;
		},

		getUUID: function() {
			return this.uuid;
		},

		/**
		 * Hides or shows the CAAT.Actor
		 * @param {Boolean} aValue Whether to hide the actor or not
		 */
		setVisible: function(aValue) {
			if(aValue === true) {
				this.actor.setFrameTime(0, Number.MAX_VALUE);
				this.actor.discarable = false;
				this.actor.expired = false;
//				this.actor.alpha = 0.1;
			} else {
				this.actor.setOutOfFrameTime();
//				this.actor.alpha = 1;
			}

			return this;
		}
	};

	// Point back to prototype
	__STATES = GRAVEDANGER.Circle.prototype.STATES;
})();