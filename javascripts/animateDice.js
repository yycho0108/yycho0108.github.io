function addShadowProperties(light, d, near, far, dark) {
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

function DiceAnimation() {
    // boilerplate setup
    this.scene = new THREE.Scene();

    //this.camera = new THREE.OrthographicCamera(-25, 25, 25, -25, 1, 100);
    //this.camera.position.set(0, 0, -40);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.position.set(5, 0, 3);
    this.camera.lookAt(this.scene.position);

    //this.ctrl = new THREE.OrbitControls(this.camera);
    //this.ctrl.update();

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
    // Floor
    var geom = new THREE.PlaneGeometry(100, 100, 1, 1);
    var txt = new THREE.TextureLoader().load("images/chess.png");
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;
    txt.repeat.set(32, 32);
    var mat = new THREE.MeshPhongMaterial({
        color: 0xCCCCCC,
        map: txt
    });

    var mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Dice
    // setup refraction ...
    this.cubeCamera = new THREE.CubeCamera(0.01, 200, 1024);
    this.scene.add(this.cubeCamera);

    // base geom + material
    var cubeGeo = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
    var cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        opacity: 0.8,
        transparent: true,
        refractionRatio: 1 / 1.5,
        reflectivity: 0.2,
        side: THREE.DoubleSide,
        combine: THREE.MixOperation,
        envMap: this.cubeCamera.renderTarget.texture,
    });

    // fillet
    var mod = new THREE.BufferSubdivisionModifier(2);
    var smooth = mod.modify(cubeGeo);
    var cubeMesh = new THREE.Mesh(smooth, cubeMaterial);
    //cubeMesh.renderDepth = -0.11;

    cubeMesh.position.copy(new THREE.Vector3(0, 0, 0));

    cubeMesh.castShadow = true;

    // markers ...
    var x = new THREE.Vector3(1, 0, 0);
    var y = new THREE.Vector3(0, 1, 0);
    var z = new THREE.Vector3(0, 0, 1);

    var mk_geom = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
    var mk_mat = new THREE.MeshPhongMaterial({
        color: 0xcc4444,
        opacity: 0.9,
        transparent: true,
        side: THREE.DoubleSide,
        combine: THREE.MixOperation,
        refractionRatio: 0.9,
        reflectivity: 0.1,
        envMap: this.cubeCamera.renderTarget.texture,
    });

    var mk_mesh = new THREE.Mesh(mk_geom, mk_mat);
    mk_mesh.castShadow = true;

    var mk_s = [6, 3, 2., 3, 2., 2.];
    var mk_t = [
        [new THREE.Vector3(0, 0, 0)],
        [new THREE.Vector3(-3, 0, -3), new THREE.Vector3(3, 0, 3)],
        [new THREE.Vector3(-4, 0, 4), new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 0, -4)],
        [
            new THREE.Vector3(-3, 0, -3), new THREE.Vector3(3, 0, -3),
            new THREE.Vector3(-3, 0, 3), new THREE.Vector3(3, 0, 3)
        ],
        [
            new THREE.Vector3(-4, 0, -4), new THREE.Vector3(4, 0, -4),
            new THREE.Vector3(-4, 0, 4), new THREE.Vector3(4, 0, 4),
            new THREE.Vector3(0, 0, 0)
        ],
        [
            new THREE.Vector3(-3, 0, -4), new THREE.Vector3(3, 0, -4),
            new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0),
            new THREE.Vector3(-3, 0, 4), new THREE.Vector3(3, 0, 4)
        ]
    ];
    var mk_t_fin = [
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0.5, 0, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0, -0.5, 0),
        new THREE.Vector3(-0.5, 0, 0),
        new THREE.Vector3(0, 0, -0.5),
    ];
    var ax16 = new THREE.Quaternion().setFromUnitVectors(y, z);
    var ax25 = new THREE.Quaternion().setFromUnitVectors(y, x);
    var ax34 = new THREE.Quaternion().setFromUnitVectors(y, y);

    var mk_q = [ax16, ax25, ax34, ax34, ax25, ax16];

    var mks = new THREE.Group();
    for (var i = 0; i < 6; ++i) {
        mk_mesh.scale.set(mk_s[i], mk_s[i], mk_s[i]);
        var mk_grp = new THREE.Group();

        for (var j = 0; j <= i; ++j) {
            var ms = mk_mesh.clone();
            ms.position.copy(mk_t[i][j].multiplyScalar(5 / 6.));
            mk_grp.add(ms);
        }
        mk_grp.quaternion.copy(mk_q[i]);
        mk_grp.scale.set(1 / 12., 1 / 12., 1 / 12.);
        mk_grp.position.copy(mk_t_fin[i]);
        mks.add(mk_grp);
    }

    this.dice = new THREE.Group();
    this.dice.add(cubeMesh);
    this.dice.add(mks);

    this.dice.position.set(0, 0, 0.5);
    this.cubeCamera.position.copy(this.dice.position);

    this.scene.add(this.dice);

    this.t0 = new Date().getTime();
    this.done = true;

    //camera = new THREE.PerspectiveCamera(35,window.innerWidth/window.innerHeight,1,10000);
    //camera = new THREE.OrthographicCamera(-25, 25, 25, -25, 1, 100)
    //camera.position.set(0, 0, -40);
}

