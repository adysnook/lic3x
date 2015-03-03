var MYGRAPH = MYGRAPH || {REVISION: "1"};
MYGRAPH.Vertex = function (id, position, label) {
    this.setId(id);
    this.setPosition(position);
    this.setLabel(label);
};
MYGRAPH.Vertex.prototype = {
    constructor: MYGRAPH.Vertex,
    setPosition: function(position){
        if(!(position instanceof THREE.Vector3))
            throw Error("invalid argument: position must be a THREE.Vector3");
        this.position = position;
    },
    getPosition: function(){
        return this.position;
    },
    setLabel: function(label){
        if(typeof label != "string")
            throw Error("invalid argument: label must be a string");
        this.label = label;
    },
    getLabel: function(){
        return this.label;
    },
    setId: function(id){
        this.id=id;
    },
    getId: function(){
        return this.id;
    }
};

MYGRAPH.Arc = function (startVertex, endVertex, label) {
    this.setStartVertex(startVertex);
    this.setEndVertex(endVertex);
    this.setLabel(label);
};
MYGRAPH.Arc.prototype = {
    constructor: MYGRAPH.Arc,
    setStartVertex: function(startVertex){
        if(!(startVertex instanceof MYGRAPH.Vertex))
            throw Error("invalid argument: startVertex must be a MYGRAPH.Vertex");
        this.startVertex = startVertex;
    },
    getStartVertex: function(){
        return this.startVertex;
    },
    setEndVertex: function(endVertex){
        if(!(endVertex instanceof MYGRAPH.Vertex))
            throw Error("invalid argument: endVertex must be a MYGRAPH.Vertex");
        this.endVertex = endVertex;
    },
    getEndVertex: function(){
        return this.endVertex;
    },
    setLabel: function(label) {
        this.label = label;
    },
    getLabel: function(){
        return this.label;
    }
};

MYGRAPH.Graph = function () {
    this.vertices = [];
    this.arcs = [];
};
MYGRAPH.Graph.prototype = {
  constructor: MYGRAPH.Graph,
    setVertices: function(vertices){//TODO: disable
        this.vertices = vertices;
    },
    setArcs: function(arcs) {//TODO: disable
        this.arcs = arcs;
    },
    addVertex: function(vertex){//TODO: check vertex
        var i = this.vertices.length;
        vertex.index = i;
        vertex.in = [];
        vertex.out = [];
        this.vertices[i]=vertex;
    },
    addArc: function (arc) {//TODO: check arc, arc.startv, arc.endv
        var i = this.arcs.length;
        arc.index = i;
        arc.startVertex.out.push(arc.endVertex);
        arc.endVertex.in.push(arc.startVertex);
        this.arcs[i]=arc;
    },
    connectedComponents: function(){
        var out = "";
        var i, j, n=this.vertices.length, m=this.arcs.length;
        var viz = new Array(n);
        for(i=0; i<n; ++i){
            viz[i]=false;
            this.vertices[i].index = i;
        }
        for(i=0; i<n; ++i){
            if(!viz[i]){
                var q = [i];
                out+="\n";
                while(q.length>0){
                    var u = q.pop();
                    viz[u]=true;
                    out+=this.vertices[u].getLabel()+" ";
                    for(j=0; j<this.vertices[u].out.length; ++j){
                        if(!viz[this.vertices[u].out[j].index])
                            q.push(this.vertices[u].out[j].index);
                    }
                }
            }
        }
        return out;
    }
};

/*
THREE.Vector2 = function (a, b) {
    this.x = a || 0;
    this.y = b || 0
};
THREE.Vector2.prototype = {
    constructor: THREE.Vector2, set: function (a, b) {
        this.x = a;
        this.y = b;
        return this
    }, setX: function (a) {
        this.x = a;
        return this
    }, setY: function (a) {
        this.y = a;
        return this
    }, setComponent: function (a, b) {
        switch (a) {
            case 0:
                this.x = b;
                break;
            case 1:
                this.y = b;
                break;
            default:
                throw Error("index is out of range: " + a);
        }
    }, getComponent: function (a) {
        switch (a) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            default:
                throw Error("index is out of range: " + a);
        }
    }, copy: function (a) {
        this.x = a.x;
        this.y = a.y;
        return this
    }, add: function (a,
                      b) {
        if (void 0 !== b)return console.warn("DEPRECATED: Vector2's .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(a, b);
        this.x += a.x;
        this.y += a.y;
        return this
    }, addVectors: function (a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this
    }, addScalar: function (a) {
        this.x += a;
        this.y += a;
        return this
    }, sub: function (a, b) {
        if (void 0 !== b)return console.warn("DEPRECATED: Vector2's .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(a, b);
        this.x -= a.x;
        this.y -=
            a.y;
        return this
    }, subVectors: function (a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this
    }, multiplyScalar: function (a) {
        this.x *= a;
        this.y *= a;
        return this
    }, divideScalar: function (a) {
        0 !== a ? (a = 1 / a, this.x *= a, this.y *= a) : this.y = this.x = 0;
        return this
    }, min: function (a) {
        this.x > a.x && (this.x = a.x);
        this.y > a.y && (this.y = a.y);
        return this
    }, max: function (a) {
        this.x < a.x && (this.x = a.x);
        this.y < a.y && (this.y = a.y);
        return this
    }, clamp: function (a, b) {
        this.x < a.x ? this.x = a.x : this.x > b.x && (this.x = b.x);
        this.y < a.y ? this.y = a.y : this.y > b.y && (this.y = b.y);
        return this
    }, negate: function () {
        return this.multiplyScalar(-1)
    }, dot: function (a) {
        return this.x * a.x + this.y * a.y
    }, lengthSq: function () {
        return this.x * this.x + this.y * this.y
    }, length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }, normalize: function () {
        return this.divideScalar(this.length())
    }, distanceTo: function (a) {
        return Math.sqrt(this.distanceToSquared(a))
    }, distanceToSquared: function (a) {
        var b = this.x - a.x, a = this.y - a.y;
        return b * b + a * a
    }, setLength: function (a) {
        var b = this.length();
        0 !== b && a !== b && this.multiplyScalar(a /
        b);
        return this
    }, lerp: function (a, b) {
        this.x += (a.x - this.x) * b;
        this.y += (a.y - this.y) * b;
        return this
    }, equals: function (a) {
        return a.x === this.x && a.y === this.y
    }, fromArray: function (a) {
        this.x = a[0];
        this.y = a[1];
        return this
    }, toArray: function () {
        return [this.x, this.y]
    }, clone: function () {
        return new THREE.Vector2(this.x, this.y)
    }
};
*/
