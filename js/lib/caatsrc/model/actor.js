/**
 * @author  Hyperandroid  ||  http://hyperandroid.com/
 *
 * Classes to define animable elements.
 * Actor is the superclass of every animable element in the scene graph. It handles the whole
 * affine transformation MatrixStack, rotation, translation, globalAlpha and Behaviours. It also
 * defines input methods.
 * TODO: method to handle keyboard.
 * TODO: add text presentation/animation effects.
 * TODO: add more shapes to ShapeActor
 **/

(function() {

    /**
     * This class is the base for all animable entities in CAAT.
     * It defines an entity able to:
     *
     * <ul>
     * <li>Position itself on screen.
     * <li>Able to modify its presentation aspect via affine transforms.
     * <li>Take control of parent/child relationship.
     * <li>Take track of behaviors (@see CAAT.Behavior).
     * <li>Define a region on screen.
     * <li>Define alpha composition scope.
     * <li>Expose lifecycle.
     * <li>Manage itself in/out scene time.
     * <li>etc.
     * </ul>
     *
     * @constructor
     */
	CAAT.Actor = function() {
		this.transformationMatrix= new CAAT.MatrixStack();
		this.rpoint= new CAAT.Point();
		this.behaviorList= [];
        this.lifecycleListenerList= [];
        this.screenBounds= new CAAT.Rectangle();

		return this;
	};

	CAAT.Actor.prototype= {
        lifecycleListenerList:	null,   // Array of life cycle listener
		behaviorList: 			null,   // Array of behaviors to apply to the Actor
		parent:					null,   // Parent of this Actor. May be Scene.
		x:						0,      // x position on parent. In parent's local coord. system.
		y:						0,      // y position on parent. In parent's local coord. system.
		width:					0,      // Actor's width. In parent's local coord. system.
		height:					0,      // Actor's height. In parent's local coord. system.
		start_time:				0,      // Start time in Scene time.
		duration:				Number.MAX_VALUE,   // Actor duration in Scene time
		transformationMatrix:	null,   // Compound transformation matrix stack.
		rpoint:					null,   // Cache for rotation when calculating coordinates transformations.
		clip:					false,  // should clip the Actor's content against its contour.

        scaleX:					0,      // transformation. width scale parameter
		scaleY:					0,      // transformation. height scale parameter
		scaleTX:				0,      // transformation. scale anchor x position
		scaleTY:				0,      // transformation. scale anchor y position
		scaleAnchor:			0,      // transformation. scale anchor
		rotationAngle:			0,      // transformation. rotation angle in radians
		rotationY:				0,      // transformation. rotation center y
        alpha:					1,      // alpha transparency value
        rotationX:				0,      // transformation. rotation center x
        isGlobalAlpha:          false,  // is this a global alpha
        frameAlpha:             1,      // hierarchically calculated alpha for this Actor.
		expired:				false,  // set when the actor has been expired
		discardable:			false,  // set when you want this actor to be removed if expired
		pointed:				false,  // is the mouse pointer inside this actor
		mouseEnabled:			true,   // events enabled ?

		ANCHOR_CENTER:			0,      // constant values to determine different affine transform
		ANCHOR_TOP:				1,      // anchors.
		ANCHOR_BOTTOM:			2,
		ANCHOR_LEFT:			3,
		ANCHOR_RIGHT:			4,
		ANCHOR_TOP_LEFT:		5,
		ANCHOR_TOP_RIGHT:		6,
		ANCHOR_BOTTOM_LEFT:		7,
		ANCHOR_BOTTOM_RIGHT:	8,
        ANCHOR_CUSTOM:          9,

		fillStyle:				null,   // any canvas rendering valid fill style.
        strokeStyle:            null,   // any canvas rendering valid stroke style.
        time:                   0,      // Cache Scene time.
        screenBounds:           null,   // CAAT.Rectangle
        inFrame:                false,  // boolean indicating whether this Actor was present on last frame.

        dirty:                  true,

        /**
         * Puts an Actor out of time line, that is, won't be transformed nor rendered.
         * @return this
         */
        setOutOfFrameTime : function() {
            this.setFrameTime(-1,0);
            return this;
        },
        /**
         * Adds an Actor's life cycle listener.
         * The developer must ensure the actorListener is not already a listener, otherwise
         * it will notified more than once.
         * @param actorListener {object} an object with at least a method of the form:
         * <code>actorLyfeCycleEvent( actor, string_event_type, long_time )</code>
         */
		addListener : function( actorListener ) {
			this.lifecycleListenerList.push(actorListener);
		},
        /**
         * Removes an Actor's life cycle listener.
         * It will only remove the first occurrence of the given actorListener.
         * @param actorListener {object} an Actor's life cycle listener.
         */
        removeListener : function( actorListener ) {
            var n= this.lifecycleListenerList.length;
            while(n--) {
                if ( this.lifecycleListenerList[n]==actorListener ) {
                    // remove the nth element.
                    this.lifecycleListenerList.splice(n,1);
                    return;
                }
            }
        },
        /**
         * Set alpha composition scope. global will mean this alpha value will be its children maximum.
         * If set to false, only this actor will have this alpha value.
         * @param global {boolean} whether the alpha value should be propagated to children.
         */
        setGlobalAlpha : function( global ) {
            this.isGlobalAlpha= global;
            return this;
        },
        /**
         * Notifies the registered Actor's life cycle listener about some event.
         * @param sEventType an string indicating the type of event being notified.
         * @param time an integer indicating the time related to Scene's timeline when the event
         * is being notified.
         */
        fireEvent : function(sEventType, time)	{
            for( var i=0; i<this.lifecycleListenerList.length; i++ )	{
                this.lifecycleListenerList[i].actorLyfeCycleEvent(this, sEventType, time);
            }
        },
        /**
         * Calculates the 2D bounding box in canvas coordinates of the Actor.
         * This bounding box takes into account the transformations applied hierarchically for
         * each Scene Actor.
         *
         * @private
         *
         */
        setScreenBounds : function() {

            var p=[];
            p.push( new CAAT.Point().set(0,0) );
            p.push( new CAAT.Point().set(this.width, this.height) );
            p.push( new CAAT.Point().set(0,            this.height) );
            p.push( new CAAT.Point().set(this.width, 0) );

            for( var k=0; k<p.length; k++ ) {
                this.transformCoord( p[k] );
            }

            var xmin= Number.MAX_VALUE, xmax=Number.MIN_VALUE;
            var ymin= Number.MAX_VALUE, ymax=Number.MIN_VALUE;

            for( var i=0; i<p.length; i++ ) {
                if ( p[i].x < xmin ) {
                    xmin=p[i].x;
                }
                if ( p[i].x > xmax ) {
                    xmax=p[i].x;
                }

                if ( p[i].y < ymin ) {
                    ymin=p[i].y;
                }
                if ( p[i].y > ymax ) {
                    ymax=p[i].y;
                }
            }

            this.screenBounds.x= xmin;
            this.screenBounds.y= ymin;
            this.screenBounds.width=  xmax-xmin;
            this.screenBounds.height= ymax-ymin;

        },
        /**
         * Sets this Actor as Expired.
         * If this is a Container, all the contained Actors won't be nor drawn nor will receive
         * any event. That is, expiring an Actor means totally taking it out the Scene's timeline.
         * @param time {number} an integer indicating the time the Actor was expired at.
         * @return this.
         */
        setExpired : function(time) {
            this.expired= true;
            this.fireEvent('expired',time);
            return this;
        },
        /**
         * Enable or disable the event bubbling for this Actor.
         * @param enable {boolean} a boolean indicating whether the event bubbling is enabled.
         * @return this
         */
        enableEvents : function( enable ) {
            this.mouseEnabled= enable;
            return this;
        },
        /**
         * Removes all behaviors from an Actor.
         * @return this
         */
		emptyBehaviorList : function() {
			this.behaviorList=[];
            return this;
		},
        /**
         * Caches a fillStyle in the Actor.
         * @param style a valid Canvas rendering context fillStyle.
         * @return this
         */
        setFillStyle : function( style ) {
			this.fillStyle= style;
            return this;
        },
        /**
         * Caches a stroke style in the Actor.
         * @param style a valid canvas rendering context stroke style.
         * @return this
         */
        setStrokeStyle : function( style ) {
            this.strokeStyle= style;
            return this;
        },
        /**
         * @deprecated
         * @param paint
         */
		setPaint : function( paint )	{
            return this.setFillStyle(paint);
		},
        /**
         * Stablishes the Alpha transparency for the Actor.
         * If it globalAlpha enabled, this alpha will the maximum alpha for every contained actors.
         * The alpha must be between 0 and 1.
         * @param alpha a float indicating the alpha value.
         * @return this
         */
		setAlpha : function( alpha )	{
			this.alpha= alpha;
            return this;
		},
        /**
         * Remove all transformation values for the Actor.
         * @return this
         */
		resetTransform : function () {
			this.rotationAngle=0;
			this.rotateAnchor=0;
			this.rotationX=0;
			this.rotationY=0;
			this.scaleX=1;
			this.scaleY=1;
			this.scaleTX=0;
			this.scaleTY=0;
			this.scaleAnchor=0;
            this.dirty= true;

            return this;
		},
        /**
         * Sets the time life cycle for an Actor.
         * These values are related to Scene time.
         * @param startTime an integer indicating the time until which the Actor won't be visible on the Scene.
         * @param duration an integer indicating how much the Actor will last once visible.
         * @return this
         */
		setFrameTime : function( startTime, duration ) {
			this.start_time= startTime;
			this.duration= duration;
			this.expired= false;
            this.dirty= true;

            return this;
		},
        /**
         * This method should me overriden by every custom Actor.
         * It will be the drawing routine called by the Director to show every Actor.
         * @param director the CAAT.Director instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time in which the drawing is performed.
         */
		paint : function(director, time) {

			var ctx= director.crc;

			if ( null!=this.parent && null!=this.fillStyle ) {
				ctx.fillStyle= this.pointed ? 'orange' : (this.fillStyle!=null ? this.fillStyle : 'white'); //'white';
				ctx.fillRect(0,0,this.width,this.height );
			}

            /*
            if ( null!=this.strokeStyle ) {
                ctx.strokeStyle= this.strokeStyle;
                ctx.strokeRect(0,0,this.width,this.height);
            }
            */
		},
        /**
         * A helper method to setScaleAnchored with an anchor of ANCHOR_CENTER
         *
         * @see setScaleAnchored
         *
         * @param sx a float indicating a width size multiplier.
         * @param sy a float indicating a height size multiplier.
         * @return this
         */
		setScale : function( sx, sy )    {
			this.setScaleAnchored( sx, sy, this.ANCHOR_CENTER );
            this.dirty= true;
            return this;
		},
        /**
         * Private.
         * Gets a given anchor position referred to the Actor.
         * @param anchor
         * @return an object of the form { x: float, y: float }
         */
		getAnchor : function( anchor ) {
			var tx=0, ty=0;

			switch( anchor ) {
            case this.ANCHOR_CENTER:
            	tx= this.width/2;
            	ty= this.height/2;
                break;
            case this.ANCHOR_TOP:
            	tx= this.width/2;
            	ty= 0;
                break;
            case this.ANCHOR_BOTTOM:
            	tx= this.width/2;
            	ty= this.height;
                break;
            case this.ANCHOR_LEFT:
            	tx= 0;
            	ty= this.height/2;
                break;
            case this.ANCHOR_RIGHT:
            	tx= this.width;
            	ty= this.height/2;
                break;
            case this.ANCHOR_TOP_RIGHT:
            	tx= this.width;
            	ty= 0;
                break;
            case this.ANCHOR_BOTTOM_LEFT:
            	tx= 0;
            	ty= this.height;
                break;
            case this.ANCHOR_BOTTOM_RIGHT:
            	tx= this.width;
            	ty= this.height;
                break;
            case this.ANCHOR_TOP_LEFT:
            	tx= 0;
            	ty= 0;
                break;
	        }

			return {x: tx, y: ty};
		},
        /**
         * Modify the dimensions on an Actor.
         * The dimension will not affect the local coordinates system in opposition
         * to setSize or setBounds.
         *
         * @param sx a float indicating a width size multiplier.
         * @param sy a float indicating a height size multiplier.
         * @param anchor an integer indicating the anchor to perform the Scale operation.
         *
         * @return this;
         */
		setScaleAnchored : function( sx, sy, anchor )    {
			this.scaleAnchor= anchor;

			var obj= this.getAnchor( this.scaleAnchor );

			this.scaleTX= obj.x;
			this.scaleTY= obj.y;

			this.scaleX=sx;
			this.scaleY=sy;

            this.dirty= true;

            return this;
		},
        /**
         * A helper method for setRotationAnchored. This methods stablishes the center
         * of rotation to be the center of the Actor.
         *
         * @param angle a float indicating the angle in radians to rotate the Actor.
         * @return this
         */
	    setRotation : function( angle )	{
			this.setRotationAnchored( angle, this.width/2, this.height/2 );

            return this;
	    },
        /**
         * This method sets Actor rotation around a given position.
         * @param angle a float indicating the angle in radians to rotate the Actor.
         * @param rx
         * @param ry
         * @return this;
         */
	    setRotationAnchored : function( angle, rx, ry ) {
	    	this.rotationAngle= angle;
	    	this.rotationX= rx?rx:0;
	    	this.rotationY= ry?ry:0;

            this.dirty= true;

            return this;
	    },
        /**
         * Sets an Actor's dimension
         * @param w a float indicating Actor's width.
         * @param h a float indicating Actor's height.
         * @return this
         */
	    setSize : function( w, h )   {
	    	this.width= w>>0;
	    	this.height= h>>0;

            return this;
	    },
        /**
         * Set location and dimension of an Actor at once.
         *
         * as http://jsperf.com/drawimage-whole-pixels states, drawing at whole pixels rocks while at subpixels sucks.
         * thanks @pbakaus
         *
         * @param x a float indicating Actor's x position.
         * @param y a float indicating Actor's y position
         * @param w a float indicating Actor's width
         * @param h a float indicating Actor's height
         * @return this
         */
	    setBounds : function(x, y, w, h)  {
	    	//this.x= x;
	    	//this.y= y;
            this.x= x>>0;
            this.y= y>>0;
	    	this.width= w>>0;
	    	this.height= h>>0;

            return this;
	    },
        /**
         * This method sets the position of an Actor inside its parent.
         *
         * as http://jsperf.com/drawimage-whole-pixels states, drawing at whole pixels rocks while at subpixels sucks.
         * thanks @pbakaus
         *
         * @param x a float indicating Actor's x position
         * @param y a float indicating Actor's y position
         * @return this
         */
	    setLocation : function( x, y ) {
	        //this.x= x;
	        //this.y= y;
            this.x= x>>0;
            this.y= y>>0;

            return this;
	    },
        /**
         * This method is called by the Director to know whether the actor is on Scene time.
         * In case it was necessary, this method will notify any life cycle behaviors about
         * an Actor expiration.
         * @param time an integer indicating the Scene time.
         *
         * @private
         *
         */
	    isInAnimationFrame : function(time)    {
            if ( this.expired )	{
                return false;
            }

	    	if ( this.duration==Number.MAX_VALUE ) {
	    		return this.start_time<=time;
	    	}

			if ( time>=this.start_time+this.duration )	{
				if ( !this.expired )	{
					this.setExpired(time);
				}

				return false;
			}

	    	return this.start_time<=time && time<this.start_time+this.duration;
	    },
        /**
         * Checks whether a coordinate is inside the Actor's bounding box.
         * @param x {number} a float
         * @param y {number} a float
         *
         * @return boolean indicating whether it is inside.
         */
	    contains : function(x, y) {
	        return x>=0 && y>=0 && x<this.width && y<this.height;
	    },
        /**
         * This method must be called explicitly by every CAAT Actor.
         * Making the life cycle explicitly initiated has always been a good idea.
         *
         * @return this
         */
		create : function()	{
	    	this.scaleAnchor= this.ANCHOR_CENTER;
	    	this.rotateAnchor= this.ANCHOR_CENTER;
	    	this.setScale(1,1);
	    	this.setRotation(0);
	        this.behaviorList= [];

            return this;
		},
        /**
         * Add a Behavior to the Actor.
         * An Actor accepts an undefined number of Behaviors.
         *
         * @param behavior {CAAT.Behavior} a CAAT.Behavior instance
         * @return this
         */
		addBehavior : function( behavior )	{
			this.behaviorList.push(behavior);
            return this;
		},
        /**
         * Remove a Behavior from the Actor.
         * If the Behavior is not present at the actor behavior collection nothing happends.
         *
         * @param behavior {CAAT.Behavior} a CAAT.Behavior instance.
         */
        removeBehaviour : function( behavior ) {
            var n= this.behaviorList.length-1;
            while(n) {
                if ( this.behaviorList[n]==behavior ) {
                    this.behaviorList.splice(n,1);
                    return this;
                }
            }

            return this;
        },
        /**
         * Remove a Behavior with id param as behavior identifier from this actor.
         * This function will remove ALL behavior instances with the given id.
         *
         * @param id {number} an integer.
         * return this;
         */
        removeBehavior : function( id ) {
            for( var n=0; n<this.behaviorList.length; n++ ) {
                if ( this.behaviorList[n].id==id) {
                    this.behaviorList.splice(n,1);
                }
            }

            return this;

        },
        /**
         * Set discardable property. If an actor is discardable, upon expiration will be removed from
         * scene graph and hence deleted.
         * @param discardable {boolbean} a boolean indicating whether the Actor is discardable.
         * @return this
         */
        setDiscardable : function( discardable ) {
            this.discardable= discardable;
            return this;
        },
        /**
         * This method will be called internally by CAAT when an Actor is expired, and at the
         * same time, is flagged as discardable.
         * It notifies the Actor life cycle listeners about the destruction event.
         *
         * @param time an integer indicating the time at wich the Actor has been destroyed.
         *
         * @private
         *
         */
		destroy : function(time)	{
            this.fireEvent('destroyed',time);
		},
        /**
         * @param point {CAAT.Point} an object of the form {x : float, y: float}
         *
         * @return the source point object
         *
         * @private
         *
         */
        transformCoord : function(point) {
            var tthis= this;

            while( !(tthis instanceof CAAT.Director) ) {
                tthis.transformationMatrix.transformCoord(point);
                tthis= tthis.parent;
            }

            return point;
        },
        /**
         * @param point an object of the form {x : float, y: float}
         *
         * @return the source point object
         *
         * @private
         *
         */
		inverseTransformCoord : function(point) {
			var tthis= this;
			while( tthis) {
				tthis.transformationMatrix.inverseTransformCoord(point);
				tthis= tthis.parent;
			}

			return point;
		},
        /**
         * Private
         * This method does the needed point transformations across an Actor hierarchy to devise
         * whether the parameter point coordinate lies inside the Actor.
         * @param point an object of the form { x: float, y: float }
         *
         * @return null if the point is not inside the Actor. The Actor otherwise.
         */
	    findActorAtPosition : function(point) {
			if ( !this.mouseEnabled || !this.isInAnimationFrame(this.time) ) {
				return null;
			}

			this.rpoint.set( point.x, point.y );
	    	this.transformationMatrix.inverseTransformCoord(this.rpoint);
	    	return this.contains(this.rpoint.x, this.rpoint.y) ? this :null;
	    },
        /**
         * Enables a default dragging routine for the Actor.
         * This default dragging routine allows to:
         *  <li>scale the Actor by pressing shift+drag
         *  <li>rotate the Actor by pressing control+drag
         *  <li>scale non uniformly by pressing alt+shift+drag
         *
         * @return this
         */
	    enableDrag : function() {

			this.ax= 0;
			this.ay= 0;
			this.mx= 0;
			this.my= 0;
			this.asx=1;
			this.asy=1;
			this.ara=0;
			this.screenx=0;
			this.screeny=0;

            /**
             * Mouse enter handler for default drag behavior.
             * @param mouseEvent {CAAT.MouseEvent}
             *
             * @inner
             */
	    	this.mouseEnter= function(mouseEvent) {
				this.ax= -1;
				this.ay= -1;
		    	this.pointed= true;
		    	document.body.style.cursor = 'move';
	    	};

            /**
             * Mouse exit handler for default drag behavior.
             * @param mouseEvent {CAAT.MouseEvent}
             *
             * @inner
             */
	    	this.mouseExit= function(mouseEvent) {
				this.ax= -1;
				this.ay= -1;
				this.pointed= false;
				document.body.style.cursor = 'default';
	    	};

            /**
             * Mouse move handler for default drag behavior.
             * @param mouseEvent {CAAT.MouseEvent}
             *
             * @inner
             */
	    	this.mouseMove= function(mouseEvent) {
				this.mx= mouseEvent.point.x;
				this.my= mouseEvent.point.y;
	    	};

            /**
             * Mouse up handler for default drag behavior.
             * @param mouseEvent {CAAT.MouseEvent}
             *
             * @inner
             */
	    	this.mouseUp= function( mouseEvent) {
				this.ax= -1;
				this.ay= -1;
	    	};

            /**
             * Mouse drag handler for default drag behavior.
             * @param mouseEvent {CAAT.MouseEvent}
             *
             * @inner
             */
	    	this.mouseDrag= function(mouseEvent) {

				if ( this.ax==-1 || this.ay==-1 ) {
					this.ax= mouseEvent.point.x;
					this.ay= mouseEvent.point.y;
					this.asx= this.scaleX;
					this.asy= this.scaleY;
					this.ara= this.rotationAngle;
					this.screenx= mouseEvent.screenPoint.x;
					this.screeny= mouseEvent.screenPoint.y;
				}

				if ( mouseEvent.isShiftDown() ) {
					var scx= (mouseEvent.screenPoint.x-this.screenx)/100;
					var scy= (mouseEvent.screenPoint.y-this.screeny)/100;
					if ( !mouseEvent.isAltDown() ) {
						var sc= Math.max( scx, scy );
						scx= sc;
						scy= sc;
					}
					this.setScale( scx+this.asx, scy+this.asy );

				} else if ( mouseEvent.isControlDown() ) {
					var vx=  mouseEvent.screenPoint.x - this.screenx;
					var vy=  mouseEvent.screenPoint.y - this.screeny;
					this.setRotation( -Math.atan2( vx, vy ) + this.ara );
				} else {
					this.x+= mouseEvent.point.x-this.ax;
					this.y+= mouseEvent.point.y-this.ay;
					this.ax= mouseEvent.point.x;
					this.ay= mouseEvent.point.y;
				}


	    	};

            return this;
	    },
        /**
         * Default mouseClick handler.
         * Mouse click events are received after a call to mouseUp method if no dragging was in progress.
         *
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
	    mouseClick : function(mouseEvent) {
	    },
        /**
         * Default double click handler
         *
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
	    mouseDblClick : function(mouseEvent) {
	    },
        /**
         * Default mouse enter on Actor handler.
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
		mouseEnter : function(mouseEvent) {
	    	this.pointed= true;
		},
        /**
         * Default mouse exit on Actor handler.
         *
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
		mouseExit : function(mouseEvent) {
			this.pointed= false;
		},
        /**
         * Default mouse move inside Actor handler.
         *
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
		mouseMove : function(mouseEvent) {
		},
        /**
         * default mouse press in Actor handler.
         *
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
		mouseDown : function(mouseEvent) {
		},
        /**
         * default mouse release in Actor handler.
         *
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
		mouseUp : function(mouseEvent) {
		},
        /**
         * default Actor mouse drag handler.
         *
         * @param mouseEvent a CAAT.MouseEvent object instance.
         */
		mouseDrag : function(mouseEvent) {
		},
        /**
         * Draw a bounding box with on-screen coordinates regardless of the transformations
         * applied to the Actor.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
        drawScreenBoundingBox : function( director, time ) {
            if ( this.inFrame && null!=this.screenBounds ) {
                director.crc.strokeStyle='red';
                director.crc.strokeRect(
                    this.screenBounds.x, this.screenBounds.y,
                    this.screenBounds.width, this.screenBounds.height );
            }
        },
        /**
         * Private
         * This method is called by the Director instance.
         * It applies the list of behaviors the Actor has registered.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
		animate : function(director, time) {
			for( var i=0; i<this.behaviorList.length; i++ )	{
				this.behaviorList[i].apply(time,this);
			}
		},
        /**
         * Private.
         * This method will be called by the Director to set the whole Actor pre-render process.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         *
         * @return boolean indicating whether the Actor isInFrameTime
         */
        paintActor : function(director, time) {

            if ( !this.isInAnimationFrame(time) ) {
                this.inFrame= false;
                return false;
            }

            var canvas= director.crc;

            this.frameAlpha= this.parent.frameAlpha*this.alpha;
            canvas.globalAlpha= this.frameAlpha;

            this.transformationMatrix.prepareGraphics(canvas,this);
            this.setScreenBounds();

            if ( this.clip ) {
                canvas.beginPath();
                canvas.rect(0,0,this.width,this.height);
                canvas.clip();
            }

            this.paint(director, time);

            this.inFrame= true;

            return true;
        },
        /**
         * Private.
         * This method is called after the Director has transformed and drawn a whole frame.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         * @return this
         */
        endAnimate : function(director,time) {
            return this;
        },
        initialize : function(overrides) {
            if (overrides) {
               for (var i in overrides) {
                  this[i] = overrides[i];
               }
            }

            return this;
        },
        /**
         * Enable or disable the clipping process for this Actor.
         *
         * @param clip a boolean indicating whether clip is enabled.
         * @return this
         */
        setClip : function( clip ) {
            this.clip= clip;
            return this;
        }
	};

})();


