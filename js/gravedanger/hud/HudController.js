(function() {
	GRAVEDANGER.HudController = function() {
		return this;
	};

	GRAVEDANGER.HudController.prototype = {
		timeGauge: null,
		scoreField: null,

		/**
		 * Creates the timeGauge and the scoreField
		 */
		create: function() {
			this.timeGauge = new GRAVEDANGER.HudControllerGauge().create();
			this.scoreField = this.createScoreText();
			return this;
		},

		createScoreText: function()
		{
			var directorRef = GRAVEDANGER.CAATHelper.getDirector();
			var aTextfield= new CAAT.TextActor();
			aTextfield.setFont("28px Impact");
			aTextfield.textAlign="left";
			aTextfield.textBaseline="top";
			aTextfield.setText("00000000000");
			aTextfield.calcTextSize( directorRef );
			aTextfield.setSize( aTextfield.textWidth, aTextfield.textHeight );
			aTextfield.create();
			aTextfield.fillStyle='white';

			return aTextfield;
		},

		/**
		 * Sets the time-gauge to a scale between 0.0-1.0
		 * @param {Number} aNormalizedScale
		 */
		setTimeGaugeToScale: function(aNormalizedScale) {
			// Cap
			if(aNormalizedScale>1) aNormalizedScale = 1;
			else if(aNormalizedScale<0.05) aNormalizedScale = 0.05;
		},

/**
 * ACCESORS
 */
		getTimeGauge: function() {
			return this.timeGauge;
		},

		getScorefield: function() {
			return this.scoreField;
		}
	}
})();