/**
 File:
 	Dispacther.js
 Created By:
 	Mario Gonzalez
 Project	:
 	Ogilvy Holiday Card 2010
 Abstract:
 	GameEntityFactory is in charge of creating GameEntities
 Basic Usage:
 	// TODO: FILL OUT
 */
(function()
{
  	var events = new SortedLookupTable();

	GRAVEDANGER.SimpleDispatcher = function()
	{
		return this;
	};

	GRAVEDANGER.SimpleDispatcher.addListener = function(event, handler)
	{
		var eventRef = events.objectForKey(event);

		// Create reference if it doesn't exist
		if (!eventRef) {
			eventRef = events.setObjectForKey([], event);
		}

		eventRef.push({handler: handler});
	};

	GRAVEDANGER.SimpleDispatcher.removeEventListener = function(event, handler)
	{

	};

	GRAVEDANGER.SimpleDispatcher.emit = function(event, data)
	{
		// get all listeners
		var eventRef = events.setObjectForKey([], event);
		if(!eventRef) {
//			console.log("(Dispatcher) No such event defined", event);
			return;
		}

		// if we find listeners, loop trough them and send the event to the listening objects
		var len = eventRef.length;
		for (var i = 0; i < len; i++) {
			eventRef[i].handler(event, data);
		}
	};

})();