function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomInterval(min, max) {
    return Math.random() * (max - min) + min;
}
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.id = "canvas";
renderer.setClearColor(0x000000, 1);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.0001, 1000);
camera.position.x = -12;
camera.position.y = 1;
camera.position.z = 0;
camera.lookAt(scene.position);

var controls = new THREE.FirstPersonControls(camera, renderer.domElement);
controls.lookSpeed = 5;
controls.noFly = false;
controls.activeLook = true;
controls.movementSpeed = 10;
//////////////////////////////////////////////////////////////////////////////////
//		set 3 point lighting						//
//////////////////////////////////////////////////////////////////////////////////

(function () {
    // add a ambient light
    var light = new THREE.AmbientLight(0x202020);
    scene.add(light);
    // add a light in front
    var light = new THREE.DirectionalLight('white', 0.9);
    light.position.set(10, 40, 10);
    scene.add(light);
    // add a light behind
    var light = new THREE.DirectionalLight('white', 0.7);
    light.position.set(-10, 40, -10);
    //scene.add( light );
})();

//////////////////////////////////////////////////////////////////////////////////
//		add an object and make it move					//
//////////////////////////////////////////////////////////////////////////////////
var width = 256;
var depth = 256;
var heightMap = THREEx.Terrain.allocateHeightMap(width, depth);
// var heightMap	= THREEx.Terrain.allocateHeightMap(64,64)
// var heightMap	= THREEx.Terrain.allocateHeightMap(4, 4)
// var heightMap	= THREEx.Terrain.allocateHeightMap(16,256)
THREEx.Terrain.simplexHeightMap(heightMap);
var geometry = new THREE.PlaneGeometry(100, 100, width - 1, depth - 1);
THREEx.Terrain.heightMapToPlaneGeometry(heightMap, geometry);
THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);

var material = new THREE.MeshLambertMaterial({
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors
});
// var material	= new THREE.MeshNormalMaterial({
// 	shading		: THREE.SmoothShading,
// })
//var grid_geom = geometry.clone();
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.lookAt(new THREE.Vector3(0, 1, 0));
function recomputePlane() {
    //scene.remove(mesh);
    THREEx.Terrain.heightMapToPlaneGeometry(heightMap, geometry);
    THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);
    //mesh = new THREE.Mesh(geometry, material);
    //scene.add(mesh);
    //mesh.lookAt(new THREE.Vector3(0, 1, 0));
    computeNeighbors(geometry);
}
/*
 var grid = new THREE.Mesh(mesh.geometry.clone(), new THREE.MeshLambertMaterial({
 shading: THREE.NoShading,
 vertexColors: THREE.FaceColors,
 wireframe: true
 }));
 grid.lookAt(new THREE.Vector3(0, 1, 0));
 scene.add(grid);
 for(i=0;i<grid.geometry.faces.length;++i){
 var face = grid.geometry.faces[i];
 for(j=0;j<face.vertexColors.length;++j){
 var color = face.vertexColors[j];
 color.setRGB(1,1,1);
 }
 }
 */
