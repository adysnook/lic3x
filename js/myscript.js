function randomInt(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
}
function randomInterval(min, max){
    return Math.random()*(max-min)+min;
}

var mygraph = new MYGRAPH.Graph();
var myv1 = new MYGRAPH.Vertex("1", new THREE.Vector3(1,1,1), "1");
var myv2 = new MYGRAPH.Vertex("2", new THREE.Vector3(2,3,4), "2");
var myv3 = new MYGRAPH.Vertex("3", new THREE.Vector3(2,3,4), "3");
var myv4 = new MYGRAPH.Vertex("4", new THREE.Vector3(2,3,4), "4");
var myv5 = new MYGRAPH.Vertex("5", new THREE.Vector3(2,3,4), "5");
var mye1 = new MYGRAPH.Arc(myv2, myv3);
var mye2 = new MYGRAPH.Arc(myv3, myv5);
var mye3 = new MYGRAPH.Arc(myv5, myv4);
var mye4 = new MYGRAPH.Arc(myv4, myv3);
var mye5 = new MYGRAPH.Arc(myv4, myv2);
//var myEs = [mye1, mye2];
//var myVs = [myv1, myv2, myv3, myv4];
//mygraph.setArcs(myEs);
//mygraph.setVertices(myVs);
mygraph.addVertex(myv1);
mygraph.addVertex(myv2);
mygraph.addVertex(myv3);
mygraph.addVertex(myv4);
mygraph.addVertex(myv5);
mygraph.addArc(mye1);
mygraph.addArc(mye2);
mygraph.addArc(mye3);
mygraph.addArc(mye4);
mygraph.addArc(mye5);
console.log(mygraph.connectedComponents());


myElem = document.createElement("div");
myElem.style.cssText = "position:fixed; bottom:0px; left:0px; width:100px; height:100px; background-color:black; color: white;";



var renderer	= new THREE.WebGLRenderer({
    antialias	: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position="fixed";
renderer.domElement.id="canvas";


//var onRenderFcts= [];
var scene	= new THREE.Scene();
var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.0001, 1000);
camera.position.x = -12;
camera.position.y = 1;
camera.position.z = 0;
camera.lookAt( scene.position );

var controls = new THREE.FirstPersonControls( camera, renderer.domElement );
controls.lookSpeed = 2;
controls.noFly = false;
controls.activeLook = true;
controls.movementSpeed = 10;
//////////////////////////////////////////////////////////////////////////////////
//		set 3 point lighting						//
//////////////////////////////////////////////////////////////////////////////////

(function () {
    // add a ambient light
    var light	= new THREE.AmbientLight( 0x404040 );
    scene.add( light );
    // add a light in front
    var light	= new THREE.DirectionalLight('white', 0.7);
    light.position.set(10, 40, 10);
    scene.add( light );
    // add a light behind
    var light	= new THREE.DirectionalLight('white', 0.7);
    light.position.set(-10, 40, -10);
    scene.add( light );
})();

//////////////////////////////////////////////////////////////////////////////////
//		add an object and make it move					//
//////////////////////////////////////////////////////////////////////////////////

var heightMap	= THREEx.Terrain.allocateHeightMap(256,256);
// var heightMap	= THREEx.Terrain.allocateHeightMap(64,64)
// var heightMap	= THREEx.Terrain.allocateHeightMap(4, 4)
// var heightMap	= THREEx.Terrain.allocateHeightMap(16,256)
THREEx.Terrain.simplexHeightMap(heightMap)
/*

for(var ii1 = 0; ii1 < heightMap.length; ii1++){
    for(var ii2 = 0; ii2 < heightMap[0].length; ii2++){
        heightMap[ii1][ii2] = 0.0;
    }
}
for(var ii1 = 80; ii1 < 150; ii1++){
    for(var ii2 = 80; ii2 < 150; ii2++){
        heightMap[ii1][ii2] = 0.4+ii1/1500+3*ii2/1500;
    }
}
for(var ii1 = 100; ii1 < 200; ii1++){
    for(var ii2 = 100; ii2 < 150; ii2++){
        heightMap[ii1][ii2] = 0.5;
    }
}
for(var ii1 = 130; ii1 < 200; ii1++){
    for(var ii2 = 100; ii2 < 150; ii2++){
        heightMap[ii1][ii2] = 1.0;
    }
}


*/
var geometry	= THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);
/*
var width	= heightMap.length;
var depth	= heightMap[0].length;
// loop on each vertex of the geometry

for(var x = 0; x < width; x++){
	for(var z = 0; z < depth; z++){
		// get the height from heightMap
		//var height	= heightMap[x][z];
		// set the vertex.z to a normalized height
		var vertex	= geometry.vertices[x + z * width];
        //vertex.y *= 10;
        //vertex.x *= 10;
		//vertex.z	= (height-0.5)*2
	}
}
// notify the geometry need to update vertices
geometry.verticesNeedUpdate	= true;
// notify the geometry need to update normals
geometry.computeFaceNormals();
geometry.computeVertexNormals();
geometry.normalsNeedUpdate	= true;
*/
/*
var geometry = new THREE.Geometry();
//geometry.vertices.push( new THREE.Vector3( 1, 1, 0 ) );
var ix = 0;
var iz = 0;
var gridX = 1;
var gridX1 = 2;
var gridZ = 1;
var normal = new THREE.Vector3( 0, 0, 1 );
var a = ix + gridX1 * iz;
var b = ix + gridX1 * ( iz + 1 );
var c = ( ix + 1 ) + gridX1 * ( iz + 1 );
var d = ( ix + 1 ) + gridX1 * iz;
var uva = new THREE.Vector2( ix / gridX, 1 - iz / gridZ );
var uvb = new THREE.Vector2( ix / gridX, 1 - ( iz + 1 ) / gridZ );
var uvc = new THREE.Vector2( ( ix + 1 ) / gridX, 1 - ( iz + 1 ) / gridZ );
var uvd = new THREE.Vector2( ( ix + 1 ) / gridX, 1 - iz / gridZ );
var face = new THREE.Face3( a, b, d );
face.normal.copy( normal );
face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
geometry.faces.push( face );
geometry.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );
face = new THREE.Face3( b, c, d );
face.normal.copy( normal );
face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
geometry.faces.push( face );
geometry.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );
*/
//////////////////////////////////////////////////////

