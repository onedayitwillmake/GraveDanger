(function()
{
	/**
	 * A singleton object which can help with various static functions used by parts of the game.
	 */
	GRAVEDANGER.CAATHelper = {
		imagePreloader: null,

		// Now
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

		setUseCanvas: function(aValue)
		{
			this.useCanvas = aValue;
		},

		getUseCanvas: function()
		{
			return this.useCanvas;
		},

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