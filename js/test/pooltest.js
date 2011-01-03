
/**
 * Object Pool V1.1
 * Copyright (c) 2008 Michael Baczynski, http://www.polygonal.de
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Javascript port of PolygonalLabs object pool
 * Mario Gonzalez, onedayitwillmake.com
 */
 var ObjNode = function() {
  this.next = null;
  this.data = null;
 };

 var ObjectPool = function() {
  return this;
 };

 ObjectPool.prototype = {
  name: '',
  shouldGrow: false,

  initialSize: 0,
  currentSize: 0,
  usageCount: 0,

  head: null,
  tail: null,

  emptyNode: null,
  allocNode: null,

  /**
   * Objects are creates by calling, new this.poolConstructor()
   * @constructor
   */
  poolConstructor: null,

  create: function(aName, shouldGrow) {
   this.name = aName;
   this.shouldGrow = shouldGrow;

   return this;
  },

  /**
   * Get the next available object from the pool or put it back for the
   * next use. If the pool is empty and resizable, an error is thrown.
   */
  getObject: function() {
   if (this.usageCount == this.currentSize) {
    if (this.shouldGrow) {
     this.currentSize += this.initialSize;

     var n = this.tail;
     var t = this.tail;

     var node = null;
     for (var i = 0; i < this.initialSize; i++) {
      node = new ObjNode();
      node.data = new this.poolConstructor();

      t.next = node;
      t = node;
     }

     this.tail = t;

     this.tail.next = this.emptyNode = this.head;
     this.allocNode = n.next;
     return this.getObject();
    }
    else throw "object pool exhausted.";
   }
   else {
    var o = this.allocNode.data;
    this.allocNode.data = null;
    this.allocNode = this.allocNode.next;
    this.usageCount++;
    return o;
   }
  },

  /**
   * Returns an object back to the pool
   * @private
   * @param {*} anObject
   */
  setObject: function(anObject) {
   if (this.usageCount > 0) {
    this.usageCount--;
    this.emptyNode.data = anObject;
    this.emptyNode = this.emptyNode.next;
   }
  },

  /**
   * Allocate the pool by creating all objects from the factory.
   * @param {Number} size The number of objects to create.
   * @return {CAAT.ObjectPool}	Returns this instance
   */
  allocate: function(size) {
   if (!this.poolConstructor) throw "Cannot allocate before setting constrctor. Call setPoolConstructor first!";

   this.dealloc();
   this.initialSize = this.currentSize = size;

   this.head = this.tail = new ObjNode();
   this.head.data = new this.poolConstructor();

   var n = null;
   for (var i = 1; i < this.initialSize; i++) {
    n = new ObjNode();
    n.data = new this.poolConstructor();
    n.next = this.head;
    this.head = n;
   }

   this.emptyNode = this.allocNode = this.head;
   this.tail.next = this.head;

   return this;
  },

  /**
   * Helper method for applying a function to all objects in the pool.
   *
   * @param {String} func The function's name.
   * @param {Array} args The function's arguments.
   */
  applyToAll: function(func, args) {
   var n = this.head;
   while (n) {
    n.data[func].apply(n.data, args);
    if (n == this.tail) break;
    n = n.next;
   }
  },

  /**
   * Remove all unused objects from the pool. If the number of remaining
   * used objects is smaller than the initial capacity defined by the
   * allocate() method, new objects are created to refill the pool.
   */
  purge: function() {
   var i, node = null;

   if (this.usageCount == 0) {
    if (this.currentSize == this.initialSize) return;

    if (this.currentSize > this.initialSize) {
     i = 0;
     node = this.head;
     while (++i < this.initialSize)
     node = node.next;

     this.tail = node;
     this.allocNode = this.emptyNode = this.head;

     this.currentSize = this.initialSize;
    }
   }
   else {
    var a = [];
    node = this.head;
    while (node) {
     if (!node.data) a[i++] = node;
     if (node == this.tail) break;
     node = node.next;
    }

    this.currentSize = a.length;
    this.usageCount = this.currentSize;

    this.head = this.tail = a[0];
    for (i = 1; i < this.currentSize; i++) {
     node = a[i];
     node.next = this.head;
     this.head = node;
    }

    this.emptyNode = this.allocNode = this.head;
    this.tail.next = this.head;

    if (this.usageCount < this.initialSize) {
     this.currentSize = this.initialSize;

     var n = this.tail,
         t = this.tail,
         k = this.initialSize - this.usageCount;
     for (i = 0; i < k; i++) {
      node = new ObjNode();
      node.data = new this.poolConstructor();

      t.next = node;
      t = node;
     }

     this.tail = t;

     this.tail.next = this.emptyNode = this.head;
     this.allocNode = n.next;

    }
   }
  },

  dealloc: function() {
   var node = this.head;
   var t;
   while (node) {
    t = node.next;
    node.next = null;
    node.data = null;
    node = t;
   }

   this.head = this.tail = this.emptyNode = this.allocNode = null;
  },

  /**
   * Accessors
   */

  setPoolConstructor: function(aConstructorFunction) {
   this.poolConstructor = aConstructorFunction;
   return this;
  },

  /**
   * @return {Number}
   */
  getSize: function() {
   return this.size
  },
  /**
   * @return {Number}
   */
  getUsageCount: function() {
   return this.usageCount
  },

  /**
   * @return {Number}
   */
  getWasteCount: function() {
   return this.currentSize - this.usageCount;
  },
  /**
   * Sets the name of this pool, normally you want to call it the type of object it is.
   * For example, 'CAAT.Point' to store CAAT.Point objects, you can later ask the CAAT.ObjectPool if such a pool instance exist
   * @param {String} aName A name
   */
  setName: function(aName) {
   this.name = aName;
   return this;
  },
  /**
   * The name of this pool instance
   */
  getName: function() {
   return this.name;
  }
};
var SimpleObjectType= function(calledBySelf) {
	return this;
};

