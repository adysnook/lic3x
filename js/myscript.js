function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomInterval(min, max) {
    return Math.random() * (max - min) + min;
}

myElem = document.createElement("div");
myElem.style.cssText = "position:fixed; bottom:0px; left:0px; width:100px; height:100px; background-color:black; color: white;";


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
controls.lookSpeed = 2;
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

var heightMap = THREEx.Terrain.allocateHeightMap(256, 256);
// var heightMap	= THREEx.Terrain.allocateHeightMap(64,64)
// var heightMap	= THREEx.Terrain.allocateHeightMap(4, 4)
// var heightMap	= THREEx.Terrain.allocateHeightMap(16,256)
THREEx.Terrain.simplexHeightMap(heightMap);

var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);
var x, z;
for (x = 0; x < 256; ++x) {
    for (z = 0; z < 256; ++z) {
        if (heightMap[x][z] < 0.4) {
            heightMap[x][z] = 0.4;
            var vertex = geometry.vertices[x + z * 256];
            vertex.z = (heightMap[x][z] - 0.5) * 10;
        }
    }
}

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
    var line = new THREE.Line(line_geom, new THREE.LineBasicMaterial({
        color: 0xff0000
    }));
    return line;
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
var sphere_range = new THREE.Mesh(new THREE.SphereGeometry(vision_range, 32, 32),
    new THREE.MeshPhongMaterial({color: 0xD49222, wireframe: false, opacity: 0.6, transparent: true}));
scene.add(sphere);
scene.add(sphere_range);
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

var robot = new THREE.SceneUtils.createMultiMaterialObject(new THREE.CylinderGeometry(0.3, 0, 1, 4, 4),
    [new THREE.MeshBasicMaterial({color: 0xD03030}), new THREE.MeshBasicMaterial({color: 0, wireframe: true})]);