(function() {

    /**
     * This class is a general container of CAAT.Actor instances. It extends the concept of an Actor
     * from a single entity on screen to a set of entities with a parent/children relationship among
     * them.
     * <p>
     * This mainly overrides default behavior of a single entity and exposes methods to manage its children
     * collection.
     *
     * @constructor
     * @extends CAAT.Actor
     */
	CAAT.ActorContainer= function() {
		CAAT.ActorContainer.superclass.constructor.call(this);
		this.childrenList= [];
        this.pendingChildrenList= [];
		return this;
	};


	CAAT.ActorContainer.prototype= {

        childrenList : null,       // the list of children contained.
        pendingChildrenList : null,

        /**
         * Draws this ActorContainer and all of its children screen bounding box.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
        drawScreenBoundingBox : function( director, time ) {

            if (!this.inFrame) {
                return;
            }

            for( var i=0; i<this.childrenList.length; i++ ) {
                this.childrenList[i].drawScreenBoundingBox(director,time);
            }
            CAAT.ActorContainer.superclass.drawScreenBoundingBox.call(this,director,time);

        },
        /**
         * Removes all children from this ActorContainer.
         *
         * @return this
         */
        emptyChildren : function() {
            this.childrenList= [];

            return this;
        },
        /**
         * Private
         * Paints this container and every contained children.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
        paintActor : function(director, time ) {
            var canvas= director.crc;

            canvas.save();

            if (!CAAT.ActorContainer.superclass.paintActor.call(this,director,time)) {
                return false;
            }

            if ( !this.isGlobalAlpha ) {
                this.frameAlpha= this.parent.frameAlpha;
            }

            for( var i=0; i<this.childrenList.length; i++ ) {
                canvas.save();
                this.childrenList[i].paintActor(director,time);
                canvas.restore();
            }
            canvas.restore();

            return true;
        },
        /**
         * Private.
         * Performs the animate method for this ActorContainer and every contained Actor.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         *
         * @return this
         */
		animate : function(director,time) {

            CAAT.ActorContainer.superclass.animate.call(this,director,time);

            var i;

            for( i=0; i<this.childrenList.length; i++ ) {
                if (this.childrenList[i].isInAnimationFrame(time)) {
                    this.childrenList[i].time= time;
                    this.childrenList[i].animate(director, time);
                }
            }

            return this;
		},
        /**
         * Removes Actors from this ActorContainer which are expired and flagged as Discardable.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
        endAnimate : function(director,time) {

            CAAT.ActorContainer.superclass.endAnimate.call(this,director,time);

            var i;
            // remove expired and discardable elements.
            for( i=this.childrenList.length-1; i>=0; i-- ) {
                var actor= this.childrenList[i];
                if ( actor.expired && actor.discardable ) {
                    actor.destroy(time);
                    this.childrenList.splice(i,1);
                } else {
                    actor.endAnimate(director,time);
                }
            }

            for( i=0; i<this.pendingChildrenList.length; i++ ) {
                var child= this.pendingChildrenList[i];
                child.parent =  this;
                this.childrenList.push(child);
            }
            this.pendingChildrenList= [];
        },
        /**
         * Adds an Actor to this Container.
         * The Actor will be added ON METHOD CALL, despite the rendering pipeline stage being executed at
         * the time of method call.
         *
         * This method is only used by CAAT.Director's transitionScene.
         *
         * @param child a CAAT.Actor instance.
         * @return this.
         */
        addChildImmediately : function(child) {
            return this.addChild(child);
        },
        /**
         * Adds an Actor to this ActorContainer.
         * The Actor will be added to the container AFTER frame animation, and not on method call time.
         * Except the Director and in orther to avoid visual artifacts, the developer SHOULD NOT call this
         * method directly.
         *
         * @param child a CAAT.Actor object instance.
         * @return this
         */
		addChild : function(child) {
            child.parent= this;
            this.childrenList.push(child);
            return this;
		},
        addChildDelayed : function(child) {
            this.pendingChildrenList.push(child);
            return this;
        },
        /**
         * Adds an Actor to this ActorContainer.
         *
         * @param child a CAAT.Actor object instance.
         *
         * @return this
         */
		addChildAt : function(child, index) {

			if( index < 0 || index > this.childrenList.length )
				return this;

			child.parent= this;
			this.childrenList.unshift(child);

            return this;
		},
        /**
         * Private
         * Gets a contained Actor z-index on this ActorContainer.
         *
         * @param child a CAAT.Actor object instance.
         *
         * @return an integer indicating the Actor's z-order.
         */
		findChild : function(child) {
            var i=0,
				len = this.childrenList.length;
			for( i=0; i<len; i++ ) {
				if ( this.childrenList[i]==child ) {
					return i;
				}
			}
			return -1;
		},
        /**
         * Removed an Actor form this ActorContainer.
         * If the Actor is not contained into this Container, nothing happends.
         *
         * @param child a CAAT.Actor object instance.
         *
         * @return this
         */
		removeChild : function(child) {
			var pos= this.findChild(child);
			if ( -1!=pos ) {
				this.childrenList.splice(pos,1);
			}

            return this;
		},
        /**
         * Private
         *
         * Gets the Actor inside this ActorContainer at a given Screen coordinate.
         *
         * @param point an object of the form { x: float, y: float }
         *
         * @return the Actor contained inside this ActorContainer if found, or the ActorContainer itself.
         */
		findActorAtPosition : function(point) {

			if( null==CAAT.ActorContainer.superclass.findActorAtPosition.call(this,point) ) {
				return null;
			}

			// z-order
			for( var i=this.childrenList.length-1; i>=0; i-- ) {
				var contained= this.childrenList[i].findActorAtPosition( this.rpoint );
				if ( null!=contained ) {
					return contained;
				}
			}

			return this;
		},
        /**
         * Destroys this ActorContainer.
         * The process falls down recursively for each contained Actor into this ActorContainer.
         *
         * @return this
         */
        destroy : function() {
            for( var i=this.childrenList.length-1; i>=0; i-- ) {
                this.childrenList[i].destroy();
            }
            CAAT.ActorContainer.superclass.destroy.call(this);

            return this;
        },
        /**
         * Get number of Actors into this container.
         * @return integer indicating the number of children.
         */
        getNumChildren : function() {
            return this.childrenList.length;
        },
        /**
         * Returns the Actor at the iPosition(th) position.
         * @param iPosition an integer indicating the position array.
         * @return the CAAT.Actor object at position.
         */
        getChildAt : function( iPosition ) {
            return this.childrenList[ iPosition ];
        },
        /**
         * Changes an actor's ZOrder.
         * @param actor the actor to change ZOrder for
         * @param index an integer indicating the new ZOrder. a value greater than children list size means to be the
         * last ZOrder Actor.
         */
        setZOrder : function( actor, index ) {
            var actorPos= this.findChild(actor);
            // the actor is present
            if ( -1!=actorPos ) {

                // trivial reject.
                if ( index==actorPos ) {
                    return;
                }

                if ( index>=this.childrenList.length ) {
					this.childrenList.splice(actorPos,1);
					this.childrenList.push(actor);
                } else {
                    var nActor= this.childrenList.splice(actorPos,1);
                    if ( index<0 ) {
                        index=0;
                    } else if ( index>this.childrenList.length ) {
                        index= this.childrenList.length;
                    }

                    this.childrenList.splice( index, 1, nActor );
                }
            }
        }
	};

    extend( CAAT.ActorContainer, CAAT.Actor, null);

})();


