/**
 * Created by jamiecho on 12/30/15.
 */
var scene, camera,renderer,mesh;
function initContext(){
    var container = $("#profile").get(0);
    //camera = new THREE.PerspectiveCamera(35,window.innerWidth/window.innerHeight,1,10000);
    camera = new THREE.OrthographicCamera(-25,25,25,-25,1,100)
    camera.position.set(0,0,-40);
    scene = new THREE.Scene();

    var l = new THREE.STLLoader();
    l.load('objects/ShadowCube_CHO_2.STL',function(g){
        var m = new THREE.MeshLambertMaterial({color: 0xAA5522});
        mesh = new THREE.Mesh(g,m);

        scene.add(mesh);
    });

    var dLight = new THREE.DirectionalLight(0x88FF88,0.8);
    dLight.position.set(0,20,-70);
    scene.add(dLight);

    var aLight = new THREE.AmbientLight(0x222222);
    scene.add(aLight);

    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    //renderer.setClearColor()
    renderer.setSize(100,100);
    container.appendChild(renderer.domElement);
    //resize event
}
function animate(){
    requestAnimationFrame(animate);
    render();
}
var begin = Date.now();
function lerp(a,b,c){
    return a*(1-c)+b*c;
}
function colLerp(a,b,c){
    var aR = a & 0xFF0000;
    var aG = a & 0x00FF00;
    var aB = a & 0x0000FF;

    var bR = b & 0xFF0000;
    var bG = b & 0x00FF00;
    var bB = b & 0x0000FF;

    var R = lerp(aR,bR,c) & 0xFF0000;
    var G = lerp(aG,bG,c) & 0x00FF00;
    var B = lerp(aB,bB,c) & 0x0000FF;
    return R+G+B;
}
function getLerp(){
    var state= ((Date.now() - begin) % 6e3)/6e3;
    var C = new THREE.Vector3(0,Math.PI/2,Math.PI/2);
    var H = new THREE.Vector3(Math.PI/2,Math.PI,Math.PI/2);
    var O = new THREE.Vector3(0,Math.PI,Math.PI/2);
    var cCol = 0xAA5522;
    var hCol = 0x8811CC;
    var oCol = 0xC2BB58;

    if(state < 1/9){
        return [C, cCol];
    }else if(state<3/9){
        state -= 1/9;
        return [C.lerp(H,state*9/2), colLerp(cCol,hCol,state*9/2)];
    }else if(state<4/9){
        return [H, hCol];
    }else if(state<6/9){
        state -= 4/9;
        return [H.lerp(O,state*9/2), colLerp(hCol,oCol,state*9/2)];
    }else if(state<7/9){
        return [O,oCol];
    }else{
        state -= 7/9;
        return [O.lerp(C,state*9/2),colLerp(oCol,cCol,state*9/2)];
    }
    // 0.0 ~ 0.1 = C
    // 0.1 ~ 0.3 = C-H
    // 0.3 ~ 0.4 = H
    // 0.4 ~ 0.6 = H-O
    // 0.6 ~ 0.7 = O
    // 0.7 ~ 0.9 = O-C
}
function render(){

    mesh.position.set(0,0,0);
    mesh.rotation.set(0,0,0);

    var r=80;
    var l = getLerp();
    mesh.material.color.setHex(l[1]);
    mesh.rotateX(l[0].x);
    mesh.rotateY(l[0].y);
    mesh.rotateZ(l[0].z);
    mesh.translateX(-20);
    mesh.translateY(-20);
    mesh.translateZ(-20);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    renderer.setClearColor(0x000000, 1);}
