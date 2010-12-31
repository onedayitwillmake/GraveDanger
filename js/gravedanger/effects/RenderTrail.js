(function() {
	GRAVEDANGER.EffectsRenderTrail = function() {
		GRAVEDANGER.EffectsRenderTrail.superclass.constructor.call(this);
		return this;
	};

	extend(GRAVEDANGER.EffectsRenderTrail, CAAT.Actor, {
		dep: 0,
		trailLength: 15,
		dotArray: null,
		colorRGBAString: null,

		/**
		 * Creates the RenderTrail using the color specified
		 * @param {CAAT.Color.RGB} aColorRGBA
		 */
		create: function(aColorRGBA)
		{
			GRAVEDANGER.EffectsRenderTrail.superclass.create.call(this);
			this.colorRGBAString = aColorRGBA.toRGBAString(0.5);
			this.dotArray = [];

			return this;
		},

		/**
		 * Paints the render trail
		 * @param {CAAT.Director} director
		 * @param {Number} time
		 */
		paint: function(director, time)
		{
			var positionClone = {x: GRAVEDANGER.CAATHelper.mousePosition.x, y: GRAVEDANGER.CAATHelper.mousePosition.y};
			this.dotArray.push(positionClone);

			var ctx = director.ctx;

			// LIFO
			if(this.dotArray.length > this.trailLength) {
				this.dotArray.shift();
			}

			var dotLength = this.dotArray.length,
				prevPoint = null;

			if(dotLength <= 0) return;


			for(var i = 1; i < dotLength; ++i)
			{
				ctx.beginPath();

				var prevObj = this.dotArray[i-1],
					currentObj = this.dotArray[i];

				// Midpoint
				var point = {x:prevObj.x + (currentObj.x - prevObj.x) * .5,
							y: prevObj.y + (currentObj.y - prevObj.y) * .5};


				var jitter = 2.5;
				point.x += GRAVEDANGER.UTILS.randomFloat(-jitter, jitter);
				point.y += GRAVEDANGER.UTILS.randomFloat(-jitter, jitter);
				/**
				 * Draw a quadratic bezier curve to the next point in the path
				 */
				if(prevPoint) // All except the first one
				{
					ctx.moveTo(prevPoint.x, prevPoint.y);
//					if( window.QueryStringManager.getValue('curveStyle') === 'line' )
						ctx.lineTo(point.x, point.y);
//					else
//						ctx.quadraticCurveTo(prevObj.x, prevObj.y,point.x, point.y);
				} else {
					ctx.moveTo(prevObj.x, prevObj.y);
					ctx.lineTo(point.x, point.y);
				}

				prevPoint = point;

				ctx.lineWidth = i / 1.4;
				ctx.strokeStyle = this.colorRGBAString;
				ctx.stroke();
			}
		},

		destroy: function()
		{
			GRAVEDANGER.EffectsRenderTrail.superclass.destroy.call(this);
			this.dotArray = null;
		}
	});
})();