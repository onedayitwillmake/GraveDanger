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

			return this;
		},

		createSpriteActor: function()
		{
			console.log(GRAVEDANGER.CAATHelper.imagePreloader.images);
			var imageRef = GRAVEDANGER.director.getImage("island");
			var caatImage = new CAAT.CompoundImage().
					initialize(imageRef, 1, 1);

			this.actor = new CAAT.SpriteActor().
					create().
					setSpriteImage(caatImage);

			this.actor.spriteIndex = 0;
			this.actor.setScale(0.5, 0.5);
		  	this.actor.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			return this;
		},

		setLocation: function(x, y)
		{
			GRAVEDANGER.Island.superclass.setLocation.call(this, x, y);
			this.targetLocation = new CAAT.Point(x,y);

			return this;
		}
	});
})();