var vision_range = 2;
function changeVisionRange(range) {
    vision_range = range;
    sphere_range.geometry = new THREE.SphereGeometry(vision_range, 32, 32);
}
function computeNeighbors(geometry) {
    for (i = 0; i < geometry.vertices.length; ++i) {
        geometry.vertices[i].neighbors = new Set();
        geometry.vertices[i].faces = new Set();
    }
    for (i = 0; i < geometry.faces.length; ++i) {
        var face = geometry.faces[i];
        geometry.vertices[face.a].neighbors.add(face.b);
        geometry.vertices[face.b].neighbors.add(face.a);
        geometry.vertices[face.b].neighbors.add(face.c);
        geometry.vertices[face.c].neighbors.add(face.b);
        geometry.vertices[face.c].neighbors.add(face.a);
        geometry.vertices[face.a].neighbors.add(face.c);
        geometry.vertices[face.a].faces.add(i);
        geometry.vertices[face.b].faces.add(i);
        geometry.vertices[face.c].faces.add(i);
    }
}
computeNeighbors(geometry);
function find_positive_pos() {
    while (true) {
        var start_x = randomInt(1, 254);
        var start_z = randomInt(1, 254);
        start_vertex = start_x + start_z * 256;
        pos = geometry.vertices[start_vertex].clone();
        if (pos.z > 0) {
            return {position: pos, i: start_x, j: start_z, h: heightMap[start_x][start_z]};
        }
    }
}
function createLine(a, b) {
    var line_geom = new THREE.Geometry();
    var v1 = geometry.vertices[a].clone();
    v1.x = -geometry.vertices[a].y;
    v1.y = geometry.vertices[a].z;
    v1.z = -geometry.vertices[a].x;
    var v2 = geometry.vertices[b].clone();
    v2.x = -geometry.vertices[b].y;
    v2.y = geometry.vertices[b].z;
    v2.z = -geometry.vertices[b].x;
    line_geom.vertices.push(v1, v2);
    return new THREE.Line(line_geom, new THREE.LineBasicMaterial({
        color: 0xff0000
    }));
}
var sea_level = 0.41;
function edgeCost(a, b) {
    if (heightMap[a % 256][Math.floor(a / 256)] <= sea_level || heightMap[b % 256][Math.floor(b / 256)] <= sea_level) {
        return Number.POSITIVE_INFINITY;
    }
    var u = geometry.vertices[a];
    var v = geometry.vertices[b];
    return u.distanceTo(v);
}
function computeVertexVision(vertexidx) {
    var vertex = geometry.vertices[vertexidx];
    var visited = new Set();
    var queue = [vertexidx];
    var edges = [];
    while (queue.length > 0) {
        var u = queue.pop();
        var v = geometry.vertices[u];
        for (i of v.neighbors) {
            var w = geometry.vertices[i];
            var d = vertex.distanceTo(w);
            if (d <= vision_range && !visited.has(i)) {
                queue.push(i);
                edges.push({a: u, b: i});
                /*
                 var line = createLine(u, i);
                 line.geometry.vertices[0].y += 0.01;
                 line.geometry.vertices[1].y += 0.01;
                 line.material.color.setRGB(0,0,1);
                 scene.add(line);
                 */
            }
        }
        visited.add(u);
    }
    return {vertices: visited, edges: edges};
}
function displayEdges(edges) {
    for (i = 0; i < edges.length; ++i) {
        var edge = edges[i];
        var line = createLine(edge.a, edge.b);
        line.geometry.vertices[0].y += 0.01;
        line.geometry.vertices[1].y += 0.01;
        line.material.color.setRGB(0, 0, 1);
        scene.add(line);
    }
}

var point_start = {};
var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshPhongMaterial({color: 0xD49222}));
var sphere_pos = find_positive_pos();
sphere.position.x = -sphere_pos.position.y;
sphere.position.y = sphere_pos.position.z;
sphere.position.z = -sphere_pos.position.x;
scene.add(sphere);
camera.position.x = sphere.position.x - 3;
camera.position.y = sphere.position.y + 1;
camera.position.z = sphere.position.z;
point_start.object = sphere;
point_start.vertexidx = sphere_pos.i + sphere_pos.j * 256;
//point_start.vision_object = sphere_range;

var point_end = {};
var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshPhongMaterial({color: 0xFFFFFF}));
var sphere_pos = find_positive_pos();
sphere.position.x = -sphere_pos.position.y;
sphere.position.y = sphere_pos.position.z;
sphere.position.z = -sphere_pos.position.x;
scene.add(sphere);
point_end.object = sphere;
point_end.vertexidx = sphere_pos.i + sphere_pos.j * 256;

var graphDisplay = {

};

