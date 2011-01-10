(function() {

	// Probably a micro-opt but place these within the closure
	var __chainOffset = 0,
		__PI_2 = Math.PI * 2;

	GRAVEDANGER.Chain = function() {
		this.links = new SortedLookupTable();
		this.linksArray = [];
		return this;
	},

	GRAVEDANGER.Chain.prototype = {
		color: -1,
		head: null,
		effectsRenderTrail: null,
		links: new SortedLookupTable(),
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

		/**
		 * Called when addLink is successful and no 'head' exist
		 * @param {GRAVEDANGER.Circle} aCircle
		 */
		addHead: function(aCircle)
		{
		 	this.head = aCircle;
			this.color = aCircle.color;

			this.head.actor.parent.setZOrder(this.head.actor, Number.MAX_VALUE);

			// Createa render trail actor and add it
			this.effectsRenderTrail = new GRAVEDANGER.EffectsRenderTrail()
					.create(this.head.colorRGB);
			GRAVEDANGER.CAATHelper.currentSceneLayers[0].addChild(this.effectsRenderTrail)        ;

			// TODO: HACK - Should not be modifying scenes time from within Chain
//			GRAVEDANGER.CAATHelper.currentScene.time -= 500;
		},

		addLink: function(aCircle)
		{
			var alreadyHasHeadLink = false;
			this.links.setObjectForKey(aCircle, aCircle.getUUID() );
			this.linksArray.push(aCircle);


			// Set as the head circle if we had none
			if(!this.head) {
				this.addHead(aCircle);
				aCircle.actor.scaleX = aCircle.actor.scaleY = 1;
				aCircle.packedCircle.collisionGroup = GRAVEDANGER.Circle.prototype.COLLISION_GROUPS.ISLANDS;
			} else {
				aCircle.actor.alpha = 0.75;
				aCircle.packedCircle.collisionGroup = 0;
			}

//			console.log(this.head.uuid, aCircle.uuid);

			// Set to ignore collisions
//			aCircle.actor.alpha = 0.75;

//			aCircle.packedCircle.isFixed = true;


			// Create "2xChain!" fanfare
			var chainAnnounceActor = new GRAVEDANGER.EffectsChainAnnounce()
				.create(aCircle.actor, Math.min(this.linksArray.length-1, 7));
			// add to scene
			GRAVEDANGER.CAATHelper.currentSceneLayers[2].addChild(chainAnnounceActor);

			this.ch = chainAnnounceActor;
			return aCircle;
		},

		chaseTarget: function(aTarget)
		{
			var speed = 0.45,
				radius = 50;

			var len = this.linksArray.length,
				piLen = __PI_2 / (len-1),
				previous = null;

			for(var i = 0; i < len; i++)
			{
				var aCircle = this.linksArray[i];
				var chaseTarget;

				// make a circle around the head one
				if(previous)
				{

//					if(this.head.packedCircle.position.getDistanceSquared(aTarget) <  this.head.actor.width*this.head.actor.width) {
//						chaseTarget = aTarget;
//					} else {
						chaseTarget = previous.packedCircle.position;
//					}

					chaseTarget = chaseTarget.clone();
					//previous.packedCircle.position.getDistanceSquared(aTarget)
					chaseTarget.x += Math.cos(i * piLen - __chainOffset) * radius;
					chaseTarget.y += Math.sin(i * piLen- __chainOffset) * -radius;
				} else {
					chaseTarget = aTarget;
				}
				aCircle.chaseTarget(chaseTarget, speed);

				// make the next one chase this one
				previous = aCircle;
			}

			__chainOffset += 0.025;
		},

		getLinks: function() {
			return this.linksArray;
		},

		getHead: function() {
			return this.head;
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
				aCircle.packedCircle.collisionGroup = 1;
				aCircle.returnToDefaultScale();
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

			// Effects rendertrail is only created on first valid link, so if the first passed possible head is invalid, and no new ones are sent before dealloc
			// this.effectsrendertrail will be null
		  	if(this.effectsRenderTrail)
			{
				this.effectsRenderTrail.setDiscardable(true);
				this.effectsRenderTrail.setExpired(true);
			}
			this.effectsRenderTrail = null;
		}
	}
})();