(function() {

    /**
     *
     * <p>
     * This class defines a simple Sprite sheet. A Sprite sheet is given by an instance of CAAT.CompoundImage,
     * which given a single image, you can define rows by columns sub-images contained in it. Then an array
     * of values indicating indexes to these sub-images is used to draw the sprite.
     *
     * <p>
     * The following is a valid example of CAAT.SpriteActor declaration:
     * <p>
     * <code>
     *  // define a compound image as 1 row by 3 columns.<br>
     *  var conpoundimage = new CAAT.CompoundImage().initialize( director.getImage('fish'), 1, 3);<br>
     *  <br>
     *  // create a fish instance<br>
     *  var fish = new CAAT.SpriteActor().<br>
     *              create().<br>
     *              setAnimationImageIndex( [0,1,2,1] ).// rotating from subimages 0,1,2,1<br>
	 *              setSpriteImage(conpoundimage).      // throughtout this compound image<br>
     *              setChangeFPS(350).                  // and change from image on the sheet every 350ms.<br>
     *              setLocation(10,10);                 // btw, the fish actor will be at 10,10 on screen.<br>
     * <br>
     * </code><br>
     *
     * @constructor
     * @extends CAAT.ActorContainer
     *
     */
	CAAT.SpriteActor = function() {
		CAAT.SpriteActor.superclass.constructor.call(this);
		return this;
	};

	CAAT.SpriteActor.prototype= {
		compoundbitmap:			null,   // CAAT.CompoundBitmap instance
		animationImageIndex:	null,   // an Array defining the sprite frame sequence
		prevAnimationTime:		-1,
		changeFPS:				1000,   // how much Scene time to take before changing an Sprite frame.
		transformation:			0,      // any of the TR_* constants.
		spriteIndex:			0,      // the current sprite frame

		TR_NONE:				0,      // constants used to determine how to draw the sprite image,
		TR_FLIP_HORIZONTAL:		1,
		TR_FLIP_VERTICAL:		2,
		TR_FLIP_ALL:			3,

        /**
         * Sets the Sprite image. The image will be trrated as an array of rows by columns subimages.
         *
         * @see CAAT.CompoundImage
         * @param conpoundimage a CAAT.ConpoundImage object instance.
         * @return this
         */
		setSpriteImage : function(conpoundimage) {
			this.compoundbitmap= conpoundimage;
			this.width= conpoundimage.singleWidth;
			this.height= conpoundimage.singleHeight;
			if ( null==this.animationImageIndex ) {
				this.setAnimationImageIndex([0]);
			}

            return this;
		},
        /**
         * Set the elapsed time needed to change the image index.
         * @param fps an integer indicating the time in milliseconds to change.
         * @return this
         */
        setChangeFPS : function(fps) {
            this.changeFPS= fps;
            return this;
        },
        /**
         * Set the transformation to apply to the Sprite image.
         * Any value of
         *  <li>TR_NONE
         *  <li>TR_FLIP_HORIZONTAL
         *  <li>TR_FLIP_VERTICAL
         *  <li>TR_FLIP_ALL
         *
         * @param transformation an integer indicating one of the previous values.
         * @return this
         */
        setSpriteTransformation : function( transformation ) {
            this.transformation= transformation;
            return this;
        },
        /**
         * Set the sprite animation images index.
         *
         * @param aAnimationImageIndex an array indicating the Sprite's frames.
         */
		setAnimationImageIndex : function( aAnimationImageIndex ) {
			this.animationImageIndex= aAnimationImageIndex;
			this.spriteIndex= aAnimationImageIndex[0];

            return this;
		},
        /**
         * Customization of the default CAAT.Actor.animate method.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
		animate : function( director, time )	{

			if ( this.compoundbitmap && this.animationImageIndex )	{

				if ( this.animationImageIndex.length>1 ) {
					if ( this.prevAnimationTime==-1 )	{
						this.prevAnimationTime= time;
					}
					else	{
						var ttime= time;
						ttime-= this.prevAnimationTime;
						ttime/= this.changeFPS;
						ttime%= this.animationImageIndex.length;
						this.spriteIndex= this.animationImageIndex[Math.floor(ttime)];
					}
				}

				CAAT.SpriteActor.superclass.animate.call(this, director, time);
			}
		},
        /**
         * Draws the sprite image calculated and stored in spriteIndex.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
		paint : function(director, time) {

			var canvas= director.crc;

            // drawn at 0,0 because they're already affine-transformed.
			switch(this.transformation)	{
				case this.TR_FLIP_HORIZONTAL:
					this.compoundbitmap.paintInvertedH( canvas, this.spriteIndex, 0, 0);
					break;
				case this.TR_FLIP_VERTICAL:
					this.compoundbitmap.paintInvertedV( canvas, this.spriteIndex, 0, 0);
					break;
				case this.TR_FLIP_ALL:
					this.compoundbitmap.paintInvertedHV( canvas, this.spriteIndex, 0, 0);
					break;
				default:
					this.compoundbitmap.paint( canvas, this.spriteIndex, 0, 0);
			}

		}
	};

    extend( CAAT.SpriteActor, CAAT.ActorContainer, null);
})();

(function() {

    /**
     *
     * This class shows a simple image on screen. It can be flipped by calling the method <code>
     * setImageTransformation</code>, and offseted, that is, translated from actors 0,0 position by
     * calling the methods <code>setOffsetX( {float} ) and setOffsetY( {float} )</code>.
     *
     * @constructor
     * @extends CAAT.ActorContainer
     *
     */
	CAAT.ImageActor = function() {
		CAAT.ImageActor.superclass.constructor.call(this);
		return this;
	};

	CAAT.ImageActor.prototype= {
        image:                  null,
		transformation:			0,      // any of the TR_* constants.

		TR_NONE:				0,      // constants used to determine how to draw the sprite image,
		TR_FLIP_HORIZONTAL:		1,
		TR_FLIP_VERTICAL:		2,
		TR_FLIP_ALL:			3,

        offsetX:                0,
        offsetY:                0,

        /**
         * Set horizontal displacement to draw image. Positive values means drawing the image more to the
         * right.
         * @param x {number}
         * @return this
         */
        setOffsetX : function(x) {
            this.offsetX= x;
            return this;
        },
        /**
         * Set vertical displacement to draw image. Positive values means drawing the image more to the
         * bottom.
         * @param y {number}
         * @return this
         */
        setOffsetY : function(y) {
            this.offsetY= y;
            return this;
        },
        /**
         * Set the image to draw. If this CAAT.ImageActor has not set dimension, the actor will be equal
         * size to the image.
         * @param image {HTMLImageElement}
         * @return this
         */
        setImage : function(image) {
            this.image= image;
            if ( this.width==0 || this.height==0 ) {
                this.width=  image.width;
                this.height= image.height;
            }
            return this;
        },
        /**
         * Set the transformation to apply to the image.
         * Any value of
         * <ul>
         *  <li>TR_NONE
         *  <li>TR_FLIP_HORIZONTAL
         *  <li>TR_FLIP_VERTICAL
         *  <li>TR_FLIP_ALL
         * </ul>
         *
         * @param transformation {number} an integer indicating one of the previous values.
         * @return this
         */
        setImageTransformation : function( transformation ) {
            this.transformation= transformation;
            return this;
        },
        /**
         * Draws the image.
         *
         * @param director the CAAT.Director object instance that contains the Scene the Actor is in.
         * @param time an integer indicating the Scene time when the bounding box is to be drawn.
         */
		paint : function(director, time) {

			var ctx= director.crc;
            // drawn at 0,0 because they're already affine-transformed.
			switch(this.transformation)	{
				case this.TR_FLIP_HORIZONTAL:
					this.paintInvertedH( ctx);
					break;
				case this.TR_FLIP_VERTICAL:
					this.paintInvertedV( ctx);
					break;
				case this.TR_FLIP_ALL:
					this.paintInvertedHV( ctx);
					break;
				default:
					this._paint( ctx);
			}
		},
	    paintInvertedH : function( ctx ) {
	        ctx.save();
		        ctx.translate( this.width, 0 );
		        ctx.scale(-1, 1);
		        ctx.drawImage( this.image,this.offsetX,this.offsetY );
	        ctx.restore();
	    },
	    paintInvertedV : function( ctx ) {
	        ctx.save();
	        	ctx.translate( 0, this.height );
	        	ctx.scale(1, -1);
		        ctx.drawImage( this.image,this.offsetX,this.offsetY );
	        ctx.restore();
	    },
	    paintInvertedHV : function( ctx ) {
	        ctx.save();
		    	ctx.translate( 0, this.height );
		    	ctx.scale(1, -1);
	        	ctx.translate( this.width, 0 );
	        	ctx.scale(-1, 1);
		        ctx.drawImage(this.image,this.offsetX,this.offsetY);
	        ctx.restore();
	    },
        /**
         *
         * @param ctx
         * @private
         */
	    _paint : function( ctx ) {
	        ctx.drawImage(this.image,this.offsetX,this.offsetY);
	    }
	};

    extend( CAAT.ImageActor, CAAT.ActorContainer, null);
})();

(function() {

    /**
     * TextActor draws text on screen. The text can be drawn directly on screen or make if follow a
     * path defined by an instance of <code>CAAT.Path</code>.
     *
     * @constructor
     * @extends CAAT.ActorContainer
     *
     */
	CAAT.TextActor = function() {
		CAAT.TextActor.superclass.constructor.call(this);
		this.font= "10px sans-serif";
		this.textAlign= "left";
		this.textBaseline= "top";
		this.outlineColor= "black";
        this.clip= false;

		return this;
	};

	CAAT.TextActor.prototype= {
		font:			    null,   // a valid canvas rendering context font description. Default font
                                    // will be "10px sans-serif".
		textAlign:		    null,	// a valid canvas rendering context textAlign string. Any of:
                                    // start, end, left, right, center.
                                    // defaults to "left".
		textBaseline:	    null,	// a valid canvas rendering context textBaseLine string. Any of:
                                    // top, hanging, middle, alphabetic, ideographic, bottom.
                                    // defaults to "top".
		fill:			    true,   // a boolean indicating whether the text should be filled.
		text:			    null,   // a string with the text to draw.
		textWidth:		    0,      // an integer indicating text width in pixels.
        textHeight:         0,      // an integer indicating text height in pixels.
		outline:		    false,  // a boolean indicating whether the text should be outlined.
                                    // not all browsers support it.
		outlineColor:	    null,   // a valid color description string.

		path:			    null,   // a CAAT.Path which will be traversed by the text. [Optional]
        pathInterpolator:	null,   // a CAAT.Interpolator to apply to the path traversing.
        pathDuration:       10000,  // an integer indicating the time to be taken to traverse the path. ms.
		sign:			    1,      // traverse the path forward or backwards.

        /**
         * Set the text to be filled. The default Filling style will be set by calling setFillStyle method.
         * Default value is true.
         * @param fill {boolean} a boolean indicating whether the text will be filled.
         * @return this;
         */
        setFill : function( fill ) {
            this.fill= fill;
            return this;
        },
        /**
         * Sets whether the text will be outlined.
         * @param outline {boolean} a boolean indicating whether the text will be outlined.
         * @return this;
         */
        setOutline : function( outline ) {
            this.outline= outline;
            return this;
        },
        /**
         * Defines text's outline color.
         *
         * @param color {string} sets a valid canvas context color.
         * @return this.
         */
        setOutlineColor : function( color ) {
            this.outlineColor= color;
            return this;
        },
        /**
         * Set the text to be shown by the actor.
         * @param sText a string with the text to be shwon.
         * @return this
         */
		setText : function( sText ) {
			this.text= sText;
            this.setFont( this.font );

            return this;
        },
        /**
         * Sets text alignment
         * @param align
         */
        setAlign : function( align ) {
            this.textAlign= align;
            return this;
        },
        /**
         * Set text baseline.
         * @param baseline
         */
        setBaseline : function( baseline ) {
            this.textBaseline= baseline;
            return this;
        },
        /**
         * Sets the font to be applied for the text.
         * @param font a string with a valid canvas rendering context font description.
         * @return this
         */
        setFont : function(font) {

            if ( !font ) {
                return this;
            }

            this.font= font;

            if ( this.text=="" || null==this.text ) {
                this.width= this.height= 0;
            }

            return this;
		},
        /**
         * Calculates the text dimension in pixels and stores the values in textWidth and textHeight
         * attributes.
         * If Actor's width and height were not set, the Actor's dimension will be set to these values.
         * @param director a CAAT.Director instance.
         * @return this
         */
        calcTextSize : function(director) {
            director.crc.save();
            director.crc.font= this.font;

            this.textWidth= director.crc.measureText( this.text ).width;
            if (this.width==0) {
                this.width= this.textWidth;
            }

            try {
                var pos= this.font.indexOf("px");
                var s =  this.font.substring(0, pos );
                this.textHeight= parseInt(s,10);
            } catch(e) {
                this.textHeight=20; // default height;
            }

            if ( this.height==0 ) {
                this.height= this.textHeight;
            }

            director.crc.restore();

            return this;
        },
        /**
         * Custom paint method for TextActor instances.
         * If the path attribute is set, the text will be drawn traversing the path.
         *
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
		paint : function(director, time) {

			if ( null==this.text) {
				return;
			}

            if ( this.textWidth==0 || this.textHeight==0 ) {
                this.calcTextSize(director);
            }

			var canvas= director.crc;

			if( null!=this.font ) {
				canvas.font= this.font;
			}
			if ( null!=this.textAlign ) {
				canvas.textAlign= this.textAlign;
			}
			if ( null!=this.textBaseline ) {
				canvas.textBaseline= this.textBaseline;
			}
			if ( null!=this.fillStyle ) {
				canvas.fillStyle= this.fillStyle;
			}

			if (null==this.path) {

                var tx=0;
                if ( this.textAlign=='center') {
                    tx= this.width/2;
                } else if ( this.textAlign=='right' ) {
                    tx= this.width;
                }

				if ( this.fill ) {
					canvas.fillText( this.text, tx, 0 );
					if ( this.outline ) {

						// firefox necesita beginPath, si no, dibujara ademas el cuadrado del
						// contenedor de los textos.
						if ( null!=this.outlineColor ) {
							canvas.strokeStyle= this.outlineColor;
						}
						canvas.beginPath();
						canvas.strokeText( this.text, tx, 0 );
					}
				} else {
					if ( null!=this.outlineColor ) {
						canvas.strokeStyle= this.outlineColor;
					}
					canvas.strokeText( this.text, tx, 0 );
				}
			}
			else {
				this.drawOnPath(director,time);
			}
		},
        /**
         * Private.
         * Draw the text traversing a path.
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
		drawOnPath : function(director, time) {

			var canvas= director.crc;

			var textWidth=this.sign * this.pathInterpolator.getPosition( (time%this.pathDuration)/this.pathDuration ).y * this.path.getLength() ;
			var p0= new CAAT.Point();
			var p1= new CAAT.Point();

			for( var i=0; i<this.text.length; i++ ) {
				var caracter= this.text[i].toString();
				var charWidth= canvas.measureText( caracter ).width;

				var pathLength= this.path.getLength();

				var currentCurveLength= charWidth/2 + textWidth;

				p0= this.path.getPositionFromLength(currentCurveLength).clone();
				p1= this.path.getPositionFromLength(currentCurveLength-.1).clone();

				var angle= Math.atan2( p0.y-p1.y, p0.x-p1.x );

				canvas.save();

					canvas.translate( p0.x, p0.y );
					canvas.rotate( angle );
                    if ( this.fill ) {
					    canvas.fillText(caracter,0,0);
                    }
                    if ( this.outline ) {
                        canvas.strokeStyle= this.outlineColor;
                        canvas.strokeText(caracter,0,0);
                    }

				canvas.restore();

				textWidth+= charWidth;
			}
		},
        /**
         * Set the path, interpolator and duration to draw the text on.
         * @param path a valid CAAT.Path instance.
         * @param interpolator a CAAT.Interpolator object. If not set, a Linear Interpolator will be used.
         * @param duration an integer indicating the time to take to traverse the path. Optional. 10000 ms
         * by default.
         */
		setPath : function( path, interpolator, duration ) {
			this.path= path;
            this.pathInterpolator= interpolator || new CAAT.Interpolator().createLinearInterpolator();
            this.pathDuration= duration || 10000;

            /*
            parent could not be set by the time this method is called.
            so the actors bounds set is removed.
            the developer must ensure to call setbounds properly on actor.
             */
//			this.setBounds(0,0,this.parent.width,this.parent.height);
			this.mouseEnabled= false;

            return this;
		}
	};

    extend( CAAT.TextActor, CAAT.ActorContainer, null);
})();

(function() {

    /**
     * This class works as a UI Button.
     * <p>
     * To fully define the button, four images should be supplied as well as a callback function.
     * The images define different button states:
     * <ul>
     *  <li>Normal state
     *  <li>Pointed
     *  <li>Pressed
     *  <li>Disabled
     * </ul>
     *
     * <p>
     * It is only compulsory to supply an image for the normal state. All images must be supplied in
     * a single image strip which containes all button states, concretely in a CAAT.CompoundImage
     * instance.
     *
     * @constructor
     * @extends CAAT.ActorContainer
     */
    CAAT.Button= function() {
        CAAT.Button.superclass.constructor.call(this);
        return this;
    };

    CAAT.Button.prototype= {
        buttonImage:    null,   // a CompoundImage object instance
        iNormal:        0,
        iOver:          0,
        iPress:         0,
        iDisabled:      0,
        iCurrent:       0,
        fnOnClick:      null,
        enabled:        true,

        /**
         * Set enabled state for the button.
         * If the button is disabled, it will only show the disabled state and will discard mouse input.
         * @param enabled {boolean}
         */
        setEnabled : function( enabled ) {
            this.enabled= enabled;
        },
        /**
         * Initialize the button with the given values. The button size will be set to the size of the
         * subimages contained in the buttonImage.
         *
         * @param buttonImage {CAAT.CompoundImage} an image used as a strip of button state images.
         * @param iNormal {number} an integer indicating which image index of the buttonImage corresponds
         * with the normal state.
         * @param iOver {number} an integer indicating which image index of the buttonImage corresponds
         * with the pointed state.
         * @param iPress {number} an integer indicating which image index of the buttonImage corresponds
         * with the pressed state.
         * @param iDisabled {number} an integer indicating which image index of the buttonImage corresponds
         * with the disabled state.
         * @param fn {function} callback function to call on mouse release inside the button actor.
         */
        initialize : function( buttonImage, iNormal, iOver, iPress, iDisabled, fn) {
            this.buttonImage=   buttonImage;
            this.iNormal=       iNormal || 0;
            this.iOver=         iOver || this.iNormal;
            this.iPress=        iPress || this.iNormal;
            this.iDisabled=     iDisabled || this.iNormal;
            this.iCurrent=      this.iNormal;
            this.width=         buttonImage.singleWidth;
            this.height=        buttonImage.singleHeight;
            this.fnOnClick=     fn;
            return this;
        },
        /**
         * Paint the button.
         * @param director {CAAT.Director}
         * @param time {number}
         */
        paint : function(director,time) {
            this.buttonImage.paint(
                    director.ctx,
                    (this.enabled) ? this.iCurrent : this.iDisabled,
                    0,
                    0 );
        },
        mouseEnter : function(mouseEvent) {
            this.iCurrent= this.iOver;
            document.body.style.cursor = 'pointer';
        },
        mouseExit : function(mouseEvent) {
            this.iCurrent= this.iNormal;
            document.body.style.cursor = 'default';
        },
        mouseDown : function(mouseEvent) {
            this.iCurrent= this.iPress;
        },
        mouseUp : function(mouseEvent) {
            this.iCurrent= this.iNormal;
        },
        mouseClick : function(mouseEvent) {
            if ( this.enabled && null!=this.fnOnClick ) {
                this.fnOnClick();
            }
        },
        toString : function() {
            return 'CAAT.Button '+this.iNormal;
        }
    };

    extend( CAAT.Button, CAAT.ActorContainer, null);
})();

(function() {

    /**
     * This Actor draws common shapes, concretely Circles and rectangles.
     *
     * @constructor
     * @extends CAAT.ActorContainer
     */
    CAAT.ShapeActor = function() {
        CAAT.ShapeActor.superclass.constructor.call(this);
        this.compositeOp= 'source-over';
        return this;
    };

    CAAT.ShapeActor.prototype= {

        shape:          0,      // shape type. One of the constant SHAPE_* values
        compositeOp:    null,   // a valid canvas rendering context string describing compositeOps.

        SHAPE_CIRCLE:   0,      // Constants to describe different shapes.
        SHAPE_RECTANGLE:1,

        /**
         * Sets shape type.
         * No check for parameter validity is performed.
         * @param iShape an integer with any of the SHAPE_* constants.
         * @return this
         */
        setShape : function(iShape) {
            this.shape= iShape;
            return this;
        },
        /**
         * Sets the composite operation to apply on shape drawing.
         * @param compositeOp an string with a valid canvas rendering context string describing compositeOps.
         * @return this
         */
        setCompositeOp : function(compositeOp){
            this.compositeOp= compositeOp;
            return this;
        },
        /**
         * Draws the shape.
         * Applies the values of fillStype, strokeStyle, compositeOp, etc.
         *
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
        paint : function(director,time) {
            switch(this.shape) {
                case 0:
                    this.paintCircle(director,time);
                    break;
                case 1:
                    this.paintRectangle(director,time);
                    break;
            }
        },
        /**
         * Private
         * Draws a circle.
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
        paintCircle : function(director,time) {
            var ctx= director.crc;

            ctx.globalCompositeOperation= this.compositeOp;
            if ( null!=this.fillStyle ) {
                ctx.fillStyle= this.fillStyle;
                ctx.beginPath();
                ctx.arc( this.width/2, this.height/2, Math.min(this.width,this.height)/2, 0, 2*Math.PI, false );
                ctx.fill();
            }
            
            if ( null!=this.strokeStyle ) {
                ctx.strokeStyle= this.strokeStyle;
                ctx.beginPath();
                ctx.arc( this.width/2, this.height/2, Math.min(this.width,this.height)/2, 0, 2*Math.PI, false );
                ctx.stroke();
            }
        },
        /**
         *
         * Private
         * Draws a Rectangle.
         *
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
        paintRectangle : function(director,time) {
            var ctx= director.crc;

            ctx.globalCompositeOperation= this.compositeOp;
            if ( null!=this.fillStyle ) {
                ctx.fillStyle= this.fillStyle;
                ctx.beginPath();
                ctx.fillRect(0,0,this.width,this.height);
                ctx.fill();
            }

            if ( null!=this.strokeStyle ) {
                ctx.strokeStyle= this.strokeStyle;
                ctx.beginPath();
                ctx.strokeRect(0,0,this.width,this.height);
                ctx.stroke();
            }
        }
    };

    extend( CAAT.ShapeActor, CAAT.ActorContainer, null);
})();

(function() {

    /**
     * This actor draws stars.
     *
     * @constructor
     * @extends CAAT.ActorContainer
     */
    CAAT.StarActor= function() {
        CAAT.StarActor.superclass.constructor.call(this);
        return this;
    };

    CAAT.StarActor.prototype= {
        nPeaks:         0,
        maxRadius:      0,
        minRadius:      0,
        initialAngle:   0,
        outlined:       false,
        filled:         true,

        /**
         * Sets whether the star will be color filled.
         * @param filled {boolean}
         */
        setFilled : function( filled ) {
            this.filled= filled;
            return this;
        },
        /**
         * Sets whether the star will be outlined.
         * @param outlined {boolean}
         */
        setOutlined : function( outlined ) {
            this.outlined= outlined;
            return this;
        },
        /**
         * Initialize the star values.
         * <p>
         * The star actor will be of size 2*maxRadius.
         *
         * @param nPeaks {number} number of star points.
         * @param maxRadius {number} maximum star radius
         * @param minRadius {number} minimum star radius
         *
         * @return this
         */
        initialize : function(nPeaks, maxRadius, minRadius) {
            this.setSize( 2*maxRadius, 2*maxRadius );

            this.nPeaks= nPeaks;
            this.maxRadius= maxRadius;
            this.minRadius= minRadius;

            return this;
        },
        /**
         * Paint the star.
         *
         * @param director {CAAT.Director}
         * @param timer {number}
         */
        paint : function(director, timer) {

            var ctx=        director.ctx;
            var centerX=    this.width/2;
            var centerY=    this.height/2;
            var r1=         this.maxRadius;
            var r2=         this.minRadius;
            var ix=         centerX + r1*Math.cos(this.initialAngle);
            var iy=         centerY + r1*Math.sin(this.initialAngle);

            ctx.moveTo(ix,iy);

            for( var i=1; i<this.nPeaks*2; i++ )   {
                var angleStar= Math.PI/this.nPeaks * i + this.initialAngle;
                var rr= (i%2==0) ? r1 : r2;
                var x= centerX + rr*Math.cos(angleStar);
                var y= centerY + rr*Math.sin(angleStar);
                ctx.lineTo(x,y);
            }
            ctx.closePath();

            ctx.lineTo(
                this.centerX + r1*Math.cos(this.initialAngle),
                this.centerY + r1*Math.sin(this.initialAngle) );

            if ( this.filled ) {
                ctx.fillStyle= this.fillStyle;
                ctx.fill();
            }

            if ( this.outlined && this.strokeStyle ) {
                ctx.strokeStyle= this.strokeStyle;
                ctx.stroke();
            }
        }
    };

    extend(CAAT.StarActor, CAAT.ActorContainer, null);

})();

/**
 * An actor suitable to draw an ImageProcessor instance.
 */
(function() {

    /**
     * This Actor will show the result of an image processing operation.
     *
     * @constructor
     * @extends CAAT.ActorContainer
     */
    CAAT.IMActor= function() {
        CAAT.IMActor.superclass.constructor.call(this);
        return this;
    };

    CAAT.IMActor.prototype= {

        imageProcessor:         null,
        changeTime:             100,
        lastApplicationTime:    -1,

        /**
         * Set the image processor.
         *
         * @param im {CAAT.ImageProcessor} a CAAT.ImageProcessor instance.
         */
        setImageProcessor : function(im) {
            this.imageProcessor= im;
            return this;
        },
        /**
         * Call image processor to update image every time milliseconds.
         * @param time an integer indicating milliseconds to elapse before updating the frame.
         */
        setImageProcessingTime : function( time ) {
            this.changeTime= time;
            return this;
        },
        paint : function( director, time ) {
            if ( time-this.lastApplicationTime>this.changeTime ) {
                this.imageProcessor.apply( director, time );
                this.lastApplicationTime= time;
            }

            var ctx= director.ctx;
            this.imageProcessor.paint( director, time );
        }
    };

    extend( CAAT.IMActor, CAAT.ActorContainer, null);
})();

(function() {

    /**
     * This class aims to instrument Dom elements as if were Canvas elements.
     * <p>
     * It will create and add a div elemento to the dom which will be transformed and presented by CSS.
     * The parent/child relationship inherent to every CAAT animable element will be held by containing
     * div elements inside of other div elements.
     *
     * <p>
     * Experimental form.
     *
     * @constructor
     * @extends CAAT.ActorContainer
     */
    CAAT.CSSActor = function() {
        CAAT.CSSActor.superclass.constructor.call(this);
        this.setFillStyle(null);
        this.setStrokeStyle(null);
        return this;
    };

    CAAT.CSSActor.prototype= {
        domElement: null,
        dirty: true,
        oldX:   -1,
        oldY:   -1,

        /**
         * Set CSS div's inner HTML.
         * @param innerHTML {string} a valid html block.
         * @return this;
         */
        setInnerHTML : function(innerHTML) {
            this.domElement.innerHTML= innerHTML;
            return this;
        },
        create : function() {
            CAAT.CSSActor.superclass.create.call(this);
            this.domElement= document.createElement('div');
            document.body.appendChild(this.domElement);
            this.domElement.style['position']='absolute';
            this.domElement.style['-webkit-transition']='all 0s linear';
            this.domElement.style['border']='top:1px';
            return this;
        },
        setLocation : function( x, y ) {
            CAAT.CSSActor.superclass.setLocation.call(this,x,y);
            this.domElement.style['left']= x+'px';
            this.domElement.style['top']=  y+'px';
            return this;
        },
        setSize : function( w, h ) {
            CAAT.CSSActor.superclass.setSize.call(this,w,h);
            this.domElement.style['width']= ''+w+'px';
            this.domElement.style['height']= ''+h+'px';
            return this;
        },
        setBounds : function( x,y,w,h ) {
            this.setLocation(x,y);
            this.setSize(w,h);
            return this;
        },
        setBackground : function( backgroundImage_Local_URL ) {
            this.domElement.style.background= 'url('+backgroundImage_Local_URL+')';
            return this;
        },
        setOpacity : function() {
            this.domElement.style['filter']= 'alpha(opacity='+((this.alpha*100)>>0)+')';
            this.domElement.style['-moz-opacity']= this.alpha;
            this.domElement.style['-khtml-opacity']= this.alpha;
            this.domElement.style['-opacity']= this.alpha;
        },
        addChild : function( actor ) {
            if ( actor instanceof CAAT.CSSActor ) {
                this.domElement.appendChild(actor.domElement);
                CAAT.CSSActor.superclass.addChild.call(this,actor);
            }
        },
        paintActor : function(director, time) {

            if ( !this.isInAnimationFrame(time) ) {
                this.inFrame= false;
                return false;
            }

            if ( (this.oldX!=this.x) || (this.oldY!=this.y) ) {
                this.domElement.style['top']= this.y+'px';
                this.domElement.style['left']= this.x+'px';
                this.oldX= this.x;
                this.oldY= this.y;
            }

            if ( this.dirty ) {

                var strMatrix='translateZ(0px)';
                if ( this.rotationAngle!=0 ) {
                    strMatrix= strMatrix+ ' rotate('+this.rotationAngle+'rad)';
                }
                if ( this.scaleX!=1 ) {
                    strMatrix= strMatrix+ ' scale('+this.scaleX+')';
                }

                this.domElement.style['-webkit-transform']= strMatrix;
                this.domElement.style['-o-transform']= strMatrix;
                this.domElement.style['-moz-transform']= strMatrix;

                this.dirty= false;
            }

            for( var i=0; i<this.childrenList.length; i++ ) {
                this.childrenList[i].paintActor(director,time);
            }
            
            this.inFrame= true;

            return true;
        },
        paint : function(director,time) {
            
        }
    };

    extend( CAAT.CSSActor, CAAT.ActorContainer, null);
})();