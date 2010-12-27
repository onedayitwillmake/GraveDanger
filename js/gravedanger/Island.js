(function() {
	GRAVEDANGER.Island = function() {
		GRAVEDANGER.Island.superclass.constructor.call(this);
		return this;
	};

	extend( GRAVEDANGER.Island, GRAVEDANGER.Circle, {
		onTick: function(aRadius) {
//			GRAVEDANGER.Island.superclass.animate.call(this, aRadius);
		}
	});
})();