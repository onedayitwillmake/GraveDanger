(function() {
	GRAVEDANGER.HudControllerGauge = function() {
		return this;
	};

	GRAVEDANGER.HudControllerGauge.prototype = {
		mask: null,
		easingSpeed: 0.2,

		create: function() {
			this.mask = GRAVEDANGER.CAATHelper.createSpriteActor(this);
			this.mask.setScaleAnchored(1, 1, CAAT.Actor.prototype.ANCHOR_RIGHT);
			return this;
		},



		getMask: function() {
			return this.mask;
		}
	}
})();