scene.add(robot);
robot.position.copy(point_start.object.position);
robot.position.y += 0.5;
robot.mem = {
    init: function (start_index) {
        this.parent = robot;
        this.known_v = [];
        this.known_e = [];
        this.g2k_map = new Map();
        this.c_v_k_idx = this.global2knownVertex(start_index);
        this.updateVision();
    },
    moveTo: function (v) {
        if(this.findEdge(this.c_v_k_idx, v)===false){
            throw "NOT A NEIGHBOR";
        }
        this.c_v_k_idx = v;
        var pos = geometry.vertices[this.known_v[v].g_v_idx];
        this.parent.position.x = -pos.y;
        this.parent.position.y = pos.z+0.5;
        this.parent.position.z = -pos.x;
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
    addEdge: function(a, b){
        if(this.findEdge(a, b) !== false){
            return;
        }
        var ei = this.known_e.length;
        this.known_e.push({a: a, b: b, line: this.createLine(a, b)});
        this.known_v[a].neighbors.add(ei);
        this.known_v[b].neighbors.add(ei);
    },
    createLine: function (a, b) {
        var u = this.known_v[a].g_v_idx;
        var v = this.known_v[b].g_v_idx;
        var line = createLine(u, v);
        line.geometry.vertices[0].y += 0.01;
        line.geometry.vertices[1].y += 0.01;
        line.material.color.setHex(0x000000);
        scene.add(line);
        return line;
    },
    findEdge: function(a, b){
        var nb;
        for(nb of this.known_v[a].neighbors){
            var e = this.known_e[nb];
            if(e.a == b || e.b == b)
                return nb;
        }
        return false;
    },
    removeEdge: function(a, b){
        var ei = this.findEdge(a, b);
        if(ei === false)
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
        for(v of vision.vertices){
            myarr.push({g_v: v, k_v: this.global2knownVertex(v)});
        }
        for(var i=0; i<this.known_e.length; ++i){
            this.known_e[i].line.material.color.setHex(0xA0A0A0);
        }
        for(var i=0; i<vision.edges.length; ++i){
            var a = this.global2knownVertex(vision.edges[i].a);
            var b = this.global2knownVertex(vision.edges[i].b);
            this.addEdge(a, b);
            var ei = this.findEdge(a, b);
            this.known_e[ei].line.material.color.setHex(0x0000FF);
        }
    }
};
robot.mem.init(point_start.vertexidx);
sphere_range.parent = robot;
sphere_range.position.y = -0.6;
/*
 this.c_vertex_i = this.c_vertexidx % 256;
 this.c_vertex_j = Math.floor(this.c_vertexidx / 256);
 this.c_vertex_h = heightMap[this.c_vertex_i][this.c_vertex_j];
 this.c_vertex = geometry.vertices[this.c_vertexidx];



 for (item of geometry.vertices[vertexidx].faces) {
 face = geometry.faces[item];
 if (face.a == vertexidx || face.b == vertexidx || face.c == vertexidx) {
 if (face.a == vertexidx) {
 face.vertexColors[0].setHex(0xD49222);
 }
 if (face.b == vertexidx) {
 face.vertexColors[1].setHex(0xD49222);
 }
 if (face.c == vertexidx) {
 face.vertexColors[2].setHex(0xD49222);
 }
 }
 }
 geometry.colorsNeedUpdate = true;
 */
var vertexidx = sphere_pos.i + sphere_pos.j * 256;
var vertex_vision = computeVertexVision(vertexidx);
//displayEdges(vertex_vision.edges);

/*

 var point_end = {};
 sphere = new THREE.Mesh( new THREE.SphereGeometry(0.1, 32, 32), new THREE.MeshPhongMaterial( {color: 0xff0000} ) );
 sphere_pos = find_positive_pos();
 sphere.position.x = -sphere_pos.position.y;
 sphere.position.y = sphere_pos.position.z;
 sphere.position.z = -sphere_pos.position.x;
 scene.add(sphere);
 point_end.object = sphere;
 */











/////////////BFS
var algorithm_bfs = function (robot) {
    this.queue = [];
    this.robot = robot;


    this.g_vertexidx = -1;
    this.g_vertex = null;
    this.g_vertex_i = -1;
    this.g_vertex_j = -1;
    this.g_vertex_h = -1;

    this.state = 0;
};
algorithm_bfs.prototype = {
    constructor: algorithm_bfs,
    init: function (g_vertexidx) {
        /*
        this.g_vertexidx = g_vertexidx;
        this.g_vertex_i = this.g_vertexidx % 256;
        this.c_vertex_j = Math.floor(this.g_vertexidx / 256);
        this.g_vertex_h = heightMap[this.g_vertex_i][this.g_vertex_j];
        this.g_vertex = geometry.vertices[this.g_vertexidx];
*/
        //this.c_vertexidx = this.robot.vertexidx;
        //this.computeLocation();

        this.visited = new Set();
        this.queue.push(this.c_vertexidx);
        this.state = 1;
    },
    computeLocation: function () {
        this.c_vertex_i = this.c_vertexidx % 256;
        this.c_vertex_j = Math.floor(this.c_vertexidx / 256);
        this.c_vertex_h = heightMap[this.c_vertex_i][this.c_vertex_j];
        this.c_vertex = geometry.vertices[this.c_vertexidx];
    },
    step: function () {
        switch (this.state) {
            case 1:
                if (this.queue.length == 0) {
                    this.state = -1;
                    console.info("BFS: finished (not goal)");
                    return false;
                }
                this.e_vertexidx = this.queue.pop();
                this.visited.add(this.e_vertexidx);
                this.state = 2;
                break;
            case 2:
                this.e_neighbor_iter = geometry.vertices[this.e_vertexidx].neighbors.values();
            case 3:
                var next = this.e_neighbor_iter.next();
                if (next.done) {
                    this.state = 1;
                } else {
                    if (this.checkVision(next.value) && !this.visited.has(next.value)) {
                        this.queue.push(next.value);
                        this.drawEdge(this.e_vertexidx, next.value, 0x0000FF);
                    }
                    this.state = 3;
                }
                break;
            default:
                this.state = -2;
                console.error("BFS: crashed");
                return false;
                break;
        }
    },
    checkVision: function (vidx) {
        return this.c_vertex.distanceTo(geometry.vertices[vidx]) <= vision_range;
    }
};
var algorithms = [new algorithm_bfs(robot)];
function changeAlgorithm(elem) {
    algorithmIndex = elem.selectedIndex;
    algorithm = algorithms[algorithmIndex];
    algorithm.init(point_end.vertexidx);
}
changeAlgorithm({selectedIndex: 0});
function stepAlgorithm(elem) {
    algorithm.step();
}
function majorStepAlgorithm(elem) {

}


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
    if (controls.isPointerLocked) {
        controls.resetControls();
        return '';
    }
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
    requestAnimationFrame(init);
};
