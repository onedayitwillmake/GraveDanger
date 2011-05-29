(function(){
	var counter = 0;
	GRAVEDANGER.StartScreen = function() {
		this.director = GRAVEDANGER.CAATHelper.getDirector();
	};

	GRAVEDANGER.StartScreen.prototype = {
		director: null,
		scene: null,
		gameClock: 0,
		isRunning: true,

		// Island animation properties
		islandAnimationDidComplete: false,
		sineOffset: 0,

		init: function() {
			this.initDirector();
			this.initBackground();
		},

		initDirector: function() {
			console.log(this.scene);
			this.scene = new CAAT.Scene().create();

			this.scene.___id = Math.random();
			// store pointer to scene, used to get scene.time in various parts of the game
			GRAVEDANGER.CAATHelper.setScene(this.scene);

			// Add to the director
			this.scene.mouseEnabled = false;
			this.scene.fillStyle = ++counter%2 == 0 ? "#FFFFFF" : "#101010";
			this.director.addScene(this.scene);

			this.director.timeline = this.gameClock = new Date().getTime();
		},

		initBackground: function() {
			var that = this;
			this.islandAnimationDidComplete = false;
			var backgroundActor = this.createImageSprite("titlescreenBackground");
			backgroundActor.x = (this.director.width/2 - backgroundActor.width/2) << 0;
			GRAVEDANGER.CAATHelper.animateInUsingAlpha(backgroundActor, 0, 3000, 0, 1, new CAAT.Interpolator().createLinearInterpolator(false, false) );
			backgroundActor.scaleY = 1.08;

			var baseTime = 2000;
			var duration = 500;
			var grave = this.createImageSprite("titlescreenGrave");
			grave.x = (this.director.width/2 - grave.width/2) << 0;
			grave.y = 15;
			GRAVEDANGER.CAATHelper.animateInUsingAlpha(grave, baseTime + 0, duration + 200, 0, 1, new CAAT.Interpolator().createExponentialInOutInterpolator(2, false) );
			GRAVEDANGER.CAATHelper.animateScale(grave, baseTime + 0, duration + 200, 3, 1, new CAAT.Interpolator().createExponentialInOutInterpolator(2, false) );

			var danger = this.createImageSprite("titlescreenDanger");
			danger.x = (this.director.width/2 - danger.width/2) << 0;
			danger.y = 155;
			GRAVEDANGER.CAATHelper.animateInUsingAlpha(danger, baseTime + 300, duration + 200, 0, 1, new CAAT.Interpolator().createExponentialInInterpolator(2, false) );
			GRAVEDANGER.CAATHelper.animateScale(danger, baseTime + 275, duration + 200, 4, 1, new CAAT.Interpolator().createExponentialInOutInterpolator(2, false) );

			var island = this.createImageSprite("titlescreenIsland");
			island.x = (this.director.width/2 - island.width/2) << 0;
			island.y = this.director.height + island.height + 75;

			var start = this.createImageSprite("titlescreenStart");
			start.x = (this.director.width/2 - start.width/2) << 0;
			start.y = 320;
			baseTime += 400;
			GRAVEDANGER.CAATHelper.animateInUsingAlpha(start, baseTime + 500, duration + 400, 0, 1, new CAAT.Interpolator().createExponentialInOutInterpolator(2, false) );
			GRAVEDANGER.CAATHelper.animateScale(start, baseTime + 500, 1000, 3, 1, new CAAT.Interpolator().createBounceOutInterpolator(false) );

			baseTime += 400;
			var pathBehavior = GRAVEDANGER.CAATHelper.animateABPath(island, baseTime, 1000,
					(this.director.width/2 - island.width/2) << 0, this.director.height + island.height, // Start
					(this.director.width/2 - island.width/2) << 0, this.director.height - island.height - 50, // End
					new CAAT.Interpolator().createExponentialOutInterpolator(3, false) );
			pathBehavior.addListener( {
				behaviorExpired : function(behavior, time, actor) {
					that.islandAnimationDidComplete = true;

					// Bounce start forever
					 var scaleBehavior = new CAAT.ScaleBehavior();
					scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
					start.scaleX = start.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = 1;  // Fall from the 'sky' !
					scaleBehavior.endScaleX = scaleBehavior.endScaleY = 1.1;
					scaleBehavior.setFrameTime( 0, 800 );
					scaleBehavior.setCycle(true);
					scaleBehavior.setInterpolator(new CAAT.Interpolator().createLinearInterpolator(true, false) );
					start.addBehavior(scaleBehavior);
				}
			});
			island.addBehavior( pathBehavior );


			this.island = island;
			this.islandBaseY = this.director.height - island.height - 50;

			for(var i = 0; i < 16; i++)
			{
				var rectangleDebris =  new GRAVEDANGER.EffectsDebris().create(island, 2);
				GRAVEDANGER.CAATHelper.getScene().addChild( rectangleDebris.getActor() );
			}



		},

		createImageSprite: function( imageName ) {
			var imageRef = GRAVEDANGER.director.getImage(imageName),
				compoundImage = new CAAT.CompoundImage().initialize(imageRef, 1, 1),
				actor = null;

			if( GRAVEDANGER.CAATHelper.getUseCanvas() )
			{
				actor = new CAAT.SpriteActor().
					create().
					setSpriteImage(compoundImage)
			} else {
				actor = new CAAT.CSSActor();
				actor.createOneday( GRAVEDANGER.CAATHelper.getContainerDiv() )
					.setClassName("actor")
					.setBackground( compoundImage.image.src )
					.setSize(compoundImage.singleWidth, compoundImage.singleHeight);
			}

			GRAVEDANGER.CAATHelper.getScene().addChild(actor);
			return actor;
		},

		start: function() {
			var that = this;

			(function animationLoop() {
				if(that.isRunning) {
					that.update();
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
			this.moveIsland();
		},

		moveIsland: function() {
			if(!this.islandAnimationDidComplete)
				return;

			this.sineOffset += 0.015 + Math.random() * 0.01;
			var floatRadius = 30;
			this.island.y = Math.sin(this.sineOffset) * floatRadius + this.islandBaseY;
		},

		dealloc: function() {
			this.island = null;
			this.scene.expired = true;
			this.scene = null;
			this.isRunning = false;
		}
	};
}());