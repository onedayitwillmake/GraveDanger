(function() {
	GRAVEDANGER.Island = function() {
		GRAVEDANGER.Island.superclass.constructor.call(this);
		this.debris = [];
		return this;
	};

	extend( GRAVEDANGER.Island, GRAVEDANGER.Circle, {
		sineOffset: 0,
		floatRadius: 30,
		debris: null,

		onTick: function() {
			this.sineOffset += 0.03 + Math.random() * 0.01;
			this.packedCircle.position.y  = Math.sin(this.sineOffset) * this.floatRadius + this.targetLocation.y;
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
			if( !GRAVEDANGER.CAATHelper.prototype.getUseCanvas() )
				return;

			for(var i = 0; i < 3; i++)
			{
				var rectangleDebris = GRAVEDANGER.EffectsDebris.create(this.actor);
				this.debris.push(rectangleDebris);
				GRAVEDANGER.otherScene.addChild(rectangleDebris);
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