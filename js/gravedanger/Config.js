/**
 File:
 	Config
 Created By:
	Mario Gonzalez
 Project	:
 	GraveDanger
 Abstract:
 	Game Configuration
 Basic Usage:
	Static variables
 */
(function() {
	// Singleton
	GRAVEDANGER.Config =
	{
		// Point value per total chains made
		POINT_VALUES: [10, 50, 80, 150, 300, 400, 500, 700, 900, 1100, 1500, 1800],

		DEFAULT_SCALE: 0.6,

		// How often (in ticks) to drop a head
		DROP_EVERY: 10,

		// Increase speed by this much each level
		SPEED_INCREASE: 1,

		// Level up every N drops
		LEVEL_UP_EVERY:	3,

		ISLAND_EXPIRE_TIME_MIN: 100,
		ISLAND_EXPIRE_TIME_RANGE: 200
	}
})();