DiceAnimation.prototype.initContext = function (container) {
    this.container = container;
    var h = this.container.height();
    var w = this.container.width();
    //renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    //renderer.setClearColor()
    this.renderer.setSize(w, h);

    this.camera.aspect =  w/h;
    this.camera.updateProjectionMatrix();

    $(this.renderer.domElement).css({
        'position': 'absolute',
        'left': '50%',
        'top': '50%',
        'margin-left': function () {
            return -$(this).outerWidth() / 2
        },
        'margin-top': function () {
            return -$(this).outerHeight() / 2
        }
    });

    this.container.get(0).appendChild(this.renderer.domElement);
};

DiceAnimation.prototype.render = function () {

    var now = new Date().getTime();
    var dt = 0.5 * (now - this.t0) / 1000.0; // .5x real time
    this.t0 = now;


    //this.dice.position.add(new THREE.Vector3(0, 0.01, 0.01));
    //this.dice.position.x = 2.5 * Math.sin(th);
    //this.dice.position.y = 2.5 * Math.cos(th);

    //this.camera.position.x = r * Math.cos(th);
    //this.camera.position.y = r * Math.sin(th);

    this.world.step(dt);

    if(!this.done){
        var v_check = (this.c_dice.velocity.length() < 5e-3);
        var w_check = (this.c_dice.angularVelocity.length() < 1e-3);
        var p_check = (Math.abs(this.c_dice.position.z - 0.5) < 1e-3);

        if(v_check && w_check && p_check){
            // indicate done
            this.done = true;
            if(this.cb){
                this.cb();
            }
        }
    }

    this.dice.position.copy(this.c_dice.position);
    this.dice.quaternion.copy(this.c_dice.quaternion);

    var d = this.camera.position.clone().sub(this.dice.position);

    var r = 4.0;
    d.setLength(r);
    d.lerp(new THREE.Vector3(3,0,4).setLength(r), 0.01);
    d.add(this.dice.position);

    this.camera.position.copy(d);
    this.camera.lookAt(this.dice.position);
    //this.ctrl.update();

    this.dice.visible = false;
    this.cubeCamera.position.copy(this.dice.position);
    this.cubeCamera.update(this.renderer, this.scene);
    this.dice.visible = true;

    this.renderer.render(this.scene, this.camera);
    this.renderer.setClearColor(0x000000, 1);
};

DiceAnimation.prototype.animate = function () {
    //console.log("Animate");
    var self = this;
    requestAnimationFrame(function () {
        self.animate();
    });
    this.render();

};

DiceAnimation.prototype.initCannon = function () {
    this.world = new CANNON.World();
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;

    this.world.gravity.set(0, 0, -9.81);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    var mass = 1180.;
    var boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    var boxBody = new CANNON.Body({mass: mass});
    boxBody.addShape(boxShape);
    boxBody.position.set(0, 0, 1.0);
    boxBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(0.5, 0.1, 0.2),
        Math.PI / 4.0
    );
    this.c_dice = boxBody;
    this.world.add(boxBody);

    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({mass: 0});
    groundBody.addShape(groundShape);
    this.world.add(groundBody);
};

DiceAnimation.prototype.throw = function(cb) {
    this.done = false;
    this.cb = cb;

    this.c_dice.position.set(0, 0, 2.0);
    this.c_dice.velocity.set(0, 0, 5.0);

    var s = 32;
    var wx = s * THREE.Math.randFloat(-1, 1);
    var wy = s * THREE.Math.randFloat(-1, 1);
    var wz = s * THREE.Math.randFloat(-1, 1);
    this.c_dice.angularVelocity.set(wx, wy, wz);


    var z = THREE.Math.randFloat(-1, 1);
    var r = Math.sqrt(1 - z * z);
    var t = THREE.Math.randFloat(-Math.PI, Math.PI);
    var v = new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), z);

    var q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        v
    );
    this.c_dice.quaternion.copy(q);
};