var Robot = function (start_index) {
    var robot = this;
    this.offset = 0.5;
    this.vision_range = 2;
    this.mesh_r = new THREE.SceneUtils.createMultiMaterialObject(new THREE.CylinderGeometry(0.2, 0, 1, 4, 4),
        [new THREE.MeshBasicMaterial({color: 0xFF0000}), new THREE.MeshBasicMaterial({color: 0, wireframe: true, visible:false})]);
    this.mesh_r.position.x = -geometry.vertices[start_index].y;
    this.mesh_r.position.y = geometry.vertices[start_index].z + this.offset;
    this.mesh_r.position.z = -geometry.vertices[start_index].x;

    var sphere_range = new THREE.Mesh(new THREE.SphereGeometry(this.vision_range, 32, 32),
        new THREE.MeshPhongMaterial({color: 0xFF0000, wireframe: false, opacity: 0.3, transparent: true, side: THREE.DoubleSide}));
    sphere_range.position.y = -this.offset-0.1;
    this.sphere_range = sphere_range;
    this.mesh_r.add(sphere_range);
    //sphere_range.parent = this.mesh;
    //scene.add(this.sphere_range);
    scene.add(this.mesh_r);

    this.known_v = [];
    this.known_e = [];
    this.g2k_map = new Map();
    this._totalTravel = 0;
    this.c_v_k_idx = this.global2knownVertex(start_index);
    this.status = "Ready";

    this.domElement = document.createElement("div");
    this.domElement.style.border = "1px solid white";
    var table = document.createElement("table");
    table.style.color = "white";
    var name_tr = document.createElement("tr");
    var name_td = document.createElement("td");
    name_td.colSpan = "2";
    name_td.style.textAlign = "center";
    name_td.innerText = "Robot rosu";
    name_tr.appendChild(name_td);
    table.appendChild(name_tr);

    var controls_tr = document.createElement("tr");
    var controls_td = document.createElement("td");
    controls_td.colSpan = "2";
    var controls_step = document.createElement("button");
    controls_step.innerText = "Step";
    controls_step.onclick = function(){robot.stepAlgorithm();};
    controls_td.appendChild(controls_step);
    var controls_middleStep = document.createElement("button");
    controls_middleStep.innerText = "Middle Step";
    controls_middleStep.onclick = function(){robot.middleStepAlgorithm();};
    controls_td.appendChild(controls_middleStep);
    var controls_majorStep = document.createElement("button");
    controls_majorStep.innerText = "Find/Move";
    controls_majorStep.onclick = function(){robot.majorStepAlgorithm();};
    controls_td.appendChild(controls_majorStep);
    controls_tr.appendChild(controls_td);
    table.appendChild(controls_tr);

    var travel_tr = document.createElement("tr");
    var travel_td_left = document.createElement("td");
    travel_td_left.textAlign = "right";
    travel_td_left.innerText = "Total travel:";
    travel_tr.appendChild(travel_td_left);
    var travel_td_right = document.createElement("td");
    travel_td_right.innerText = "0";
    travel_tr.appendChild(travel_td_right);
    table.appendChild(travel_tr);
    this.totalTravelDom = travel_td_right;

    var alg_sel_tr = document.createElement("tr");
    var alg_sel_td_title = document.createElement("td");
    alg_sel_td_title.textAlign = "right";
    alg_sel_td_title.innerText = "Algorithm:";
    alg_sel_tr.appendChild(alg_sel_td_title);
    var alg_sel_td_val = document.createElement("td");
    var algs_dom = getAlgsDom();
    algs_dom.onchange = function () {robot.algorithmIndex = this.selectedIndex;};
    alg_sel_td_val.appendChild(algs_dom);
    alg_sel_tr.appendChild(alg_sel_td_val);
    table.appendChild(alg_sel_tr);

    this.domElement.appendChild(table);

    this.updateVision();
};
Robot.prototype = {
    constructor: Robot,
    _algorithm: null,
    set goal(vidx) {
        this._goal = vidx;
        if (this.algorithmIndex != null)
            this.algorithm = new (algorithms[this.algorithmIndex].class)(this, vidx);
    },
    get goal() {
        return this._goal;
    },
    set algorithmIndex(i) {
        this._algorithmIndex = i;
        if (this.goal != null)
            this.algorithm = new (algorithms[i].class)(this, this.goal);
    },
    get algorithmIndex() {
        return this._algorithmIndex;
    },
    set algorithm(obj) {
        if (this._algorithm != null) {
            this.domElement.removeChild(this._algorithm.domElement);
        }
        this._algorithm = obj;
        this.domElement.appendChild(this._algorithm.domElement);
    },
    get algorithm() {
        return this._algorithm;
    },
    set totalTravel(count){
        this._totalTravel = count;
        this.totalTravelDom.innerText = ""+Math.floor(count*1000)/1000;
    },
    get totalTravel(){
        return this._totalTravel;
    },
    reset: function () {
        for (var i = 0; i < this.known_e.length; ++i) {
            scene.remove(this.known_e[i].line);
        }
        this.init(this.known_v[this.c_v_k_idx].g_v_idx);
    },
    moveTo: function (v) {
        if (this.findEdge(this.c_v_k_idx, v) === false) {
            throw "NOT A NEIGHBOR";
        }
        this.totalTravel += geometry.vertices[this.known_v[this.c_v_k_idx].g_v_idx].distanceTo(geometry.vertices[this.known_v[v].g_v_idx]);
        this.c_v_k_idx = v;
        var pos = geometry.vertices[this.known_v[v].g_v_idx];
        this.mesh_r.position.x = -pos.y;
        this.mesh_r.position.y = pos.z + this.offset;
        this.mesh_r.position.z = -pos.x;
        this.updateVision();
    },
    global2knownVertex: function (globalVertexIndex) {
        var k_idx = this.g2k_map.get(globalVertexIndex);
        if (typeof k_idx === "undefined") {
            k_idx = this.known_v.length;
            this.known_v.push({g_v_idx: globalVertexIndex, g_v_i: globalVertexIndex % 256, g_v_j: Math.floor(globalVertexIndex / 256), neighbors: new Set()});
            this.g2k_map.set(globalVertexIndex, k_idx);
        }
        return k_idx;
    },
    addEdge: function (a, b) {
        if (this.findEdge(a, b) !== false) {
            return;
        }
        var ei = this.known_e.length;
        this.known_e.push({a: a, b: b, line: this.createLine(a, b)});
        this.known_v[a].neighbors.add(ei);
        this.known_v[b].neighbors.add(ei);
        this.updateGeometry();
    },
    createLine: function (a, b) {
        var u = this.known_v[a].g_v_idx;
        var v = this.known_v[b].g_v_idx;
        var line = createLine(u, v);
        line.geometry.vertices[0].y += 0.05;
        line.geometry.vertices[1].y += 0.05;
        line.material.color.setHex(0x000000);
        return line;
    },
    updateGeometry: function () {
        if (this.mesh != null) {
            scene.remove(this.mesh);
            this.mesh = null;
        }
        if (this.known_e.length == 0)
            return;
        this.mesh = new THREE.Object3D();
        for (var i = 0; i < this.known_e.length; ++i) {
            this.mesh.add(this.known_e[i].line);
        }
        scene.add(this.mesh);
    },
    findEdge: function (a, b) {
        var nb;
        for (nb of this.known_v[a].neighbors) {
            var e = this.known_e[nb];
            if (e.a == b || e.b == b)
                return nb;
        }
        return false;
    },
    neighborV: function (ei, vi) {
        if (this.known_e[ei].a == vi)
            return this.known_e[ei].b;
        return this.known_e[ei].a;
    },
    colorEdge: function (a, b, color) {
        var ei = this.findEdge(a, b);
        this.known_e[ei].line.material.color.setHex(color);
    },
    removeEdge: function (a, b) {
        var ei = this.findEdge(a, b);
        if (ei === false)
            return;
        scene.remove(this.known_e[ei].line);
        this.known_e[ei].line = null;
        this.known_v[this.known_e[ei].a].neighbors.delete(ei);
        this.known_v[this.known_e[ei].b].neighbors.delete(ei);
        console.warn("removing edge references and line from scene. edge vector index not removed.");
    },
    updateVision: function () {
        var vision = computeVertexVision(this.known_v[this.c_v_k_idx].g_v_idx);
        var myarr = [];
        for (v of vision.vertices) {
            myarr.push({g_v: v, k_v: this.global2knownVertex(v)});
        }
        for (var i = 0; i < this.known_e.length; ++i) {
            this.known_e[i].line.material.color.setHex(0x707070);
        }
        for (var i = 0; i < vision.edges.length; ++i) {
            var a = this.global2knownVertex(vision.edges[i].a);
            var b = this.global2knownVertex(vision.edges[i].b);
            this.addEdge(a, b);
            var ei = this.findEdge(a, b);
            this.known_e[ei].line.material.color.setHex(0x0000FF);
        }
    },
    stepAlgorithm: function () {
        if(this.algorithm.state < 0)
            return false;
        return this.algorithm.step();
    },
    middleStepAlgorithm: function () {
        var step = this.algorithm.middleStepCount;
        var hasNext;
        for (; this.algorithm.middleStepCount == step;) {
            hasNext = this.stepAlgorithm();
        }
        return hasNext;
    },
    majorStepAlgorithm: function () {
        var step = this.algorithm.majorStepCount;
        var hasNext;
        for (; this.algorithm.majorStepCount == step;) {
            hasNext = this.middleStepAlgorithm();
        }
        return hasNext;
    }
};

