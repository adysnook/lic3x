var DoublyLinkedList = function () {
    this.first = this.last = null;
    this.length = 0;
};
DoublyLinkedList.prototype = {
    constructor: DoublyLinkedList,
    insertAfter: function (prev, info) {
        ++this.length;
        var node = {info: info, time: performance.now()};
        if (prev == null) {
            node.prev = null;
            node.next = this.first;
            if (this.first != null) {
                this.first.prev = node;
            } else {
                this.last = node;
            }
            this.first = node;
        } else {
            node.prev = prev;
            node.next = prev.next;
            var x = prev.next;
            if (x == null) {
                this.last = node;
            } else {
                x.prev = node;
            }
            prev.next = node;
        }
    },
    remove: function (node) {
        --this.length;
        if (node.prev == null) {
            this.first = node.next;
        } else {
            node.prev.next = node.next;
        }
        if (node.next == null) {
            this.last = node.prev;
        } else {
            node.next.prev = node.prev;
        }
    },
    toString: function () {
        var text = "";
        for (var q = this.first; q != null; q = q.next) {
            text += q.info.key + " ";
        }
        return text;
    }
};
var PriorityQueue = function (priorityCompare) {//Fibonacci Heap
    this._rootList = new DoublyLinkedList();
    this._compare = priorityCompare;//A less B <=> true
    this._min = null;
    this._valMap = new Map();
    this.length = 0;
};
PriorityQueue.prototype = {
    constructor: PriorityQueue,
    _cutChild: function(q){
        if(q.parent == null)
            return;
        var p = q.parent;
        do{
            //cut q
            p.children.remove(q.parentListNode);
            q.parentListNode = null;
            q.parent = null;
            //update rank
            var rank = -1;
            for(var qi=p.children.first; qi!=null; qi=qi.next){
                if(rank<qi.info.rank){
                    rank = qi.info.rank;
                }
            }
            ++rank;
            p.rank = rank;
            //meld into root list
            this._rootList.insertAfter(null, q);
            q.rootNode = this._rootList.first;
            //unmark
            q.mark = false;
            //next parent
            q = p;
            p = p.parent;
        } while (q.mark);
        if (p != null)
            q.mark = true;
    },
    _resetMin: function(){
        var min = null;
        for (var q = this._rootList.first; q != null; q = q.next) {
            if (min == null || this._compare(q.info.key, min.info.key)) {
                min = q;
            }
        }
        if (min == null) {
            this._min = null;
        } else {
            this._min = min.info;
        }
    },
    has: function (value) {
        return (typeof this._valMap.get(value) !== "undefined");
    },
    insertUpdate: function (value, priority) {
        //if exists change key
        if (typeof this._valMap.get(value) !== "undefined") {
            var node = this._valMap.get(value);
            var oldPriority = node.key;
            node.key = priority;
            if (this._compare(priority, oldPriority)) {
                //decrease-key
                if (node.parent != null && this._compare(priority, node.parent.key)) {
                    //heap order violated
                    this._cutChild(node);
                }
                if (this._compare(priority, this._min.key)) {
                    this._min = node;
                }
            } else {
                //increase-key
                for(var q=node.children.first; q!=null; q=q.next){
                    if(this._compare(q.info.key, node.key)){//heap order violated
                        this._cutChild(q.info);
                    }
                }
                if(node.parent == null)
                    this._resetMin();
            }
            //this._rootList.toString();
            return;
        }
        var node = {val: value, key: priority, rank: 0, children: new DoublyLinkedList(), mark: false, parent: null};
        this._valMap.set(value, node);
        this._rootList.insertAfter(null, node);
        var ln = this._rootList.first;
        node.rootNode = ln;
        if (this._min == null || this._compare(node.key, this._min.key)) {
            this._min = node;
        }
        ++this.length;
    },
    deleteNode: function(value) {
        if (typeof this._valMap.get(value) === "undefined") {
            return;
        }
        var node = this._valMap.get(value);
        this._valMap.delete(value);
        for(var q=node.children.first; q!=null; q=q.next){
            this._cutChild(q.info);
        }
        this._cutChild(node);
        this._rootList.remove(node.rootNode);
        if(this._min == node){
            this._resetMin();
        }
    },
    peek: function () {
        if (this.length == 0)
            return;
        return {value: this._min.val, priority: this._min.key};
    },
    pop: function () {
        var ret = this.peek();
        if (typeof ret === "undefined")
            return;
        //delete min
        this._rootList.remove(this._min.rootNode);
        this._valMap.delete(ret.value);
        //meld its children into root list
        for (var q = this._min.children.first; q != null; q = q.next) {
            this._rootList.insertAfter(null, q.info);
            var ln = this._rootList.first;
            q.info.mark = false;
            q.info.parent = null;
            q.info.parentListNode = null;
            q.info.rootNode = ln;
        }
        this._min.children = new DoublyLinkedList();
        //consolidate trees, no two roots have same rank
        var rankArray = [];
        for (var q = this._rootList.first; q != null;) {
            if (typeof rankArray[q.info.rank] === "undefined" || rankArray[q.info.rank] == null) {
                rankArray[q.info.rank] = q;
                q = q.next;
                continue;
            }
            var qr = q.info.rank;
            var lq = rankArray[q.info.rank];
            var qi;
            if (this._compare(q.info.key, lq.info.key)) {
                qi = q.info;
                qi.children.insertAfter(null, lq.info);
                lq.info.parentListNode = qi.children.first;
                lq.info.parent = qi;
            } else {
                qi = lq.info;
                qi.children.insertAfter(null, q.info);
                q.info.parentListNode = qi.children.first;
                q.info.parent = qi;
            }
            this._rootList.remove(lq);
            lq.info.rootNode = null;
            ++qi.rank;
            qi.mark = false;
            qi.parent = null;
            qi.rootNode = q;
            q.info = qi;
            rankArray[qr] = null;
        }
        --this.length;
        //update min
        this._resetMin();
        return ret;
    },
    toString: function () {
        var text = "";
        for (var q = this._rootList.first; q != null; q = q.next) {
            text += this.nodeToString(q.info)+"\n";
        }
        return text;
    }
    ,
    nodeToString: function (node, pre) {
        if(pre == null)
            pre = "";
        if (node == null)
            return;
        var text = pre+node.key+"\n";
        for (var c = node.children.first; c != null; c = c.next) {
            text += pre+this.nodeToString(c.info, pre+" ");
        }
        return text;
    },
    isEmpty: function(){
        return this.length==0;
    }
};
var testpq = new PriorityQueue(function (a, b) {
    return a < b;
});
/*
testpq.insertUpdate("a", 1);
testpq.insertUpdate("b", 14);
testpq.insertUpdate("c", 12.5);
testpq.insertUpdate("d", 13.4);
testpq.insertUpdate("e", 9.3);
testpq.insertUpdate("f", 19);
testpq.insertUpdate("g", 11.2);
testpq.insertUpdate("h", 8);
testpq.insertUpdate("i", 7.1);
testpq.insertUpdate("j", 13);
testpq.insertUpdate("k", 7);
testpq.insertUpdate("l", 20);
testpq.insertUpdate("m", 6);
testpq.insertUpdate("n", 11);
testpq.insertUpdate("o", 9);
testpq.insertUpdate("p", 12);
testpq.insertUpdate("q", 5);
var abcdef = testpq.pop();
//console.log(abcdef.value+" "+abcdef.priority);
//console.log(testpq.toString());

//TEST decrease-key
testpq.insertUpdate("h", 2);
testpq.insertUpdate("d", 3);
testpq.insertUpdate("c", 4);

//TEST delete
testpq.deleteNode("i");
console.log(testpq.toString());
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);
abcdef = testpq.pop();
console.log(abcdef.value+" "+abcdef.priority);

//testpq.insertUpdate("i", 9.31);
//console.log(testpq.toString());
*/