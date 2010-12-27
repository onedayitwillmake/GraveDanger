/**
 File:
 	SimpleDispatcher.js
 Created By:
 	Mario Gonzalez
 Project	:
 	GraveDanger
 Abstract:
 	SimpleDispatcher is an event dispatching utility made for games, as such the focus is on performance.
 	Many objects may listen for the same event (a string)
 	An object may only have one eventListener (a callback) for a given event

 Basic Usage:

///////////////////////////
// Listen for the event //
/////////////////////////
 	someInitializer: function() {
 		GRAVEDANGER.SimpleDispatcher.addListener("warWereDeclared", this.onWarWereDeclared, this)
	},

	onWarWereDeclared: function(event, data) {
 		console.log("(PackedCircleScene)::onWarWereDeclared - ThisObject:", this);
 		console.log("(PackedCircleScene)::onWarWereDeclared - Event:", event);
 		console.log("(PackedCircleScene)::onWarWereDeclared - Data:", data.circle);
	},

////////////////////////////////////////////////////////////////////////////////
// Dispatch the event from some other object, in this case a Circle 'class'  //
//////////////////////////////////////////////////////////////////////////////
 	GRAVEDANGER.SimpleDispatcher.dispatch('warWereDeclared', {circle: this});
 */
(function()
{
  	var events = new SortedLookupTable();

	GRAVEDANGER.SimpleDispatcher = function()
	{
		return this;
	};

	/**
	 * Adds an event listener, with a callback function where the 'thisObject' is the 'scope' variable
	 * @param {String}		event  	A string representing the event
	 * @param {Function}	handler	A callback function, where the 'thisObject' is the provided 'scope' variable
	 * @param {Object}		scope 	The 'thisObject' when the handler callback is called.
	 */
	GRAVEDANGER.SimpleDispatcher.addListener = function(event, handler, scope)
	{
		var eventRef = events.objectForKey(event);

		// Create reference if it doesn't exist
		if (!eventRef) {
			eventRef = events.setObjectForKey([], event);
		}

		eventRef.push({scope: scope, handler: handler});
	};

	/**
	 * Removes an event listener, from an event using the scope to find the match
	 * @param {String} event	A string representing the event
	 * @param {Object} scope	The object which has previously been added to the events listeners array
	 */
	GRAVEDANGER.SimpleDispatcher.removeListener = function(event, scope)
	{
		var arrayOfListeners = events.objectForKey(event);

		// Check it found
		if (!arrayOfListeners) {
			console.log("(Dispatcher)::removeEventListener No such event defined!", event);
		}

		// remove that listener
		var aListenerWasRemoved = false;
		for(var i = arrayOfListeners.length; i >= 0; i--)
		{
			if(arrayOfListeners[i].scope === scope)
			{
				console.log("(Dispatcher)::removeEventListener - Removing event listener'"+event+"' for object", scope);
				aListenerWasRemoved = true;
				arrayOfListeners.splice(i, 1)
			}
		}

		// Tell the user no listener was removed so they can debug superflous calls
		if(!aListenerWasRemoved) {
			console.log("(Dispatcher)::removeEventListener - '" + event +"' did not have any listeners. Avoid superflous calls to removeEventListener if possible.");
		}
	};

	/**
	 * Dispatches an event to all matching listeners
	 * @param {String} event A string representing the event
	 * @param {Object} data  An object containing event information
	 */
	GRAVEDANGER.SimpleDispatcher.dispatch = function(event, data)
	{
		// get all listeners
		var eventRef = events.objectForKey(event);
		if(!eventRef) {
			console.log("(Dispatcher) No such event defined!", event);
			return;
		}


		// if we find listeners, loop trough them and send the event to the listening objects
		var len = eventRef.length;
		for (var i = 0; i < len; i++) {
			eventRef[i].handler.call(eventRef[i].scope, event, data);
		}
	};

})();