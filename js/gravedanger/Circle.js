(function() {
	 GRAVEDANGER.Circle = function() {
		 return this;
	 };

	GRAVEDANGER.Circle.prototype = {
		// Class props
		GROUPS: {
			RED: 1 << 0,
			GREEN: 1 << 1,
			BLUE: 1 << 2
		},

		actor: null,
		packedCircle:  null,
		radius:	0,

		create: function(aRadius)
		{
			this.radius = aRadius;

//			this.createShapeActor();
			this.createSpriteActor();

			// TODO: Hack - don't stuff variable in CAAT.shapeActor
			this.actor.delegate = this;

			// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
			this.packedCircle = new CAAT.modules.CircleManager.PackedCircle()
				.setDelegate(this.actor)
				.setRadius(aRadius)
				.setCollisionMask(1)	// packedCircle instance - will collide against this group
				.setCollisionGroup(1) // packedCircle instance - is in this group
				.setTargetChaseSpeed(Math.random() * 0.02);

			this.actor.mouseEnabled = false;

			return this;
		},

		createSpriteActor: function()
		{
//			var imageRef = GRAVEDANGER.director.getImage("heads4" + this.color);
			var imageRef = GRAVEDANGER.director.getImage("heads4");
			var caatImage = new CAAT.CompoundImage().
					initialize(imageRef, 3, 4);

			this.actor = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);

			this.actor.spriteIndex = Math.floor(Math.random() * 10);
		  	this.actor.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;

			// Don't create an actorcontainer if its not a character
//			if(this.controller.entityType == GAMECONFIG.ENTITY_MODEL.ENTITY_MAP.CHARACTER)
//			{
//				actor = this.CAATActorContainer = new CAAT.ActorContainer().
//					create().
//					setBounds(0, 0, this.CAATSprite.width, this.CAATSprite.height);
//				actor.addChild(this.CAATSprite);
//
//				this.createPowerupSprite();
//
//				var that = this;
//
//				// This entity is the client character
//				// We have to do this here to call the create function next event loop, as the prop is set after we've are made
//				setTimeout(function(){
//							  that.createClientControlledCharacterHighlight()
//						  }, 0);
//			}

//			this.actorWidth = actor.width*0.5;
//			this.actorHeight = actor.height*0.5;
//			actor.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
//			this.CAATSprite.zIndex = actor.zIndex = themeModel.zIndex;
//			this.CAATSprite.mouseEnabled = actor.mouseEnabled = false;

			return this;
		},

		/**
		 * Debug
		 */
		createShapeActor: function()
		{
		  var circleActor = new CAAT.ShapeActor().create()
				.setShape( CAAT.ShapeActor.prototype.SHAPE_CIRCLE )
				.setSize(this.radius*2, this.radius*2); // Size is in diameters

			// Color it
			// TODO: Hack - don't color here
			var	hue = (359/aColor), // HSV uses 0 - 360
				hex = CAAT.Color.prototype.hsvToRgb(hue, 60, 99).toHex(); // Convert to hex value

			this.actor.setFillStyle('#' + hex);
		},



		/**
		 * Accessors
		 */
		setLocation: function(x,y) {
			this.actor.setLocation(x,y);
			return this;
		},

		setColor: function(aColor) {
			this.color = aColor;
//			this.packedCircle.setCollisionMask( aColor );
			return this;
		},

		setTargetPosition: function(aPosition)
		{
			this.packedCircle.setTargetPosition(aPosition);
			return this;
		},

		getCAATActor: function() {
			return this.actor;
		},

		getPackedCircle: function() {
			return this.packedCircle;
		}
	}
})();