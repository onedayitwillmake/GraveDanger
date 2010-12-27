(function(){
	GRAVEDANGER.CAATHelper = function() {
		return this;
	};

	GRAVEDANGER.CAATHelper.prototype = {

		/**
		 * Adds a CAAT.ScaleBehavior to the entity, used on animate in
		 */
		animateInUsingScale: function(actor, starTime, endTime, startScale, endScale)
		{
		   var scaleBehavior = new CAAT.ScaleBehavior();
			scaleBehavior.anchor = CAAT.Actor.prototype.ANCHOR_CENTER;
			actor.scaleX = actor.scaleY = scaleBehavior.startScaleX = scaleBehavior.startScaleY = startScale;  // Fall from the 'sky' !
			scaleBehavior.endScaleX = scaleBehavior.endScaleY = endScale;
			scaleBehavior.setFrameTime( starTime, starTime+endTime );
			scaleBehavior.setCycle(false);
			scaleBehavior.setInterpolator( new CAAT.Interpolator().createBounceOutInterpolator(false) );
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

		randomFromArray: function(anArray) {
			var randomIndex = Math.floor( Math.random() * anArray.length );
		    return anArray[randomIndex];
		}
	};
})();