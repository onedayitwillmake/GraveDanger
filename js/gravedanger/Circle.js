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
		fallSpeed: 0,

		create: function(aRadius)
		{
			this.radius = aRadius;

			this.createShapeActor();
//			this.createSpriteActor();
			this.createCSSActor();

			// TODO: Hack - don't stuff variable in CAAT.shapeActor
			this.actor.delegate = this;

			// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
			this.packedCircle = new CAAT.modules.CircleManager.PackedCircle()
				.setDelegate(this.actor)
				.setRadius(aRadius)
				.setCollisionMask(1)	// packedCircle instance - will collide against this group
				.setCollisionGroup(1) // packedCircle instance - is in this group

			this.actor.mouseEnabled = false;
			this.actor.setScale(0.5, 0.5);

			return this;
		},

		createSpriteActor: function()
		{
			var imageName = "heads" + this.color;
			var imageRef = GRAVEDANGER.director.getImage(imageName);
			var caatImage = new CAAT.CompoundImage().
					initialize(imageRef, 3, 4);

			this.actor = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);

			this.actor.spriteIndex = Math.floor(Math.random() * 10);
		  	this.actor.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;

			return this;
		},

		/**
		 * Debug
		 */
		createShapeActor: function()
		{
		  this.actor = new CAAT.ShapeActor().create()
				.setShape( CAAT.ShapeActor.prototype.SHAPE_CIRCLE )
				.setSize(this.radius*2, this.radius*2); // Size is in diameters

			// Color it
			// TODO: Hack - don't color here
			var	hue = (359/this.color), // HSV uses 0 - 360
				hex = CAAT.Color.prototype.hsvToRgb(hue, 60, 99).toHex(); // Convert to hex value

			this.actor.setFillStyle('#' + hex);
		},

		createCSSActor: function()
		{
//			var imageName = "heads" + this.color;
//			var imageRef = GRAVEDANGER.director.getImage(imageName);
//			var caatImage = new CAAT.CompoundImage().
//					initialize(imageRef, 3, 4);
//
			this.actor = new CAAT.CSSActor()
				.createOneday( GRAVEDANGER.CAATHelper.prototype.getContainerDiv() )
				.setClassName("actor");

//					setSpriteImage(caatImage);

//			this.actor.spriteIndex = Math.floor(Math.random() * 10);
//		  	this.actor.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;

			return this;
		},


		onTick: function()
		{
			if(this.packedCircle.position.y > GRAVEDANGER.director.height)
			{
				this.packedCircle.position.x = GRAVEDANGER.director.width/2 + Math.random();
				this.packedCircle.position.y = -this.actor.height*2;
//				GRAVEDANGER.SimpleDispatcher.dispatch('warWereDeclared', {circle: this});
			} else {
				this.packedCircle.position.y += this.fallSpeed;
			}
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

		getCAATActor: function() {
			return this.actor;
		},

		getPackedCircle: function() {
			return this.packedCircle;
		}
	}
})();