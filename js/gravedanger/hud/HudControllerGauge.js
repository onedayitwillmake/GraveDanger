(function() {
	GRAVEDANGER.HudControllerGauge = function() {
		return this;
	};

	GRAVEDANGER.HudControllerGauge.prototype = {
		actor: null,
		mask: null,
		actorType: null, // Not used but will be set by CAATHelper.createSpriteActor

		// ease
		easeingSpeed: 0.33,

		create: function() {
			this.actor = GRAVEDANGER.CAATHelper.createSpriteActor(this);
			this.mask = GRAVEDANGER.CAATHelper.createSpriteActor(this);
			this.mask.setScaleAnchored(1, 1, CAAT.Actor.prototype.ANCHOR_RIGHT);
			return this;
		},

		getImage: function()
		{
			var imageName;
			if(!this.actor) imageName = "hud_timeleft";
			else imageName = 'hud_timeleftMasker';

			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.conpoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1);

			// Store for next
			return this.conpoundImage;
		},

		/**
		 * Sets the time-gauge to a scale between 0.0-1.0
		 * @param {Number} aNormalizedScale
		 */
		setToScale: function(aNormalizedScale) {

			if(aNormalizedScale > 1.01) aNormalizedScale = 0.9;
			// Since we're right aligned lets invert the number
			aNormalizedScale = 1.0 - aNormalizedScale;

			// Cap
			if(aNormalizedScale>1) aNormalizedScale = 1;
			else if(aNormalizedScale<0.05) aNormalizedScale = 0.05;

			var easedScale = this.mask.scaleX;

			easedScale -= (easedScale -  aNormalizedScale) * this.easeingSpeed;

//			console.log("(HedControllerGauge)::", easedScale);
			this.mask.setScaleAnchored(easedScale, 1,CAAT.Actor.prototype.ANCHOR_RIGHT)
		},

		getActor: function() {
			return this.actor;
		},
		getMask: function() {
			return this.mask;
		},

		setLocation: function(x, y) {
			this.actor.x = x;
			this.actor.y = y;

			this.mask.x = this.actor.x + 3;
			this.mask.y = this.actor.y;
		},

		getMask: function() {
			return this.mask;
		}
	}
})();