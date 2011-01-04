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
		scoreField: null,
		easingSpeed: 0.3,

		/**
		 * Creates the timeGauge and the scoreField
		 */
		create: function() {
			this.actor = GRAVEDANGER.CAATHelper.createSpriteActor(this);
			this.timeMask = GRAVEDANGER.CAATHelper.createSpriteActor(this);
			this.timeMask.setScaleAnchored(1, 1, CAAT.Actor.prototype.ANCHOR_RIGHT);
			this.scoreField = this.createScoreText();
			return this;
		},

		getImage: function()
		{
			var imageName;

			// Send the HUD on the first call and the hud 'mask' on the second call
			if(!this.actor) imageName = "hud";
			else imageName = 'hud_timeleftMasker';

			var imageRef = GRAVEDANGER.director.getImage(imageName);
			this.conpoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1);

			// Store for next
			return this.conpoundImage;
		},


		createScoreText: function()
		{
			var directorRef = GRAVEDANGER.CAATHelper.getDirector();
			var aTextfield= new CAAT.TextActor();
			aTextfield.setFont("17px Impact");
			aTextfield.setText("00000000");
			aTextfield.calcTextSize( directorRef );
			aTextfield.setSize( aTextfield.textWidth, aTextfield.textHeight );
			aTextfield.create();
			aTextfield.textAlign="right";
			aTextfield.textBaseline="top";
			aTextfield.fillStyle="rgba(255,255,255,1.0)"
			aTextfield.setScaleAnchored(1,1, CAAT.Actor.prototype.ANCHOR_RIGHT);
			return aTextfield;
		},

/**
 * ACCESORS
 */
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

		getActor: function() {
			return this.actor;
		},

		getMask: function() {
			return this.timeMask;
		},

		getScorefield: function() {
			return this.scoreField;
		}
	}
})();