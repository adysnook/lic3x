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




var renderer	= new THREE.WebGLRenderer({
    antialias	: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position="fixed";
renderer.domElement.id="canvas";


//var onRenderFcts= [];
var scene	= new THREE.Scene();
var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.x = -12;
camera.position.y = 1;
camera.position.z = 0;
camera.lookAt( scene.position );

var controls = new THREE.FirstPersonControls( camera, renderer.domElement );
controls.lookSpeed = 2;
controls.noFly = false;
controls.activeLook = true;
//////////////////////////////////////////////////////////////////////////////////
//		set 3 point lighting						//
//////////////////////////////////////////////////////////////////////////////////

(function () {
    // add a ambient light
    var light	= new THREE.AmbientLight( 0x202020 );
    scene.add( light );
    // add a light in front
    var light	= new THREE.DirectionalLight('white', 5);
    light.position.set(0.5, 0.0, 2);
    scene.add( light );
    // add a light behind
    var light	= new THREE.DirectionalLight('white', 0.75*2);
    light.position.set(-0.5, -0.5, -2);
    scene.add( light );
})();

//////////////////////////////////////////////////////////////////////////////////
//		add an object and make it move					//
//////////////////////////////////////////////////////////////////////////////////
var heightMap	= THREEx.Terrain.allocateHeightMap(256,256);
// var heightMap	= THREEx.Terrain.allocateHeightMap(64,64)
// var heightMap	= THREEx.Terrain.allocateHeightMap(4, 4)
// var heightMap	= THREEx.Terrain.allocateHeightMap(16,256)
//THREEx.Terrain.simplexHeightMap(heightMap)


for(var ii1 = 0; ii1 < heightMap.length; ii1++){
    for(var ii2 = 0; ii2 < heightMap[0].length; ii2++){
        heightMap[ii1][ii2] = 0.3;
    }
}
for(var ii1 = 80; ii1 < 150; ii1++){
    for(var ii2 = 80; ii2 < 150; ii2++){
        heightMap[ii1][ii2] = 0.4;
    }
}
for(var ii1 = 100; ii1 < 200; ii1++){
    for(var ii2 = 100; ii2 < 150; ii2++){
        heightMap[ii1][ii2] = 0.5;
    }
}
for(var ii1 = 130; ii1 < 200; ii1++){
    for(var ii2 = 100; ii2 < 150; ii2++){
        heightMap[ii1][ii2] = 0.8;
    }
}



var geometry	= THREEx.Terrain.heightMapToPlaneGeometry(heightMap);

THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);



var material	= new THREE.MeshPhongMaterial({
    shading		: THREE.FlatShading,
    vertexColors 	: THREE.VertexColors
});
// var material	= new THREE.MeshNormalMaterial({
// 	shading		: THREE.SmoothShading,
// })
var mesh	= new THREE.Mesh( geometry, material );
scene.add( mesh );
mesh.lookAt(new THREE.Vector3(0,1,0));
mesh.scale.y	= 2;
mesh.scale.x	= 2;
mesh.scale.z	= 0.2;
mesh.scale.multiplyScalar(10);

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
    requestAnimationFrame(init);
};
