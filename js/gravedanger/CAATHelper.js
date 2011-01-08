(function()
{
	/**
	 * A singleton object which can help with various static functions used by parts of the game.
	 */
	GRAVEDANGER.CAATHelper = {
		imagePreloader: null,

		// Now
		director: null,
		currentSceneLayers: null,
		mousePosition: null,

		containerDiv: null,
		useCanvas: false,

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 */
		animateScale: function(actor, starTime, endTime, startScale, endScale, interp)
		{
		   var scaleBehavior = new CAAT.ScaleBehavior();
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			actor.scaleX = actor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
			scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
			scaleBehavior.setFrameTime( starTime, endTime );
			scaleBehavior.setCycle(false);
			scaleBehavior.setInterpolator( interp || new CAAT.Interpolator().createLinearInterpolator(false, false) );
			actor.addBehavior(scaleBehavior);

			return scaleBehavior;
		},

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 * @param {CAAT.Actor} actor
		 * @param {Number} starTime
		 * @param {Number} endTime
		 * @param {Number} startAlpha
		 * @param {Number} endAlpha
		 */
		animateInUsingAlpha: function(actor, starTime, endTime, startAlpha, endAlpha)
		{
			var fadeBehavior = new CAAT.AlphaBehavior();

			fadeBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			actor.alpha = fadeBehavior.startAlpha = startAlpha;
			fadeBehavior.endAlpha = endAlpha;
			fadeBehavior.setFrameTime( starTime, endTime );
			fadeBehavior.setCycle(false);
			fadeBehavior.setInterpolator( new CAAT.Interpolator().createExponentialOutInterpolator(2, false) );
			actor.addBehavior(fadeBehavior);

			return fadeBehavior;
		},

		animateABPath:function (actor, startTime, duration, startX, startY, endX, endY, interpolator)
		{
			var path = new CAAT.LinearPath();
			path.setInitialPosition(startX, startY);
			path.setFinalPosition(endX, endY);

			 // setup up a path traverser for the path.
			var pathBehavior = new CAAT.PathBehavior();
				pathBehavior.setPath( path );
				pathBehavior.setFrameTime(startTime, duration);
				pathBehavior.setInterpolator( interpolator || new CAAT.Interpolator().createExponentialOutInterpolator(1, false) );

			return pathBehavior
		},

		/**
		 * Reroutes touch events as mouse events
		 */
		initTouchEventRouter: function()
		{
			// [WebkitMobile] Convert iphone touchevent to mouseevent
			function touchEventRouter(event)
			{
				var touches = event.changedTouches,
						first = touches[0],
						type = "";

				switch (event.type)
				{
					case "touchstart": type = "mousedown"; break;
					case "touchmove": type = "mousemove"; break;
					case "touchend": type = "mouseup"; break;
					default: return;
				}

				var fakeMouseEvent = document.createEvent("MouseEvent");
				fakeMouseEvent.initMouseEvent(type, true, true, window, 1,
						first.screenX, first.screenY,
						first.clientX, first.clientY, false,
						false, false, false, 0/*left*/, null);

				first.target.dispatchEvent(fakeMouseEvent);
				event.preventDefault(); // Block iOS scrollview
			}

			// Catch iOS touch events
			document.addEventListener("touchstart", touchEventRouter, true);
			document.addEventListener("touchmove", touchEventRouter, true);
			document.addEventListener("touchend", touchEventRouter, true);
			document.addEventListener("touchcancel", touchEventRouter, true);
		},

		/**
		 * Creates a sprite actor, and sets the "aController's" actorType property accordingly.
		 * @param {GRAVEDANGER.Circle} aController Controller which will own the sprite created
		 * @return {CAAT.SpriteActor}	A CAAT.SpriteActor
		 */
		createSpriteActor: function(aController)
		{
			var anActor = new CAAT.SpriteActor(),
				anImage = aController.getImage();
			// broken up for debug
			anActor.create().
				setSpriteImage(anImage);

			aController.actorType = GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SPRITE;
			return anActor;
		},

		/**
		 * Creates a ShapeActor, and sets the "aController's" actorType property accordingly.
		 * @param {GRAVEDANGER.Circle} aController Controller which will own the sprite created
		 * @param {CAAT.ShapeActor.prototype.SHAPE_CIRCLE | CAAT.ShapeActor.prototype.SHAPE_RECTANGLE} aShapeType The shapetype
		 * @param {String} aColorString A valid CSS color string
		 * @param {Number} aSize	Radius to create the ShapeActor
		 * @return {CAAT.ShapeActor}	A CAAT.ShapeActor
		 */
		createShapeActor: function(aController, aShapeType, aColorString, aSize)
		{
		  var anActor = new CAAT.ShapeActor().create()
				.setShape( aShapeType )
				.setSize(aSize, aSize); // Size is in diameters

			anActor.setFillStyle(aColorString);
			aController.actorType = GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CANVAS_SHAPE;
			return anActor;
		},

		/**
		 * Creates a CSSActor, and sets the "aController's" actorType property accordingly.
		 * @param {GRAVEDANGER.Circle} aController Controller which will own the sprite created
		 * @param {Number} aWidth	Height of the CSSActor background iamge (TODO: Redundant?)
		 * @param {Number} aHeight	Height of the CSSActor background iamge (TODO: Redundant?)
		 * @return {CAAT.CSSActor}	A CAAT.CSSActor
		 */
		createCSSActor: function(aController, aWidth, aHeight)
		{
			var anActor = new CAAT.CSSActor()
				.createOneday( GRAVEDANGER.CAATHelper.getContainerDiv() )
				.setClassName("actor")
				.setBackground( aController.getImage().image.src )
				.setSize(aWidth, aHeight);

			aController.actorType = GRAVEDANGER.Circle.prototype.ACTOR_TYPES.CSS_SPRITE;
			return anActor;
		},

/**
 * ACCESSORS
 */
		/**
		 * Sets the current scene, also resets all the layers
		 * @param aScene
		 */
		setScene: function(aScene)
		{
			if(this.currentSceneLayers != null) {
				console.error("(CAATHelper) Layers is not null!");
			}

			this.currentSceneLayers = [];
			this.currentScene = aScene;
		},

		/**
		 * Gets the current scene
		 * @return {CAAT.Scene} A scene
		 */
		getScene: function()
		{
			return this.scene;
		},

		/**
		 * Creates a CAAT.Rectangle storing the game dimensions
		 * @param {Number} gameWidth	A width
		 * @param {Number} gameHeight	A height
		 */
		setGameDimensions: function(gameWidth, gameHeight) {
			this.gameDimensions = new CAAT.Rectangle();
			this.gameDimensions.width = gameWidth;
			this.gameDimensions.height = gameHeight;

			// Set the div's size
			var container = this.getContainerDiv();
			container.style['width'] = gameWidth + "px";
			container.style['height'] = gameHeight + "px";
		},

		/**
		 * @returns {CAAT.Rectangle} A rectangle containing the game dimensions
		 */
		getGameDimensions: function() {
			return this.gameDimensions;
		},

		setMousePosition: function(aMousePosition) {
			this.mousePosition = aMousePosition;
		},

		getSceneLayers: function()
		{
			return this.currentSceneLayers;
		},

		setContainerDiv: function(aContainer)
		{
			this.containerDiv = aContainer;
		},

		getContainerDiv: function()
		{
			return this.containerDiv;
		},

		/**
		 * Stores the CAAT.Director singleton instance
		 * @param {CAAT.Director} aDirector A director instance
		 */
		setDirector: function(aDirector) {
			this.director = aDirector;

			// Many options have to reference the director, and we want to avoid multilevel deep nested checks
			// So the lesser of two evens is to store a reference within GRAVEDANGER
			GRAVEDANGER.director = this.director;
			return this;
		},

		/**
		 * @return The director singleton
		 */
		getDirector: function() {
			return this.director;
		},

		/**
		 * Set whether canvas is used or not
		 * @param {Boolean} aValue
		 */
		setUseCanvas: function(aValue)
		{
			this.useCanvas = aValue;
		},

		/**
		 * @return {Boolean} Whether or not we're using canvas (probably determined by isIOS)
		 */
		getUseCanvas: function()
		{
			return this.useCanvas;
		},

		/**
		 * TODO: Check for mobile safari, not iOS
		 * @return {Boolean} Whether the game is being run from a iOS
		 */
		getIsIOS: function()
		{
			if(this.hasCheckedForIOS)
				return this.isIOS;

			// Prevent reg-ex check next time function is called
			this.hasCheckedForIOS = true;
			this.isIOS = !!((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) ) ;
			return this.isIOS
		}
	};
})();