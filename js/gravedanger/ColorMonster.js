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

		create: function(aRadius)
		{
			this.setColor( GRAVEDANGER.Circle.prototype.GROUPS.RED ); // Doesn't matter what this is set to, as long as its set to something
			GRAVEDANGER.ColorMonster.superclass.create.call(this, aRadius);
			this.actor.anchor = CAAT.Actor.prototype.ANCHOR_BOTTOM;
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
			this.isActive = true;
			this.setCollisionVars();

			// Scale into view
			var scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(this.actor, GRAVEDANGER.CAATHelper.currentScene.time+31, 250, 0, 1, new CAAT.Interpolator().createBackOutInterpolator(false) );
			// Animate to the back and fourth across the screen
			var path = new CAAT.LinearPath();
			path.setInitialPosition(-this.radius, GRAVEDANGER.director.height-this.radius);
			path.setFinalPosition(GRAVEDANGER.director.width-this.radius, GRAVEDANGER.director.height-this.radius);

			 // setup up a path traverser for the path.
			var pathBehavior = new CAAT.PathBehavior();
				pathBehavior.setPath( path );
				pathBehavior.setInterpolator(  new CAAT.Interpolator().createExponentialInOutInterpolator(2, true) );
				pathBehavior.setFrameTime( GRAVEDANGER.CAATHelper.currentScene.time, aDuration/2 );
				pathBehavior.cycleBehavior = true;

			this.actor.addBehavior( pathBehavior );

			var that = this;
		   	scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(this.actor, GRAVEDANGER.CAATHelper.currentScene.time+aDuration, 250, 1, 0, new CAAT.Interpolator().createBackOutInterpolator(false) );
			// Dispatch event when complete
			scaleBehavior.addListener( {
				behaviorExpired : function(behavior, time, actor)
				{
					that.setCollisionMaskAndGroup(0, 0);
					actor.removeBehaviour(pathBehavior);
				}
			});
			return pathBehavior
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

		returnSelfIfInSet: function(circleA, circleB)
		{
			if(!this.isActive)
				return null;

			//
			if(circleA === this.packedCircle)
				return circleB;
			else if (circleB === this.packedCircle)
				return circleA;

			return null;
		},

		getOpeningPosition: function()
		{
			this.openingPosition.x = this.actor.x + 60;
			this.openingPosition.y = this.actor.y;
			return this.openingPosition;
		},

		dealloc: function()
		{
			GRAVEDANGER.ColorMonster.superclass.dealloc.call(this);
		}
	});
})();