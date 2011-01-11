/**
 File:
 	HudController
 Created By:
	 Mario Gonzalez
 Project	:
 	GraveDanger
 Abstract:
 	Controls the HUD within the game, and its components
 Basic Usage:
	initHud: function()
 	{
		gameHud = new GRAVEDANGER.HudController().create();

		var buffer = 20,
			gameDimensions = GRAVEDANGER.CAATHelper.getGameDimensions();

		// Place the gauge and add it to the HUD layer
		gameHud.setLocation(buffer, buffer-5);
		scene.addChild( gameHud.getActor() );
		scene.addChild( gameHud.getMask() );

		// Place and add the score
		var scoreField = this.hud.getScorefield();
		scoreField.setLocation(gameDimensions.width - scoreField.textWidth - 30, buffer-6);

 		scene.addChild( scoreField );
	},
 */
(function() {
	GRAVEDANGER.HudController = function() {
		return this;
	};

	GRAVEDANGER.HudController.prototype = {
		actor: null,
		actorType: null, // Not used but will be set by CAATHelper.createSpriteActor
		timeMask: null,
		easingSpeed: 0.3,
		scoreField: null,
		scoreFieldTextTarget: 0,
		scoreFieldText: '',

		levelField: null,
		levelFieldText: '',

		statusFieldText: null,

		/**
		 * Creates the timeGauge and the scoreField
		 */
		create: function() {
			this.actor = GRAVEDANGER.CAATHelper.createSpriteActor(this);
			this.timeMask = GRAVEDANGER.CAATHelper.createSpriteActor(this);
			this.timeMask.setScaleAnchored(1, 1, CAAT.Actor.prototype.ANCHOR_RIGHT);
			this.scoreField = GRAVEDANGER.CAATHelper.createTextfield("17px Impact", "rgba(255,255,255,1.0)", "00000000");
			this.levelField = GRAVEDANGER.CAATHelper.createTextfield("13px Impact", "rgba(255,255,255,1.0)", "99");

			this.statusFieldText = GRAVEDANGER.CAATHelper.createTextfield("17px Impact", "rgba(255,255,255,1.0)", "");
			return this;
		},

		getImage: function()
		{
			var imageName;

			// Send the HUD on the first call and the hud 'mask' on the second call
			if(!this.actor) imageName = "hud";
			else imageName = 'hud_timeleftMasker';

			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.compoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1);

			// Store for next
			return this.compoundImage;
		},

 ///// ACCESORS
		setLocation: function(x, y) {
			this.actor.x = x;
			this.actor.y = y;
			this.timeMask.x = this.actor.x+2;
			this.timeMask.y = this.actor.y;
		},

		/**
		 * Sets the time-gauge to a scale between 0.0-1.0
		 * @param {Number} aNormalizedScale
		 */
		setTimeGaugeScale: function(aNormalizedScale) {

			if(aNormalizedScale > 1.0) aNormalizedScale = 0.99999;
			// Since we're right aligned lets invert the number
			aNormalizedScale = 1.0 - aNormalizedScale;

			// Cap
			if(aNormalizedScale>1) aNormalizedScale = 1;
			else if(aNormalizedScale<0.01) aNormalizedScale = 0.01;

			var easedScale = this.timeMask.scaleX;

			easedScale -= (easedScale -  aNormalizedScale) * this.easingSpeed;
			this.timeMask.setScaleAnchored(easedScale, 1, CAAT.Actor.prototype.ANCHOR_RIGHT)
		},

		updateScoreAndLevel: function(aScore, aLevel)
		{
			this.scoreFieldText -= (this.scoreFieldText-aScore) * 0.1;
			this.scoreFieldText = Math.ceil(this.scoreFieldText);

			if(aScore !== this.scoreFieldText) {
				this.scoreField.setText( this.padNumber(this.scoreFieldText+1, 7) );
			}


			if(aLevel !== this.levelField)
			{
				this.levelField.setText(aLevel);
				this.levelFieldText = aLevel;
			}
		},

		padNumber: function(actualValue, numberOfDigits)
		{
			//leadingZeros
			var scoreString = '';
			numberOfDigits = Math.pow(10, numberOfDigits); // 4 becomes 0000

			// Loop through each tens place until it's less than 10
			while(numberOfDigits >= 10)
			{
				if(actualValue < numberOfDigits)
					scoreString = "0"+scoreString;

				numberOfDigits/=10; //4000 becomes 400
			}

			scoreString += actualValue;
			return scoreString;

		},

		getActor: function() {
			return this.actor;
		},

		getMask: function() {
			return this.timeMask;
		},

		getScorefield: function() {
			return this.scoreField;
		},

		getLevelField: function() {
			return this.levelField;
		},

		getStatusText: function()
		{
			return this.statusFieldText;
		},

		popStatusText: function(textToDisplay, scale, time)
		{
			this.statusFieldText.alpha = 1;
			this.statusFieldText.setText(textToDisplay);
			var that = this;
			var scaleBehavior = GRAVEDANGER.CAATHelper.animateScale(this.statusFieldText, GRAVEDANGER.CAATHelper.currentScene.time, time, 1, scale, new CAAT.Interpolator().createBounceOutInterpolator(true) );
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_BOTTOM;
			scaleBehavior.addListener( {
				behaviorExpired : function(behavior, time, actor)
				{
					actor.alpha = 0;
				}
			});
		}
	}
})();