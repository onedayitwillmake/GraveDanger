(function() {
	GRAVEDANGER.Island = function() {
		GRAVEDANGER.Island.superclass.constructor.call(this);
		return this;
	};

	extend( GRAVEDANGER.Island, GRAVEDANGER.Circle, {
		sineOffset: 0,
		floatRadius: 35,

		onTick: function() {
			this.sineOffset += 0.03 + Math.random() * 0.01;
			this.packedCircle.position.y  = Math.sin(this.sineOffset) * this.floatRadius + this.targetLocation.y;
		},

		create: function(aRadius)
		{
			GRAVEDANGER.Island.superclass.create.call(this, aRadius);
			this.packedCircle.isFixed = true;
//			this.actor.setScale(0.33, 0.33);
			return this;
		},

		getImage: function()
		{
			var imageName = "island";// + this.color;
			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.conpoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1);

			return this.conpoundImage;
		},

		setLocation: function(x, y)
		{
			GRAVEDANGER.Island.superclass.setLocation.call(this, x, y);
			this.targetLocation = new CAAT.Point(x,y);

			return this;
		}
	});
})();