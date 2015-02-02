var DoublyLinkedList = function(){
	this.first = this.last = null;
	this.length = 0;
};
DoublyLinkedList.prototype = {
	constructor: DoublyLinkedList,
	insertAfter: function(prev, info){
		++this.length;
		var node = {info: info, time: new Date().getTime()};
		if(prev == null){
			node.prev = null;
			node.next = this.first;
			if(this.first != null){
				this.first.prev = node;
			}else{
				this.last = node;
			}
			this.first = node;
		}else{
			node.prev = prev;
			node.next = prev.next;
			var x = prev.next;
			if(x == null){
				this.last = node;
			}else{
				x.prev = node;
			}
			prev.next = node;
		}
	},
	remove: function(node){
		--this.length;
		if(node.prev == null){
			this.first = node.next;
		}else{
			node.prev.next = node.next;
		}
		if(node.next == null){
			this.last = node.prev;
		}else{
			node.next.prev = node.prev;
		}
	}
};
var PriorityQueue = function (priorityCompare){
	this._rootList = new DoublyLinkedList();
	this._compare = priorityCompare;
	this._min = null;
	this.length = 0;
};
PriorityQueue.prototype = {
	constructor: PriorityQueue,
	insertUpdate: function(value, priority){
		//if exists => change key
		var node = {val: value, key: priority, rank: 0, children: [], mark: false, parent: null};
		this._rootList.insertAfter(null, node);
		var ln = this._rootList.first;
		if(this._min == null || this._compare(node.key, this._min.info.key)){
			this._min = ln;
		}
		++this.length;
	},
	peek: function(){
		return {value: this._min.info.val, priority: this._min.info.key};
	},
	pop: function(){
		var ret = this.peek();
		//delete min
		this._rootList.remove(this._min);
		//meld its children into root list
		for(var i=0; i<this._min.info.children.length; ++i){
			this._rootList.insertAfter(null, this._min.info.children[i]);
		}
		this._min.info.children = null;
		//update min
		var min = null;
		for(var q=this._rootList.first; q!=null; q=q.next){
			if(min == null || this._compare(q.info.key, min.info.key)){
				min = q;
			}
		}
		this._min = min;
		//consolidate trees, no two roots have same rank
		var rankArray = [];
		for(var q=this._rootList.first; q!=null;){
			if(typeof rankArray[q.info.rank] === "undefined" || rankArray[q.info.rank] == null){
				rankArray[q.info.rank] = q;
				q=q.next
				continue;
			}
			var qr = q.info.rank;
			var lq = rankArray[q.info.rank];
			var qi;
			if(this._compare(q.info.key, lq.info.key)){
				qi = q.info;
				qi.children.push(lq.info);
				lq.info.parent = qi;
				qi.rank = ?? //TODO: ....
			}else{
				qi = lq.info;
				qi.children.push(q.info);
				q.info.parent = qi;
			}
			this._rootList.remove(lq);
			q.info = qi;
			rankArray[qr] = null;
		}
		--this.length;
		return ret;
	}
};
var testpq = new PriorityQueue(function(a, b){return a<b;});
testpq.insertUpdate("a", 5);
testpq.insertUpdate("b", 6);
testpq.insertUpdate("c", 2);
testpq.insertUpdate("d", 3);
testpq.insertUpdate("e", 7);
testpq.insertUpdate("f", 1);
testpq.insertUpdate("g", 4);
