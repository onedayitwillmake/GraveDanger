(function() {
	var PI_2 = Math.PI * 2;
	GRAVEDANGER.Chain = function() {
		this.links = new SortedLookupTable();
		this.linksArray = [];
		return this;
	},

	GRAVEDANGER.Chain.prototype = {
		color: -1,
		head: null,
		links: new LookupTable(),
		linksArray: [],

		shouldAddLink: function(aCircle)
		{
			// Not the right color
			if(this.head && aCircle.color != this.head.color)
					return null;

			// Already have it
			if( this.links.objectForKey(aCircle.getUUID()) )
				return false;

			// Fixed objects can't be added
			if(aCircle.packedCircle.isFixed)
				return;

			this.addLink(aCircle);

			return aCircle;
		},

		addLink: function(aCircle)
		{
			var alreadyHasHeadLink = false;
			this.links.setObjectForKey(aCircle, aCircle.getUUID() );
			this.linksArray.push(aCircle);

			// Set as the head circle if we had none
			if(!this.head) {
				this.head = aCircle;
				this.color = aCircle.color;
			} else {
				aCircle.actor.alpha = 0.75;
				aCircle.packedCircle.collisionGroup = 0;
			}

			// Set to ignore collisions
//			aCircle.actor.alpha = 0.75;
//			aCircle.scaleX = this.draggedCircle.delegate.scaleY = 0.75;
//			aCircle.packedCircle.isFixed = true;


			// Create "2xChain!" fanfare
			var chainAnnounceActor = new GRAVEDANGER.EffectsChainAnnounce()
				.create(aCircle.actor, Math.min(this.linksArray.length-1, 7));
			// add to scene
			GRAVEDANGER.scene.addChild(chainAnnounceActor);

			return aCircle;
		},

		chaseTarget: function(aTarget)
		{
			var speed = 0.3,
				head = this.head,
				previous = null;

			var len = this.linksArray.length;
			for(var i = 0; i < len; i++) {
				var aCircle = this.linksArray[i];
				var chaseTarget;

				// make a circle around the head one
				if(previous) {
					chaseTarget = previous.packedCircle.position.clone();
					chaseTarget.x += Math.cos(i * PI_2 / len) * 30;
					chaseTarget.y += Math.sin(i * PI_2 / len) * -30;
				} else {
					chaseTarget = aTarget;
				}
				aCircle.chaseTarget(chaseTarget || aTarget, speed);

				// make the next one chase this one
				previous = aCircle;
			}
		},

		getLinks: function() {
			return this.links;
		},

		/**
		 * Given 2 circles, will return the one which is this Chain's 'head', or null if neither
		 * @param {GRAVEDANGER.Circle} aCircle1
		 * @param {GRAVEDANGER.Circle} aCircle2
		 */
		returnHeadInSet: function( aCircle1, aCircle2 )
		{
			if(aCircle1 === this.head)
				return aCircle1;
			else if(aCircle2 === this.head)
				return aCircle2;

			return null;
		},

		releaseAll: function() {
			this.links.forEach(function(key, aCircle) {
				aCircle.packedCircle.isFixed = false;
				aCircle.packedCircle.collisionGroup = 1;
				aCircle.actor.alpha = 1;
			}, this);
		},

		/**
		 * Memory management
		 */
		dealloc: function() {
			this.links.dealloc();
			this.linksArray = null;
			this.links = null;
			this.head = null;
		}
	}
})();