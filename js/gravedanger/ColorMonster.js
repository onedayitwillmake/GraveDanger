/**
 File:
 	ColorMonster.js
 Created By:
	 Mario Gonzalez
 Project	:
 	GraveDanger
 Abstract:
 	A ColorMonster is the object which shows up on the bottom for X time after a chain is made.
 	It is more or less an island, which can accept any color
 Basic Usage:
 */
(function() {
	var __COMPOUND_IMAGE = null;

	GRAVEDANGER.ColorMonster = function()
	{
		GRAVEDANGER.ColorMonster.superclass.constructor.call(this);
		return this;
	};

	extend( GRAVEDANGER.ColorMonster, GRAVEDANGER.Island,
	{
		isActive: false, // True when visible
		pathBehavior: null,
		side: 0,

		create: function(aRadius)
		{
			this.setColor( GRAVEDANGER.Circle.prototype.GROUPS.RED ); // Doesn't matter what this is set to, as long as its set to something
			GRAVEDANGER.ColorMonster.superclass.create.call(this, aRadius);
//			this.actor.anchor = CAAT.Actor.prototype.;
			this.setCollisionVars();
			return this;
		},

		setCollisionVars: function()
		{
			this.setCollisionMaskAndGroup(GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.HEADS,
					GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.ISLANDS);
			return this;
		},

		showForDuration: function(aDuration)
		{
			aDuration = 8000;

			this.actor.emptyBehaviorList();

			this.isActive = true;
			this.setCollisionVars();

			// Scale into view
			var scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(this.actor, GRAVEDANGER.CAATHelper.currentScene.time+31, 550, 0, 1, new CAAT.Interpolator().createBackOutInterpolator(false) );
			scaleBehavior.anchor= CAAT.Actor.prototype.ANCHOR_BOTTOM;
			// Animate to the back and fourth across the screen
			var path = new CAAT.LinearPath();
			path.setInitialPosition(-this.radius, GRAVEDANGER.director.height-this.actor.height);
			path.setFinalPosition(GRAVEDANGER.director.width-this.radius, GRAVEDANGER.director.height-this.actor.height);

			 // setup up a path traverser for the path.
			var pathBehavior = new CAAT.PathBehavior();
				pathBehavior.setPath( path );
				pathBehavior.setInterpolator(  new CAAT.Interpolator().createExponentialInOutInterpolator(2, true) );
				pathBehavior.setFrameTime( GRAVEDANGER.CAATHelper.currentScene.time, aDuration );
				pathBehavior.cycleBehavior = false;

			this.actor.addBehavior( pathBehavior );

			var that = this;
		   	scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(this.actor, GRAVEDANGER.CAATHelper.currentScene.time+aDuration, 250, 1, 0, new CAAT.Interpolator().createLinearInterpolator( false, false ) );
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_BOTTOM;
			scaleBehavior.addListener( {
				behaviorApplied: function(behavior, time, actor)
				{
					that.setCollisionMaskAndGroup(0, 0);
				},

				behaviorExpired : function(behavior, time, actor)
				{
					that.setCollisionMaskAndGroup(0, 0);
				}
			});

			this.pathBehavior = pathBehavior;
		},


		/**
		 * Called by the game each loop
		 * @param {Number} gameTick		A zero based value incrimented everyframe by the GameScene
		 * @param {Number} gameClock	A zero based time value incrimented by the GameScene
		 * @param {Number} speedFactor	A number
		 */
		onTick: function(gameTick, gameClock, speedFactor)
		{
			this.packedCircle.position.x = this.actor.x + this.actor.width*0.5;
			this.packedCircle.position.y = this.actor.y + this.actor.height*0.5;
		},

		/**
		 * ColorMonster can always absorb any color!
		 * @param aColor
		 */
		canAbsorbColor: function(aColor)
		{
			return true;
		},


		/**
		 * Returns a compound image retrieved by reference from the CAAT.director
		 * @return {CAAT.CompoundImage} A compound image (preloaded in main.js)
		 */
		getImage: function()
		{
			var imageName = "colorMonster",
				imageRef,
				aCompoundImage;
			// Reuse one already made
			if(!__COMPOUND_IMAGE)
			{
				imageRef = GRAVEDANGER.director.getImage(imageName);
				__COMPOUND_IMAGE = new CAAT.CompoundImage().initialize(imageRef, 1, 1);
			}

			// Store for next lookup
			this.compoundImage = __COMPOUND_IMAGE;
			return this.compoundImage;
		},

		returnCollidedCircle: function(circleA, circleB)
		{
//			if(!this.isActive)
//				return null;

			//
			if(circleA === this.packedCircle)
				return circleB;
			else if (circleB === this.packedCircle)
				return circleA;

			return null;
		},

		getOpeningPosition: function()
		{
			//this.actor.x, normalizedTime, startX);
			var positionInFuture = this.pathBehavior.positionOnTime(GRAVEDANGER.CAATHelper.currentScene.time+350);

			this.openingPosition.x = positionInFuture.x+this.actor.width*0.4;
			this.openingPosition.y = positionInFuture.y+80;
			return this.openingPosition;
		},

		getPackedCircle: function()
		{
			var packedCircle = GRAVEDANGER.ColorMonster.superclass.getPackedCircle.call(this);
			packedCircle.setRadius(this.radius*0.8);
			return packedCircle;
		},

		dealloc: function()
		{
			GRAVEDANGER.ColorMonster.superclass.dealloc.call(this);
		}
	});
})();