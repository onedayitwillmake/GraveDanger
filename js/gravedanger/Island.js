(function() {
	var __CONPOUND_IMAGES = {};
	GRAVEDANGER.Island = function() {
		GRAVEDANGER.Island.superclass.constructor.call(this);
		this.debris = [];
		this.openingPosition = new CAAT.Point();
		this.leaveTimer = GRAVEDANGER.Config.ISLAND_EXPIRE_TIME_MIN + Math.random() * GRAVEDANGER.Config.ISLAND_EXPIRE_TIME_RANGE;
		return this;
	};

	extend( GRAVEDANGER.Island, GRAVEDANGER.Circle, {
		// Class properties
		DEBRIS_COLORS:  (function()
		{
			var obj = {};
			obj[GRAVEDANGER.Circle.prototype.GROUPS.RED] = new CAAT.Color.RGB(255,0,128);
			obj[GRAVEDANGER.Circle.prototype.GROUPS.GREEN] = new CAAT.Color.RGB(255,217,86);
			obj[GRAVEDANGER.Circle.prototype.GROUPS.BLUE] = new CAAT.Color.RGB(51,102,255);
			return obj;
		})(),

		// Instance properties
		sineOffset		: 0,		// Increased each frame, controlls floatRaidus
		floatRadius		: 30,		// Vertical range from initial position
		debris			: null,		// An array of debris pieces
		isAbsorbing		: false,	// Absorbing means it's in the middle of an animation while zombie-heads go into it
		openingPosition	: new CAAT.Point(),


		leaveTimer		: GRAVEDANGER.Config.ISLAND_EXPIRE_TIME,

		/**
		 * Called by the game each loop
		 * @param {Number} gameTick		A zero based value incrimented everyframe by the GameScene
		 * @param {Number} gameClock	A zero based time value incrimented by the GameScene
		 * @param {Number} speedFactor	A number
		 */
		onTick: function(gameTick, gameClock, speedFactor)
		{
			if(this.leaveTimer<0)
				return;

			if(!this.isAbsorbing)
			{
				this.sineOffset += 0.02 + Math.random() * 0.01;
				this.packedCircle.position.y  = Math.sin(this.sineOffset) * this.floatRadius + this.targetLocation.y;
			} else {
				var sign = (gameTick%2 == 0) ? 1 : -1;
				this.packedCircle.position.y += sign*1.1;
//				this.actor.scaleX = this.actor.scaleY = this.defaultScale+(sign*0.000001);
			}

			// this.positionActor
			this.actor.x = this.packedCircle.position.x-this.actor.width*0.5;
			this.actor.y = this.packedCircle.position.y-this.actor.height*0.5;

			this.leaveTimer--;

			if(this.leaveTimer < 0 ) {
				this.leave();
			}
		},

		leave: function()
		{
			this.setCollisionMaskAndGroup(0, 0);

			var aDuration = 750;
			var path = new CAAT.LinearPath();
			path.setInitialPosition(this.actor.x, this.actor.y);
			path.setFinalPosition(this.actor.x, GRAVEDANGER.director.height+this.actor.height);

			 // setup up a path traverser for the path.
			var pathBehavior = new CAAT.PathBehavior();
				pathBehavior.setPath( path );
				pathBehavior.setInterpolator(  new CAAT.Interpolator().createPennerEaseInOutQuad());
				pathBehavior.setFrameTime( GRAVEDANGER.CAATHelper.currentScene.time, aDuration );
				pathBehavior.cycleBehavior = false;

			this.actor.addBehavior( pathBehavior );

			var that = this;
		   	var scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(this.actor, GRAVEDANGER.CAATHelper.currentScene.time, aDuration, 1, 0, new CAAT.Interpolator().createPennerEaseInQuad() );
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_BOTTOM;

//			Dispatch event when complete
			pathBehavior.addListener( {
				behaviorExpired : function(behavior, time, actor)
				{
					actor.removeBehaviour(pathBehavior);
					that.reset();
//
				}
			});
		},

		reset: function( )
		{
			var allColors = [GRAVEDANGER.Circle.prototype.GROUPS.RED, GRAVEDANGER.Circle.prototype.GROUPS.BLUE, GRAVEDANGER.Circle.prototype.GROUPS.GREEN];
			this.setColor( GRAVEDANGER.UTILS.randomFromArray( allColors ) );

			var aDuration = 300;

			this.leaveTimer = GRAVEDANGER.Config.ISLAND_EXPIRE_TIME_MIN + Math.random() * GRAVEDANGER.Config.ISLAND_EXPIRE_TIME_RANGE;
			this.setCollisionMaskAndGroup(GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.HEADS, GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.ISLANDS);

			var scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(this.actor, GRAVEDANGER.CAATHelper.currentScene.time, aDuration, 0, 1, new CAAT.Interpolator().createPennerEaseOutQuad() );
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_BOTTOM;
			var path = new CAAT.LinearPath();
			path.setInitialPosition(this.actor.x, this.actor.y);
			path.setFinalPosition(this.targetLocation.x, this.targetLocation.y);

			 // setup up a path traverser for the path.
			var pathBehavior = new CAAT.PathBehavior();
				pathBehavior.setPath( path );
				pathBehavior.setInterpolator(  new CAAT.Interpolator().createPennerEaseInOutQuad());
				pathBehavior.setFrameTime( GRAVEDANGER.CAATHelper.currentScene.time, aDuration );
				pathBehavior.cycleBehavior = false;

			// Change debris color
			for(var i = 0; i < this.debris.length; i++) {
				this.debris[i].setColor( this.getColor() );
			}
		},

		create: function(aRadius)
		{
			GRAVEDANGER.Island.superclass.create.call(this, aRadius);

			this.packedCircle.isFixed = true;
			this.sineOffset = Math.random() * Math.PI * 2;
			return this;
		},

		/**
		 * Creates the debris that falls off the island
		 */
		createDebrisPieces: function()
		{

			// only show debris on canvas
			if( !GRAVEDANGER.CAATHelper.getUseCanvas() )
				return;

			for(var i = 0; i < 1; i++)
			{
				var rectangleDebris = GRAVEDANGER.EffectsDebris.create(this.actor, this.color);
				this.debris.push(rectangleDebris);
				GRAVEDANGER.CAATHelper.currentSceneLayers[0].addChild( rectangleDebris.getActor() );
			}
		},

		canAbsorbColor: function(aColor)
		{
			return aColor === this.color;
		},


		getImage: function()
		{
			var imageName = "island" + this.color + this.side,
				imageRef,
				aCompoundImage;

			// Reuse one already made
			if(!__CONPOUND_IMAGES[imageName])  {
				imageRef = GRAVEDANGER.director.getImage(imageName);
				aCompoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1);
				__CONPOUND_IMAGES[imageName]  = aCompoundImage;
			}

			// Store for next lookup
			this.compoundImage = __CONPOUND_IMAGES[imageName];
			return this.compoundImage;
		},



		getOpeningPosition: function()
		{
			this.openingPosition.x = this.actor.x + 60;
			this.openingPosition.y = this.actor.y + 115;
			return this.openingPosition;
		},

		setLocation: function(x, y)
		{
			GRAVEDANGER.Island.superclass.setLocation.call(this, x, y);
			this.targetLocation = new CAAT.Point(x,y);

			return this;
		},

		setSide: function(aSide)
		{
			this.side = aSide;
			return this;
		},

		dealloc: function()
		{
			for(var i = 0; i < this.debris.length; i++) {
				this.debris[i].dealloc();
			}

			this.debris = null;
			GRAVEDANGER.Island.superclass.dealloc.call(this);
		}
	});
})();