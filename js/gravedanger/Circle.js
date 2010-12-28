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
		conpoundImage: null,
		packedCircle:  null,
		radius:	0,
		fallSpeed: 0,

		create: function(aRadius)
		{
			this.radius = aRadius;

			// Use a CSSActor if useCanvas is false
			if( GRAVEDANGER.CAATHelper.prototype.getUseCanvas() ) {
				this.createSpriteActor();
			} else {
				this.createCSSActor();
			}

			// Dev
//			this.createShapeActor();

			// TODO: Hack - don't stuff variable in CAAT.shapeActor
			this.actor.delegate = this;

			// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
			this.packedCircle = new CAAT.modules.CircleManager.PackedCircle()
				.setDelegate(this.actor)
				.setRadius(aRadius)
				.setCollisionMask(1)	// packedCircle instance - will collide against this group
				.setCollisionGroup(1); // packedCircle instance - is in this group

			this.actor.mouseEnabled = false;
			this.actor.setScale(0.5, 0.5);

			return this;
		},

		createSpriteActor: function()
		{
			var caatImage = this.getImage();
			this.actor = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);

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

			/**
			 * Use conppound image for info
			 * TODO: Probably inefficient but we don't create actors TOO often
			 */
			var caatImage = this.getImage();

			this.actor = new CAAT.CSSActor()
				.createOneday( GRAVEDANGER.CAATHelper.prototype.getContainerDiv() )
				.setClassName("actor")
				.setBackground(caatImage.image.src)
			    .setSize(this.radius*2, this.radius*2);

			return this;
		},

		getImage: function()
		{
			var imageName = "heads" + this.color;
			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.conpoundImage = new CAAT.CompoundImage().initialize(imageRef, 3, 4);

			return this.conpoundImage;
		},

		onTick: function()
		{
			if(this.packedCircle.position.y > GRAVEDANGER.director.height)
			{
				this.packedCircle.position.x = GRAVEDANGER.director.width/2 + Math.random();
				this.packedCircle.position.y = -this.actor.height*2;
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

		setSpriteIndex: function(anIndex)
		{
			if( GRAVEDANGER.CAATHelper.prototype.getUseCanvas() )
			{
				this.actor.spriteIndex = anIndex;
				return;
			}

			// Move CSS background image
			var sx0= Math.floor(anIndex % this.conpoundImage.cols) * this.conpoundImage.singleWidth;
			var sy0= Math.floor(anIndex / this.conpoundImage.cols) * this.conpoundImage.singleHeight;

			this.actor.domElement.style['background-position-x'] = sx0 + "px";
			this.actor.domElement.style['background-position-y'] = sy0 + "px";
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