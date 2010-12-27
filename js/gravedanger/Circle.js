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

		create: function(aRadius)
		{
			var circleActor = new CAAT.ShapeActor().create()
				.setShape( CAAT.ShapeActor.prototype.SHAPE_CIRCLE )
				.setSize(aRadius*2, aRadius*2); // Size is in diameters

			// TODO: Hack - don't stuff variable in CAAT.shapeActor
			circleActor.delegate = this;

			// The 'packedCircle' in the simulation is considered completely separate entity than the circleActor itself
			var packedCircle = new CAAT.modules.CircleManager.PackedCircle()
				.setDelegate(circleActor)
				.setRadius(aRadius)
				.setCollisionMask(1)	// packedCircle instance - will collide against this group
				.setCollisionGroup(1) // packedCircle instance - is in this group
				.setTargetChaseSpeed(Math.random() * 0.02);

			packedCircle.mouseEnabled = false;

			this.actor = circleActor;
			this.packedCircle = packedCircle;

			return this;
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

			// TODO: Hack - don't color here
			var	hue = (359/aColor), // HSV uses 0 - 360
				hex = CAAT.Color.prototype.hsvToRgb(hue, 60, 99).toHex(); // Convert to hex value

			this.actor.setFillStyle('#' + hex);

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