/////////////BFS
var algorithm_bfs = function (robot, goal) {
    this.robot = robot;
    this.goal = goal;
    this.state = 0;
    this.majorStepCountDom = document.createElement("span");
    this.majorStepCountDom.style.textAlign = "right";
    this.majorStepCountDom.innerText = "0";
    this.middleStepCountDom = document.createElement("span");
    this.middleStepCountDom.style.textAlign = "right";
    this.middleStepCountDom.innerText = "0";
    this.stepCountDom = document.createElement("span");
    this.stepCountDom.style.textAlign = "right";
    this.stepCountDom.innerText = "0";
    this.totalStepCountDom = document.createElement("span");
    this.totalStepCountDom.style.textAlign = "right";
    this.totalStepCountDom.innerText = "0";
    this._majorStepCount = 0;
    this._middleStepCount = 0;
    this._stepCount = 0;
    this._totalStepCount = 0;
    var row = document.createElement("tr");
    var row_left = document.createElement("td");
    row_left.style.textAlign = "right";
    var row_right = document.createElement("td");
    row.appendChild(row_left);
    row.appendChild(row_right);
    var row1 = $(row).clone()[0];
    row1.childNodes[0].innerText = "Steps:";
    row1.childNodes[1].appendChild(this.stepCountDom);
    this.domElement = document.createElement("table");
    this.domElement.style.color = "white";
    this.domElement.appendChild(row1);
    row1 = $(row).clone()[0];
    row1.childNodes[0].innerText = "Major steps:";
    row1.childNodes[1].appendChild(this.majorStepCountDom);
    this.domElement.appendChild(row1);
    row1 = $(row).clone()[0];
    row1.childNodes[0].innerText = "Total steps:";
    row1.childNodes[1].appendChild(this.totalStepCountDom);
    this.domElement.appendChild(row1);
};
algorithm_bfs.prototype = {
    constructor: algorithm_bfs,
    set majorStepCount(count) {
        this.majorStepCountDom.innerText = count;
        this._majorStepCount = count;
    },
    get majorStepCount() {
        return this._majorStepCount;
    },
    set middleStepCount(count) {
        this.middleStepCountDom.innerText = count;
        this._middleStepCount = count;
    },
    get middleStepCount() {
        return this._middleStepCount;
    },
    set stepCount(count) {
        this.stepCountDom.innerText = count;
        this._stepCount = count;
    },
    get stepCount() {
        return this._stepCount;
    },
    set totalStepCount(count) {
        this.totalStepCountDom.innerText = count;
        this._totalStepCount = count;
    },
    get totalStepCount() {
        return this._totalStepCount;
    },
    reset: function (goal) {
        this.init(goal);
    },
    step: function () {
        ++this.stepCount;
        ++this.totalStepCount;
        switch (this.state) {
            case 0:
                this.queue = [];
                this.visited = new Set();
                var cq = {ki: this.robot.c_v_k_idx, c: 0, prev: null};
                this.robot.known_v[cq.ki].h = Number.POSITIVE_INFINITY;
                this.bestF = null;
                this.queue.push(cq);
                this.visited.add(cq.ki);
                this.state = 1;
                this.stepCount = 1;
                return true;
                break;
            case 1:
                if (this.queue.length == 0) {
                    this.state = 3;
                    this.pathrev = this.bestF;
                    if (this.robot.known_v[this.bestF.ki].h + this.bestF.c == Number.POSITIVE_INFINITY) {
                        console.info("BFS: blocked!");
                        return false;
                    }
                    return false;
                }
                this.cq = this.queue.shift();
                this.iter = this.robot.known_v[this.cq.ki].neighbors.values();
                this.state = 2;
                return true;
                break;
            case 2:
                var next = this.iter.next();
                if (next.done) {
                    this.state = 1;
                    ++this.middleStepCount;
                } else {
                    var nki = this.robot.neighborV(next.value, this.cq.ki);
                    var ngi = this.robot.known_v[nki].g_v_idx;
                    var cgi = this.robot.known_v[this.cq.ki].g_v_idx;
                    var cost = edgeCost(cgi, ngi);
                    var nq = {ki: nki, c: this.cq.c + cost, prev: this.cq};
                    if (this.robot.known_v[nki].h != Number.POSITIVE_INFINITY) {
                        var h = Number.POSITIVE_INFINITY;
                        if (vision_range - nq.c <= 0.5) {
                            h = this.vertexH(ngi);
                        }
                        this.robot.known_v[nki].h = h;
                    }
                    if (!this.visited.has(nki) && nq.c != Number.POSITIVE_INFINITY) {
                        if (this.goal == ngi) {
                            this.state = 3;
                            this.pathrev = nq;
                        } else {
                            this.robot.colorEdge(nq.ki, nq.prev.ki, 0x00FF00);
                            this.queue.push(nq);// /or update cost
                            this.visited.add(nq.ki);
                            if (this.bestF == null || this.robot.known_v[nki].h + nq.c < this.robot.known_v[this.bestF.ki].h + this.bestF.c) {
                                this.bestF = nq;
                            }
                        }
                    }
                }
                return true;
                break;
            case 3:
                var q, lq;
                for (q = this.pathrev, lq = q; q.prev != null; lq = q, q = q.prev) {
                    this.robot.colorEdge(q.ki, q.prev.ki, 0xFF0000);
                }
                this.move_to = lq.ki;
                this.state = 4;
                ++this.middleStepCount;
                ++this.majorStepCount;
                return true;
                break;
            case 4:
                this.robot.moveTo(this.move_to);
                ++this.middleStepCount;
                ++this.majorStepCount;
                if (this.robot.known_v[this.move_to].g_v_idx == this.goal) {
                    this.state = -2;
                    console.info("BFS: finished (goal)");
                    return false;
                }
                this.state = 0;//reset
                return true;
                break;
            default:
                this.state = -1;
                console.error("BFS: crashed");
                return false;
                break;
        }
    },
    vertexH: function (vidx) {
        return geometry.vertices[vidx].distanceTo(geometry.vertices[this.goal]);
    },
    checkVision: function (vidx) {
        return geometry.vertices[this.robot.known_v[this.robot.c_v_k_idx].g_v_idx].distanceTo(geometry.vertices[vidx]) <= vision_range;
    }
};
var algorithm_dstar = function (robot, goal) {
    this.robot = robot;
    this.goal = goal;
    this.state = 0;
    this.majorStepCountDom = document.createElement("span");
    this.majorStepCountDom.style.textAlign = "right";
    this.majorStepCountDom.innerText = "0";
    this.middleStepCountDom = document.createElement("span");
    this.middleStepCountDom.style.textAlign = "right";
    this.middleStepCountDom.innerText = "0";
    this.stepCountDom = document.createElement("span");
    this.stepCountDom.style.textAlign = "right";
    this.stepCountDom.innerText = "0";
    this.totalStepCountDom = document.createElement("span");
    this.totalStepCountDom.style.textAlign = "right";
    this.totalStepCountDom.innerText = "0";
    this._majorStepCount = 0;
    this._middleStepCount = 0;
    this._stepCount = 0;
    this._totalStepCount = 0;
    var row = document.createElement("tr");
    var row_left = document.createElement("td");
    row_left.style.textAlign = "right";
    var row_right = document.createElement("td");
    row.appendChild(row_left);
    row.appendChild(row_right);
    var row1 = $(row).clone()[0];
    row1.childNodes[0].innerText = "Steps:";
    row1.childNodes[1].appendChild(this.stepCountDom);
    this.domElement = document.createElement("table");
    this.domElement.style.color = "white";
    this.domElement.appendChild(row1);
    row1 = $(row).clone()[0];
    row1.childNodes[0].innerText = "Major steps:";
    row1.childNodes[1].appendChild(this.majorStepCountDom);
    this.domElement.appendChild(row1);
    row1 = $(row).clone()[0];
    row1.childNodes[0].innerText = "Total steps:";
    row1.childNodes[1].appendChild(this.totalStepCountDom);
    this.domElement.appendChild(row1);
};
algorithm_dstar.prototype = {
    constructor: algorithm_dstar,
    set majorStepCount(count) {
        this.majorStepCountDom.innerText = count;
        this._majorStepCount = count;
    },
    get majorStepCount() {
        return this._majorStepCount;
    },
    set middleStepCount(count) {
        this.middleStepCountDom.innerText = count;
        this._middleStepCount = count;
    },
    get middleStepCount() {
        return this._middleStepCount;
    },
    set stepCount(count) {
        this.stepCountDom.innerText = count;
        this._stepCount = count;
    },
    get stepCount() {
        return this._stepCount;
    },
    set totalStepCount(count) {
        this.totalStepCountDom.innerText = count;
        this._totalStepCount = count;
    },
    get totalStepCount() {
        return this._totalStepCount;
    },
    reset: function (goal) {
        this.init(goal);
    },
    step: function () {
        ++this.stepCount;
        ++this.totalStepCount;
        switch (this.state) {
            case 0:
                this.queue = [];
                this.visited = new Set();
                var cq = {ki: this.robot.c_v_k_idx, c: 0, prev: null};
                this.robot.known_v[cq.ki].h = Number.POSITIVE_INFINITY;
                this.bestF = null;
                this.queue.push(cq);
                this.visited.add(cq.ki);
                this.state = 1;
                this.stepCount = 1;
                return true;
                break;
            case 1:
                if (this.queue.length == 0) {
                    this.state = 3;
                    this.pathrev = this.bestF;
                    if (this.robot.known_v[this.bestF.ki].h + this.bestF.c == Number.POSITIVE_INFINITY) {
                        console.info("BFS: blocked!");
                        return false;
                    }
                    return false;
                }
                this.cq = this.queue.shift();
                this.iter = this.robot.known_v[this.cq.ki].neighbors.values();
                this.state = 2;
                return true;
                break;
            case 2:
                var next = this.iter.next();
                if (next.done) {
                    this.state = 1;
                    ++this.middleStepCount;
                } else {
                    var nki = this.robot.neighborV(next.value, this.cq.ki);
                    var ngi = this.robot.known_v[nki].g_v_idx;
                    var cgi = this.robot.known_v[this.cq.ki].g_v_idx;
                    var cost = edgeCost(cgi, ngi);
                    var nq = {ki: nki, c: this.cq.c + cost, prev: this.cq};
                    if (this.robot.known_v[nki].h != Number.POSITIVE_INFINITY) {
                        var h = Number.POSITIVE_INFINITY;
                        if (vision_range - nq.c <= 0.5) {
                            h = this.vertexH(ngi);
                        }
                        this.robot.known_v[nki].h = h;
                    }
                    if (!this.visited.has(nki) && nq.c != Number.POSITIVE_INFINITY) {
                        if (this.goal == ngi) {
                            this.state = 3;
                            this.pathrev = nq;
                        } else {
                            this.robot.colorEdge(nq.ki, nq.prev.ki, 0x00FF00);
                            this.queue.push(nq);// /or update cost
                            this.visited.add(nq.ki);
                            if (this.bestF == null || this.robot.known_v[nki].h + nq.c < this.robot.known_v[this.bestF.ki].h + this.bestF.c) {
                                this.bestF = nq;
                            }
                        }
                    }
                }
                return true;
                break;
            case 3:
                var q, lq;
                for (q = this.pathrev, lq = q; q.prev != null; lq = q, q = q.prev) {
                    this.robot.colorEdge(q.ki, q.prev.ki, 0xFF0000);
                }
                this.move_to = lq.ki;
                this.state = 4;
                ++this.middleStepCount;
                ++this.majorStepCount;
                return true;
                break;
            case 4:
                this.robot.moveTo(this.move_to);
                ++this.middleStepCount;
                ++this.majorStepCount;
                if (this.robot.known_v[this.move_to].g_v_idx == this.goal) {
                    this.state = -2;
                    console.info("BFS: finished (goal)");
                    return false;
                }
                this.state = 0;//reset
                return true;
                break;
            default:
                this.state = -1;
                console.error("BFS: crashed");
                return false;
                break;
        }
    },
    vertexH: function (vidx) {
        return geometry.vertices[vidx].distanceTo(geometry.vertices[this.goal]);
    },
    checkVision: function (vidx) {
        return geometry.vertices[this.robot.known_v[this.robot.c_v_k_idx].g_v_idx].distanceTo(geometry.vertices[vidx]) <= vision_range;
    }
};
var algorithms = [{class: algorithm_bfs, name: "Breadth-First Search"}, {class: algorithm_dstar, name: "D*"}];
function getAlgsDom() {
    var sel = document.createElement("select");
    for (i = 0; i < algorithms.length; ++i) {
        var op = document.createElement("option");
        op.innerText = algorithms[i].name;
        sel.appendChild(op);
    }
    return sel;
}
var robot1 = new Robot(point_start.vertexidx);
robot1.algorithmIndex = 0;
robot1.goal = point_end.vertexidx;
var robot2 = new Robot(point_start.vertexidx);
robot2.algorithmIndex = 0;
robot2.goal = point_end.vertexidx;
robot2.domElement.childNodes[0].childNodes[0].childNodes[0].innerText = "Robot albastru";
robot2.mesh_r.children[0].material.color.setHex(0x0000FF);
robot2.mesh_r.children[0].scale.y = 2;
robot2.mesh_r.children[1].scale.y = 2;
robot2.mesh_r.position.y += robot2.offset;
robot2.mesh_r.children[2].position.y -= robot2.offset+0.1;
robot2.mesh_r.children[2].material.color.setHex(0x0000FF);
robot2.mesh_r.children[2].material.wireframe = true;
robot2.offset = 1;
var robots_domElement = document.createElement("div");
robots_domElement.style.cssText = "position: fixed; top: 0px; right: 0px; z-index: 1000;";
robots_domElement.appendChild(robot1.domElement);
robots_domElement.appendChild(robot2.domElement);
function reset(elem) {
    algorithm.reset(point_end.vertexidx);
    robot1.mem.reset();
}
function blockRobot(robot, radius) {
    var gvidx = robot.mem.known_v[robot.mem.c_v_k_idx].g_v_idx;
    var gvi = robot.mem.known_v[robot.mem.c_v_k_idx].g_v_i;
    var gvj = robot.mem.known_v[robot.mem.c_v_k_idx].g_v_j;
    for (var i = -radius; i < radius; ++i) {
        if (gvi + i >= 0 && gvi + i < 256 && gvj - radius > 0)
            heightMap[gvi + i][gvj - radius] = sea_level;
        if (gvi + radius < 256 && gvj + i >= 0 && gvj + i < 256)
            heightMap[gvi + radius][gvj + i] = sea_level;
        if (gvi - i < 256 && gvi - i >= 0 && gvj + radius < 256)
            heightMap[gvi - i][gvj + radius] = sea_level;
        if (gvi - radius > 0 && gvj - i >= 0 && gvj - i < 256)
            heightMap[gvi - radius][gvj - i] = sea_level;
    }
    recomputePlane();
}
//var auto_play_step_types = [stepAlgorithm, middleStepAlgorithm, majorStepAlgorithm];
var auto_play_step_type = 0;
var auto_play_enable = false;
var auto_play_interval = 100;
var auto_play_last = performance.now();
function autoPlayStep(elem) {
    auto_play_enable = !auto_play_enable;
}
function autoPlayUpdate(now) {
    if (auto_play_enable && now - auto_play_last >= auto_play_interval) {
        auto_play_enable = auto_play_step_types[auto_play_step_type]();
        auto_play_last = now;
    }
}
function autoPlayStepType(elem) {
    auto_play_step_type = elem.selectedIndex;
}