var material	= new THREE.MeshLambertMaterial({
    shading		: THREE.FlatShading,
    vertexColors 	: THREE.VertexColors
});
// var material	= new THREE.MeshNormalMaterial({
// 	shading		: THREE.SmoothShading,
// })
var mesh	= new THREE.Mesh( geometry, material );
scene.add( mesh );
mesh.lookAt(new THREE.Vector3(0,1,0));
/*
mesh.scale.y	= 2;
mesh.scale.x	= 2;
mesh.scale.z	= 0.2;
mesh.scale.multiplyScalar(10);
*/
var start_vertex;
function generate_position(){
    var start_x = randomInt(1, 254);
    var start_z = randomInt(1, 254);
    start_vertex = start_x + start_z*256;
    return geometry.vertices[start_vertex].clone();
}
function find_positive_pos(){
    do{
        var pos = generate_position();
    }while(pos.z<0);
    return pos;
}
var sphere_geom = new THREE.SphereGeometry(0.1, 32, 32);
var sphere_mat  = new THREE.MeshPhongMaterial( {color: 0xffff00} );
var sphere = new THREE.Mesh( sphere_geom, sphere_mat );
var sphere_pos = find_positive_pos();
sphere.position.x = -sphere_pos.y;
sphere.position.y = sphere_pos.z;
sphere.position.z = -sphere_pos.x;
camera.position = sphere.position.clone();
camera.position.x -= 3;
camera.position.y += 1;
//camera.lookAt(sphere.position.clone());
scene.add(sphere);

/*
onRenderFcts.push(function(delta, now){
    //mesh.rotation.z += 0.2 * delta;
    // mesh.rotation.y += 2 * delta;
});
*/

//////////////////////////////////////////////////////////////////////////////////
//		Camera Controls							//
//////////////////////////////////////////////////////////////////////////////////
/*
var mouse	= {x : 0, y : 0};
document.addEventListener('mousemove', function(event){
    mouse.x	= (event.clientX / window.innerWidth ) - 0.5;
    mouse.y	= (event.clientY / window.innerHeight) - 0.5;
}, false);
onRenderFcts.push(function(delta, now){

    //camera.position.x += (mouse.x*30 - camera.position.x) * (delta*3)
    //camera.position.y += (mouse.y*10 - (camera.position.y-2)) * (delta*3)
    //camera.position.y += 10;
});
*/


//////////////////////////////////////////////////////////////////////////////////
//		render the scene						//
//////////////////////////////////////////////////////////////////////////////////
/*
onRenderFcts.push(function(){

});
*/
//


//////////////////////////////////////////////////////////////////////////////////
//		loop runner							//
//////////////////////////////////////////////////////////////////////////////////

var stats = new MYSTATS.Stats();
var lastTimeMsec = performance.now();
var lastFrameDuration = null;
function init(nowMsec){
    requestAnimationFrame(animate);
}
function animate(nowMsec){
    var frameDuration = nowMsec - lastTimeMsec;
    if(lastFrameDuration){
        frameDuration *= 0.9;
        frameDuration += lastFrameDuration*0.1;
    }
    var fd = frameDuration/1000;
    stats.update(fd, !controls.hideAll);
    controls.update(fd);
    renderer.render(scene, camera);
	myElem.innerHTML = "x: "+Math.round(camera.position.x*100)/100+"<br>y: "+Math.round(camera.position.y*100)/100+"<br>z: "+Math.round(camera.position.z*100)/100;
    lastTimeMsec = nowMsec;
    requestAnimationFrame(animate);
}

window.onbeforeunload = function(e) {
    if(controls.isPointerLocked) {
        controls.resetControls();
        return '';
    }
};
window.onresize = function(event){
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};
window.onload = function(e){
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(stats.domElement);
	document.body.appendChild(myElem);
    requestAnimationFrame(init);
};
