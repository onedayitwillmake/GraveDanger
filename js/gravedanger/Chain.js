(function() {
	GRAVEDANGER.Chain = function() {
		this.links = new SortedLookupTable();
		return this;
	},

	GRAVEDANGER.Chain.prototype = {
		color: -1,
		head: null,
		links: new SortedLookupTable(),

		shouldAddLink: function(aCircle)
		{
			// Not the right color
			if(this.head && aCircle.color != this.head.color)
					return null;

			// Already have it
			if( this.links.objectForKey(aCircle.getUUID()) )
				return false;

			this.addLink(aCircle);

			return aCircle;
		},

		addLink: function(aCircle)
		{
			var alreadyHasHeadLink = false;
			this.links.setObjectForKey(aCircle, aCircle.getUUID() );

			if(!this.head) {
				this.head = aCircle;
			} else {
				this.makeLinkChaseHead();
			}

			this.makeLinkChaseHead();
			return aCircle;
		},

		makeLinkChaseHead: function() {

		},

		getLinks: function() {
			return this.links;
		},

		/**
		 * Memory management
		 */
		dealloc: function() {
			this.links.dealloc();
			this.links = null;
			this.head = null;
		}
	}
})();