myElem = document.createElement("div");
myElem.style.cssText = "position:fixed; bottom:0px; left:0px; color: white;";
var stats = new MYSTATS.Stats();
var lastTimeMsec = performance.now();
var lastFrameDuration = null;
function init(nowMsec) {
    requestAnimationFrame(animate);
}
function animate(nowMsec) {
    var frameDuration = nowMsec - lastTimeMsec;
    if (lastFrameDuration) {
        frameDuration *= 0.9;
        frameDuration += lastFrameDuration * 0.1;
    }
    var fd = frameDuration / 1000;
    stats.update(fd, !controls.hideAll);
    controls.update(fd);
    autoPlayUpdate(nowMsec);
    renderer.render(scene, camera);
    myElem.innerHTML =
        "x: " +
        Math.round(camera.position.x * 100) /
        100 +
        "<br>y: " +
        Math.round(camera.position.y * 100) /
        100 +
        "<br>z: " +
        Math.round(camera.position.z * 100) /
        100;
    lastTimeMsec = nowMsec;
    requestAnimationFrame(animate);
}

window.onbeforeunload = function (e) {
    controls.resetControls();
    return '';
};
window.onresize = function (event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};
window.onload = function (e) {
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(stats.domElement);
    document.body.appendChild(myElem);
    document.body.appendChild(robots_domElement);
    requestAnimationFrame(init);
};