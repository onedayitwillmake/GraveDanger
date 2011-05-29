(function(){
	GRAVEDANGER.PreloadScreen = function() {
	};

	GRAVEDANGER.PreloadScreen.prototype = {
		director: null,
		scene: null,
		gameClock: 0,
		isRunning: true,

		init: function() {
			this.initDirector();
			this.initBackground();
			this.initTextfield();
			this.preloadAmount = 0;
		},

		initTextfield: function() {
			// Create a textfield
			this.textfield = new CAAT.TextActor();
			this.textfield.setFont( "64px sans-serif" );
			this.textfield.textAlign = "left";
			this.textfield.textBaseline = "top";
			this.textfield.calcTextSize( this.director );
			this.textfield.setSize( this.textfield.textWidth, this.textfield.textHeight );
			this.textfield.create();
			this.textfield.fillStyle = "#FFFFFF";
			this.textfield.setLocation( this.director.width/2, this.director.height/2);

			this.progressBar = new CAAT.ShapeActor().setShape(CAAT.ShapeActor.SHAPE_RECTANGLE).create().setSize(100, 10);
			this.scene.addChild(this.progressBar);
			this.scene.addChild(this.textfield);
		},

		initDirector: function() {
			this.director = GRAVEDANGER.CAATHelper.getDirector();
			this.scene = new CAAT.Scene().create();

			// store pointer to scene, used to get scene.time in various parts of the game
			GRAVEDANGER.CAATHelper.setScene(this.scene);

			// Add to the director
			this.scene.mouseEnabled = false;
			this.scene.fillStyle = "#1F1010";
			this.director.addScene(this.scene);

			this.director.timeline = this.gameClock = new Date().getTime();
		},

		initBackground: function() {
			var that = this;
		},

		start: function() {
			var that = this;

			(function animationLoop() {
				if(that.isRunning) {
					that.update();
					that.scene.fillStyle = "rgb("+Math.round(that.preloadAmount * 255)+", " + Math.round(Math.cos(that.preloadAmount*Math.PI *2) * 255) + ", 255)";
					window.requestAnimationFrame(animationLoop);
				}
			})()
		},

		update: function() {

			var that = this;
			this.gameClock = new Date().getTime();
			var delta = this.gameClock - this.director.timeline;
			this.director.render( delta );

			this.director.timeline = this.gameClock;
		},

		dealloc: function() {
			this.island = null;
			this.scene.expired = true;
			this.scene = null;
			this.isRunning = false;
		}
	};
}());