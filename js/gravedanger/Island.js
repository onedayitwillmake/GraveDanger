(function() {
	GRAVEDANGER.Island = function() {
		GRAVEDANGER.Island.superclass.constructor.call(this);
		this.debris = [];
		return this;
	};

	extend( GRAVEDANGER.Island, GRAVEDANGER.Circle, {
		// Class properties
		DEBRIS_COLORS:  (function() {
			var obj = {};
			obj[GRAVEDANGER.Circle.prototype.GROUPS.RED] = new CAAT.Color.RGB(62,210,255);
			obj[GRAVEDANGER.Circle.prototype.GROUPS.GREEN] = new CAAT.Color.RGB(255,0,128);
			obj[GRAVEDANGER.Circle.prototype.GROUPS.BLUE] = new CAAT.Color.RGB(255,239,153);
			return obj;
		})(),
		// Instnace properties
		sineOffset: 0,
		floatRadius: 30,
		debris: null,
		isAbsorbing: false,

		onTick: function(gameTick, gameClock, speedFactor) {

			if(!this.isAbsorbing)
			{
				this.sineOffset += 0.02 + Math.random() * 0.01;
				this.packedCircle.position.y  = Math.sin(this.sineOffset) * this.floatRadius + this.targetLocation.y;
			} else {
				var sign = (gameTick%2 == 0) ? 1 : -1;
				this.packedCircle.position.y += sign*1;
				this.actor.scaleX = this.actor.scaleY = this.defaultScale+(sign*0.01);
			}

			// this.positionActor
			this.actor.x = this.packedCircle.position.x-this.actor.width*0.5;
			this.actor.y = this.packedCircle.position.y-this.actor.height*0.5;
		},

		create: function(aRadius)
		{
			GRAVEDANGER.Island.superclass.create.call(this, aRadius);

			this.packedCircle.isFixed = true;
			this.sineOffset = Math.random() * Math.PI * 2;

			this.actor.setScale(1, 1);
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

			var rgbColor = GRAVEDANGER.Island.prototype.DEBRIS_COLORS[this.color],
				colorRGBAString = rgbColor.toRGBAString(0.9);
			for(var i = 0; i < 3; i++)
			{
				var rectangleDebris = GRAVEDANGER.EffectsDebris.create(this.actor, colorRGBAString);
				this.debris.push(rectangleDebris);
				GRAVEDANGER.CAATHelper.currentSceneLayers[0].addChild(rectangleDebris);
			}
		},


		getImage: function()
		{
			var imageName = "island" + this.color;
			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.conpoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1);

			return this.conpoundImage;
		},

		setLocation: function(x, y)
		{
			GRAVEDANGER.Island.superclass.setLocation.call(this, x, y);
			this.targetLocation = new CAAT.Point(x,y);

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