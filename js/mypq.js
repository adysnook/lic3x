var DoublyLinkedList = function(){
	this.first = this.last = null;
	this.length = 0;
};
DoublyLinkedList.prototype = {
	constructor: DoublyLinkedList,
	insertAfter: function(prev, info){
		++this.length;
		var node = {info: info, time: performance.now()};
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
	},
	log: function(){
		var text = "";
		for(var q=this.first; q!=null; q=q.next){
			text += q.info.key+" ";
		}
		console.log(text);
	}
};
var PriorityQueue = function (priorityCompare){
	this._rootList = new DoublyLinkedList();
	this._compare = priorityCompare;
	this._min = null;
	this._valMap = new Map();
	this.length = 0;
};
PriorityQueue.prototype = {
	constructor: PriorityQueue,
	insertUpdate: function(value, priority){
		//if exists change key
		if(typeof this._valMap.get(value) !== "undefined"){
			var node = this._valMap.get(value);
			if(this._compare(priority, node.key)){
				//decrease-key
				if(node.parent != null && this._compare(priority, node.parent.key)){
					//heap order violated
					var p = node.parent;
					//cut tree rooted at node
					p.children.remove(node.parentListNode);
					node.parentListNode = null;
					node.parent = null;
					//update rank?? TODO
					//meld into root list
					this._rootList.insertAfter(null, node);
					var ln = this._rootList.first;
					node.rootNode = ln;
					//unmark
					node.mark = false;
					var q = node;
					while(p.mark){
						q = p;
						p = p.parent;
						//cut p
						p.children.remove(q.parentListNode);
						q.parentListNode = null;
						q.parent = null;
						//meld into root list
						this._rootList.insertAfter(null, q);
						q.rootNode = this._rootList.first;
						//unmark
						q.mark = false;
					}
					if(p.parent != null)
						p.mark = true;
				}
				this._rootList.log();
			}else{
				//increase-key
			}
			node.key = priority;
			if(this._compare(priority, this._min.key)){
				this._min = node;
			}
			return;
		}
		var node = {val: value, key: priority, rank: 0, children: new DoublyLinkedList(), mark: false, parent: null};
		this._valMap.set(value, node);
		this._rootList.insertAfter(null, node);
		var ln = this._rootList.first;
		node.rootNode = ln;
		if(this._min == null || this._compare(node.key, this._min.key)){
			this._min = node;
		}
		++this.length;
	},
	peek: function(){
		if(this.length == 0)
			return;
		return {value: this._min.val, priority: this._min.key};
	},
	pop: function(){
		var ret = this.peek();
		if(typeof ret === "undefined")
			return;
		//delete min
		this._rootList.remove(this._min.rootNode);
		//meld its children into root list
		for(var q=this._min.children.first; q!=null; q=q.next){
			this._rootList.insertAfter(null, q.info);
			var ln = this._rootList.first;
			q.info.parent = null;
			q.info.parentListNode = null;
			q.info.rootNode = ln;
		}
		this._min.children = new DoublyLinkedList();
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
				qi.children.insertAfter(null, lq.info);
				lq.info.parentListNode = qi.children.first;
				lq.info.parent = qi;
			}else{
				qi = lq.info;
				qi.children.insertAfter(null, q.info);
				q.info.parentListNode = qi.children.first;
				q.info.parent = qi;
			}
			this._rootList.remove(lq);
			lq.info.rootNode = null;
			++qi.rank;
			qi.parent = null;
			qi.rootNode = q;
			q.info = qi;
			rankArray[qr] = null;
		}
		//update min
		var min = null;
		for(var q=this._rootList.first; q!=null; q=q.next){
			if(min == null || this._compare(q.info.key, min.info.key)){
				min = q;
			}
		}
		if(min == null){
			this._min = null;
		}else{
			this._min = min.info;
		}
		--this.length;
		return ret;
	}
};
var testpq = new PriorityQueue(function(a, b){return a<b;});
testpq.insertUpdate("a",    1);
testpq.insertUpdate("b",   14);
testpq.insertUpdate("c", 12.5);
testpq.insertUpdate("d", 13.4);
testpq.insertUpdate("e",  9.3);
testpq.insertUpdate("f",   19);
testpq.insertUpdate("g", 11.2);
testpq.insertUpdate("h",    8);
testpq.insertUpdate("i",  7.1);
testpq.insertUpdate("j",   13);
testpq.insertUpdate("k",    7);
testpq.insertUpdate("l",   20);
testpq.insertUpdate("m",    6);
testpq.insertUpdate("n",   11);
testpq.insertUpdate("o",    9);
testpq.insertUpdate("p",   12);
testpq.insertUpdate("q",    5);
