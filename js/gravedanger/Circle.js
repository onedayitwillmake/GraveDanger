(function() {

	var __CONPOUND_IMAGES = {};

	GRAVEDANGER.Circle = function() {
	 this.uuid = GRAVEDANGER.Circle.prototype.getNextUUID();
	 return this;
	};

	GRAVEDANGER.Circle.prototype = {
		NEXT_UUID: 0,
		// Class props
		GROUPS: {
			RED: 1 << 0,
			GREEN: 1 << 1,
			BLUE: 1 << 2
		},

		GROUP_COLOR_VALUES: (function() {
			var obj = {};
			// TODO: move to enum type!
			obj[1 << 0] = new CAAT.Color.RGB(255,0,128);
			obj[1 << 1] = new CAAT.Color.RGB(255,239,153);
			obj[1 << 2] = new CAAT.Color.RGB(62,210,255);

			return obj;
		})(),

		// DEV
		ACTOR_TYPES: {
			CANVAS_SPRITE: 1<< 0,
			CANVAS_SHAPE: 1 << 1,
			CSS_SPRITE: 1 << 2
		},

		getNextUUID: function() {
		   return ++GRAVEDANGER.Circle.prototype.NEXT_UUID;
		},

		uuid: 0,
		actor: null,
		packedCircle:  null,
		color: 0,				// A color based on GRAVEDANGER.Circle.prototype.GROUPS - not an actual color value
		colorRGB: '',			// String representing the hex value of this color type
		conpoundImage: null,
		radius:	0,
		defaultScale: 1,
		fallSpeed: 0,

		create: function(aRadius)
		{
			this.radius = aRadius;

			// Use a CSSActor if useCanvas is false
			if( GRAVEDANGER.CAATHelper.getUseCanvas() ) {
				this.createSpriteActor();
//				this.createShapeActor();
			} else {
				this.createCSSActor();
			}


			// TODO: Hack - don't stuff variable in CAAT.Actor
			this.actor.delegate = this;

			// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
			this.packedCircle = new CAAT.modules.CircleManager.PackedCircle()
				.setDelegate(this.actor)
				.setRadius(aRadius)
				.setCollisionMask(1)	// packedCircle instance - will collide against this group
				.setCollisionGroup(1); // packedCircle instance - is in this group

			this.actor.mouseEnabled = false;
//			this.actor.setScale(0.6, 0.6);

			return this;
		},

		createSpriteActor: function()
		{
			var caatImage = this.getImage();
			this.actor = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);

			this.actorType = GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SPRITE;
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

			this.actorType = GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SHAPE;

			// Check if color has been set
			if(this.colorRGB === null) {
				throw "(Circle)::createShapeActor - creating shape before color has been set!";
			}

			this.actor.setFillStyle(this.colorRGB.toRGBAString(1.0));
			return this;
		},

		createCSSActor: function()
		{

			var caatImage = this.getImage();

			this.actor = new CAAT.CSSActor()
				.createOneday( GRAVEDANGER.CAATHelper.getContainerDiv() )
				.setClassName("actor")
				.setBackground(caatImage.image.src)
				.setSize(this.radius*2, this.radius*2);

			this.actorType = GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CSS_SPRITE;
			return this;
		},

		getImage: function()
		{
			// Reuse one already made
			if(__CONPOUND_IMAGES[imageName])
				return __CONPOUND_IMAGES[imageName];

			var imageName = "heads" + this.color;
			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.conpoundImage = new CAAT.CompoundImage().initialize(imageRef, 3, 4);

			// Store for next
			__CONPOUND_IMAGES[imageName]  = this.conpoundImage;
			return this.conpoundImage;
		},

		onTick: function()
		{
			if(this.packedCircle.position.y > GRAVEDANGER.director.height)
			{
				this.packedCircle.position.x = GRAVEDANGER.UTILS.randomFloat(0, GRAVEDANGER.director.width);
				this.packedCircle.position.y = -this.actor.height*2;
			} else {
				this.packedCircle.position.y += this.fallSpeed;
			}

			// Position actor where packed circle is
			this.actor.x = this.packedCircle.position.x-this.actor.width*0.5;
			this.actor.y = this.packedCircle.position.y-this.actor.height*0.5;
		},

		chaseTarget: function(aTarget, speed) {
			var v = new CAAT.Point(),
				c = this.packedCircle;

			v.x = c.position.x - (aTarget.x);
			v.y = c.position.y - (aTarget.y);
			v.multiply(speed);
			c.position.x -= v.x;
			c.position.y -= v.y;
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
			this.colorRGB = GRAVEDANGER.Circle.prototype.GROUP_COLOR_VALUES[aColor];

			return this;
		},

		setToRandomSpriteInSheet: function()
		{
			// Random mask
			if(this.actorType === GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SHAPE)
				return this;

			var totalImages = this.conpoundImage.cols * this.conpoundImage.rows,
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
			var sx0= Math.floor(anIndex % this.conpoundImage.cols) * this.conpoundImage.singleWidth;
			var sy0= Math.floor(anIndex / this.conpoundImage.rows) * this.conpoundImage.singleHeight;

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

		getCAATActor: function() {
			return this.actor;
		},

		getPackedCircle: function() {
			return this.packedCircle;
		},

		getUUID: function() {
			return this.uuid;
		}
	}
})();