function addShadowProperties(light, d, near, far, dark){
    d = d || 20;
    near = near || d * 0.5;
    far = far || d * 3;
    dark = dark || 0.75;

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = near;    // default
    light.shadow.camera.far = far;     // default

    light.shadow.darkness = dark;
}

function DiceAnimation(){
    // boilerplate setup
    this.scene = new THREE.Scene();
    //this.camera = new THREE.OrthographicCamera(-25, 25, 25, -25, 1, 100);
    //this.camera.position.set(0, 0, -40);

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 50 );
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.position.set(5, 0, 3);
    this.camera.lookAt(this.scene.position);
    //this.camera.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
    this.scene.add(this.camera);

    // lights

    var dLight = new THREE.DirectionalLight(0xFFFFFF, 0.75, 100);
    dLight.position.set(-2.5, 5, 10);
    addShadowProperties(dLight, 20, 0.5, 500, 0.5);
    this.scene.add(dLight);

    var aLight = new THREE.AmbientLight(0x666666);
    this.scene.add(aLight);

    var pLight = new THREE.PointLight(0x0088FF, 0.75, 20);
    pLight.position.set(4, 4, 4.0);
    addShadowProperties(pLight, 8, 0.5, 500, 0.1);
    this.scene.add(pLight);
    //var helper = new THREE.CameraHelper( pLight.shadow.camera );
    //this.scene.add( helper );

    var fog = new THREE.FogExp2(0x220044, 0.05);
    this.scene.background = new THREE.Color(0x220044);
    this.scene.fog = fog;

    // objects

    //floor
    var geom = new THREE.PlaneGeometry(100, 100, 1, 1);
    var txt = new THREE.TextureLoader().load("images/chess.png");
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;
    txt.repeat.set(64,64);
    var mat = new THREE.MeshPhongMaterial({
        color:0xCCCCCC,
        map:txt
    });

    var mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    //mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
    this.scene.add(mesh);

    this.cubeCamera = new THREE.CubeCamera(0.01, 200, 1024);
    this.scene.add(this.cubeCamera);

    //var cubeGeo = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
    var cubeGeo = new THREE.BoxGeometry(1, 1, 1, 4,4,4);
    var cubeMaterial = new THREE.MeshPhongMaterial( {
        color: 0xFFFFFF,
        opacity: 0.8,
        transparent: true,
        refractionRatio: 1/1.5,
        reflectivity : 0.2,
        side : THREE.DoubleSide,
        combine: THREE.MixOperation,
        envMap : this.cubeCamera.renderTarget.texture,
    });


    var mod = new THREE.BufferSubdivisionModifier(2);
    var smooth = mod.modify(cubeGeo);
    var cubeMesh = new THREE.Mesh(smooth, cubeMaterial);
    //cubeMesh.renderDepth = -0.11;

    cubeMesh.position.copy(new THREE.Vector3(0,0,0));
    cubeMesh.castShadow = true;

    var mk1 = new THREE.CylinderGeometry(0.25, 0.25, 0.01, 32);
    var mkMat = new THREE.MeshPhongMaterial({
        color:0xcc4444,
        opacity:0.9,
        transparent:true,
        //side : THREE.DoubleSide,
        combine: THREE.MixOperation,
        refractionRatio : 0.9,
        reflectivity : 0.1,
        envMap : this.cubeCamera.renderTarget.texture,
    });

    var mkMesh = new THREE.Mesh(mk1, mkMat);
    mkMesh.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
    mkMesh.position.copy(new THREE.Vector3(0, 0, 0.5));

    this.dice = new THREE.Group();
    this.dice.add(cubeMesh);
    this.dice.add(mkMesh);


    this.dice.position.set(0, 0, 0.5);
    this.cubeCamera.position.copy(this.dice.position);

    this.scene.add(this.dice);

    //camera = new THREE.PerspectiveCamera(35,window.innerWidth/window.innerHeight,1,10000);
    //camera = new THREE.OrthographicCamera(-25, 25, 25, -25, 1, 100)
    //camera.position.set(0, 0, -40);
}

DiceAnimation.prototype.initContext = function(container){
    this.container = container;
    var h = this.container.height();
    var w = this.container.width();
    //renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    //renderer.setClearColor()
    this.renderer.setSize(0.9*w, 0.9*h);

    this.camera.aspect = (0.9*w) / (0.9*h);
    this.camera.updateProjectionMatrix();

    $(this.renderer.domElement).css({
        'position' : 'absolute',
        'left' : '50%',
        'top' : '50%',
        'margin-left' : function() {return -$(this).outerWidth()/2},
        'margin-top' : function() {return -$(this).outerHeight()/2}
    });

    this.container.get(0).appendChild(this.renderer.domElement);
};

var r = 5;
var th = 0;

DiceAnimation.prototype.render = function(){

    //this.dice.position.add(new THREE.Vector3(0, 0.01, 0.01));
    this.dice.position.x = 2.5 * Math.sin(th);
    this.dice.position.y = 2.5 * Math.cos(th);

    this.camera.position.x = r * Math.cos(th);
    this.camera.position.y = r * Math.sin(th);
    th = (th + 0.01) % (2 * Math.PI);
    this.camera.lookAt(this.dice.position);

    this.dice.visible = false;
    this.cubeCamera.position.copy(this.dice.position);
    this.cubeCamera.update(this.renderer, this.scene);
    this.dice.visible = true;

    this.renderer.render(this.scene, this.camera);
    this.renderer.setClearColor(0x000000, 1);
};

DiceAnimation.prototype.animate = function(){
    //console.log("Animate");
    var self = this;
    requestAnimationFrame(function(){self.animate();});
    this.render();
};