SimpleObjectType.prototype= {
	x:	0,
	y: 	0,
	set : function(x,y) {
		this.x= x;
		this.y= y;
		return this;
	},
	clone : function() {
		var p= new CAAT.Point();
		p.set( this.x, this.y );
		return p;
	},
	translate : function(x,y) {
		this.x+= x;
		this.y+= y;

		return this;
	}
};

var ComplexDataType = function(calledBySelf) {

	if(!calledBySelf)
		this.init();

	return this;
};

ComplexDataType.prototype= {
	x:	0,
	y: 	0,
	complex: null,

   	init: function() {
		this.some = new ComplexDataType(true);
		this.thing = new ComplexDataType(true);
		this.complex = new ComplexDataType(true);
		this.goes = new ComplexDataType(true);
		this.here = new ComplexDataType(true);
	},
	set : function(x,y) {
		this.x= x;
		this.y= y;
		return this;
	},
	clone : function() {
		var p= new CAAT.Point();
		p.set( this.x, this.y );
		return p;
	},
	translate : function(x,y) {
		this.x+= x;
		this.y+= y;

		return this;
	}
};

var __simpleDataTypePool = new ObjectPool()
.create('', false)
.setPoolConstructor(SimpleObjectType)
.allocate(256);

var __complexDataTypePool = new ObjectPool()
.create('', false)
.setPoolConstructor(ComplexDataType)
.allocate(256);


var pointArray = [];
for (var i = 0; i < testIterations; i++) {
	for (var j = 0; j < innerLoop; j++) {
 	var aPoint = new SimpleObjectType().set(Math.random(), Math.random());
 	pointArray.push(aPoint);
	}

	while (pointArray.length) {
	  __simpleDataTypePool.setObject(pointArray.shift());
	 }
}
var pointArray = [];
for (var i = 0; i < testIterations; i++) {
	for (var j = 0; j < innerLoop; j++) {
	 var aPoint = __simpleDataTypePool.getObject().set(Math.random(), Math.random());
	 pointArray.push(aPoint);
	 // Place the temp point back in the pool
	 __simpleDataTypePool.setObject(aPoint)
}

var pointArray = [];
for (var i = 0; i < testIterations; i++) {


	for (var j = 0; j < innerLoop; j++) {
		 var aPoint = __simpleDataTypePool.getObject().set(Math.random(), Math.random());
		 pointArray.push(aPoint);
		 // Place the temp point back in the pool
		 __simpleDataTypePool.setObject(aPoint)
	}

	while (pointArray.length) {
	  pointArray[0] = null;
	 }
}

var pointArray = [];

for (var i = 0; i < testIterations; i++) {

 for (var j = 0; j < innerLoop; j++) {
  var aPoint = __complexDataTypePool.getObject().set(Math.random(), Math.random());
  pointArray.push(aPoint);
  __complexDataTypePool.setObject(aPoint);
 }

 while (pointArray.length) {
  __complexDataTypePool.setObject(pointArray.shift());
 }
}