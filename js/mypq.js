var DoubleLinkedList = function(){
	this.first = this.last = null;
	this.length = 0;
};
DoubleLinkedList.prototype = {
	constructor: DoubleLinkedList,
	insertAfter: function(prev, node){
		++this.length;
		node.time = new Date().getTime();
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
var PriorityQueue = function (){
	this.list = new DoubleLinkedList();
	this.vMap = new Map();
	this.pMap = new Map();
	this.pmList = new DoubleLinkedList();
	this.length = 0;
};
PriorityQueue.prototype = {
	constructor: PriorityQueue,
	peek: function(){
		if(this.list.length == 0){
			throw "Priority Queue is empty";
		}
		return {v: this.list.first.v, p: this.list.first.p};
		/*returns {v, p} order by (p, ins_time)*/
	},
	pop: function(){
		if(this.list.length == 0){
			throw "Priority Queue is empty";
		}
		var x = this.list.first;
		this.list.remove(x);
		this.vMap.delete(x.v);
		var px = this.pMap.get(x.p);
		//TODO: pmList?
		return {v: x.v, p: x.p};
		/*returns {v, p} order by (p, ins_time) and removes it*/
	},
	push: function(v, p){
		var w = this.vMap.get(v);
		if(typeof w === "undefined"){
			w = {v: v, p: p};
			this.vMap.set(v, w);
		}else{
			if(w.p == p){
				return;//no change
			}
			this.list.remove(w);
			var y = this.pMap.get(w.p);//must exist
			y.remove(w.pmw);
			if(y.length == 0){
				this.pMap.delete(w.p);
				this.pmList.remove(y);
			}
			w.p = p;
		}
		var wp = {v: v, p: p, vmw: w};
		w.pmw = wp;
		var y = this.pMap.get(p);
		var prevw = null;
		if(typeof y === "undefined"){
			y = new DoubleLinkedList();
			this.pMap.set(p, y);
			prevpm?
			prevw = this.pmList.insertAfter(prevpm, y);
		}else{
			prevw = y.last.vmw;
		}
		y.insertAfter(y.last, wp);
		this.list.insertAfter(prevw, w);
		/*inserts {v, p}*/
	}
};
var testpq = new PriorityQueue();
