(function() {
	 GRAVEDANGER.Circle = function() {
		 return this;
	 };

	GRAVEDANGER.Circle.prototype = {
		GROUPS: {
			RED: 1 << 0,
			GREEN: 1 << 1,
			BLUE: 1 << 2
		}
	}
})();