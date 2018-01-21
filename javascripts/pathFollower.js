function normalizeMesh(mesh){
    var box = new THREE.Box3().setFromObject(mesh);
    var size = box.getSize();
    var s = 1.0 / Math.min(size.x, size.y, size.z);
    mesh.scale.set(s, s, s); //shortest dimension will be 1

    // reposition to touch ground ...
    box.setFromObject(mesh);
    mesh.position.sub(new THREE.Vector3(0, 0, box.min.z));
    //guess-and-check for here
}
function modifyMaterial(obj, opts){
    var n = obj.children.length;
    var mat;

    //modify ...
    if(obj.type === "Mesh"){
        if(obj.material.length !== undefined){

            var m = obj.material.length;
            for(var j=0; j<m; ++j){
                mat = new THREE.MeshToonMaterial();
                mat.copy(obj.material[j]);
                Object.assign(mat, opts);
                obj.material[j] = mat;


            }
        }else{
            mat = new THREE.MeshToonMaterial();
            mat.copy(obj.material);
            Object.assign(mat, opts);
            obj.material = mat;
            // Object.assign(object.material, opts);
        }
    }

    // recurse
    for(var i=0; i<n; ++i){
        modifyMaterial(obj.children[i], opts);
    }
}

function PathFollower(obj, r0, rs) {
    r0 = r0 || 4;
    rs = rs || 2;

    var self = this;
    this.i = 0; //current interpolation
    [this.x, this.q] = this.createPath(480, 20, r0, rs, 8);
    this.n = this.x.length;
    this.car = null;

    this.createScene();

    var loader = new THREE.ColladaLoader();
    loader.load(obj, function (collada) {
        //var animations = collada.animations;

        //var avatar = collada.scene;
        //modifyMaterial(avatar, {flatShading : true});

        var g = new THREE.CylinderGeometry(4,4,4,16);
        var m = new THREE.MeshToonMaterial({
            color: 0xAA5522,
            vertexColors: THREE.FaceColors,
            flatShading: true
        });
        var avatar = new THREE.Mesh(g,m);


        var x = new THREE.Vector3(1,0,0);
        var y = new THREE.Vector3(0,1,0);
        var z = new THREE.Vector3(0,0,1);
        avatar.quaternion.setFromUnitVectors(z,y);

        var a2 = new THREE.Group();
        a2.add(avatar);

        normalizeMesh(a2);
        var car = new THREE.Group();
        car.add(a2);

        self.car = car;
        //self.mixer = new THREE.AnimationMixer( avatar );
        //var action = self.mixer.clipAction( animations[ 0 ] ).play();
        self.scene.add(car);
    });
}

PathFollower.prototype.createScene = function () {
    // boilerplate setup
    this.scene = new THREE.Scene();

    //this.camera = new THREE.OrthographicCamera(-25, 25, 25, -25, 1, 100);
    //this.camera.position.set(0, 0, -40);

    // fov - aspect - near - far.

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.position.set(0, 0, 40);
    this.camera.lookAt(this.scene.position);

    this.scene.add(this.camera);

    // lights
    var dLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    dLight.position.set(-2.5, 5, 20);
    //addShadowProperties(dLight, 20, 0.5, 500, 0.5);
    this.scene.add(dLight);

    var aLight = new THREE.AmbientLight(0x666666);
    this.scene.add(aLight);

    var pLight = new THREE.PointLight(0x0088FF, 0.75, 20);
    pLight.position.set(4, 4, 4.0);
    addShadowProperties(pLight, 8, 0.5, 500, 0.1);
    this.scene.add(pLight);

    // floor
    // TODO : shadow-only??
    var geom = new THREE.PlaneGeometry(100, 100, 1, 1);
    var mat = new THREE.MeshBasicMaterial({
        color: 0xCCCCCC,
        transparent : true,
        opacity : 0.5
    });
    var mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    //this.scene.add(mesh);

    //var helper = new THREE.CameraHelper( pLight.shadow.camera );
    //this.scene.add( helper );

    // var fog = new THREE.FogExp2(0x220044, 0.05);
    // this.scene.background = new THREE.Color(0x220044);
    // this.scene.fog = fog;

    // car test prototype
    /*
    var g = new THREE.BoxGeometry(2,1,1, 4,4,4);
    var m = new THREE.MeshToonMaterial({
        color: 0xAA5522,
        vertexColors: THREE.FaceColors,
        flatShading: true
    });


    this.car = new THREE.Mesh(g, m);
    this.scene.add(this.car);
    this.car.position.copy(this.x[0]);
    this.car.quaternion.copy(this.q[0]);
    */
};

PathFollower.prototype.createPath = function (n, m, r0, rs, fmx) {
    // n = path resolution
    // m = path complexity
    // r0 = minimum radius
    // rs = path amplitude
    // fmx = max frequency

    n = n || 120;
    m = m || 10;
    r0 = r0 || 0.5;
    rs = rs || 0.4;
    fmx = fmx || 10;

    var i, j, p;

    var r = [], dr = [];
    // pre-process
    for (i = 0; i < n; ++i) {
        r[i] = 0.0;
        dr[i] = 0.0;
    }

    // process
    var a, o, f;
    for (j = 0; j < m; ++j) {
        a = Math.random();
        o = 2 * Math.PI * Math.random();
        f = 1 + Math.floor(fmx * Math.random());

        for (i = 0; i < n; ++i) {
            p = i * 2 * Math.PI / n;
            r[i] += a * Math.cos(p * f + o);
            dr[i] += -a * f * Math.sin(p * f + o);
        }
    }

    // post-process
    var rmn, rmx;
    [rmn, rmx] = r.reduce(function (a, b) {
        return [Math.min(a[0], b), Math.max(a[1], b)];
    }, [2 * m, -2 * m]);

    for (i = 0; i < n; ++i) {
        dr[i] = (rs / (rmx - rmn)) * dr[i];
        r[i] = r0 + rs * (r[i] - rmn) / (rmx - rmn);
    }

    var dy, dx;
    var x = []; // position
    var q = []; // orientations (quaternion)
    var zax = new THREE.Vector3(0, 0, 1);

    for (i = 0; i < n; ++i) {
        p = i * 2 * Math.PI / n; // parametrization
        x[i] = new THREE.Vector3(r[i] * Math.cos(p), r[i] * Math.sin(p), 0);

        // orientation
        dx = -r[i] * Math.sin(p) + dr[i] * Math.cos(p);
        dy = r[i] * Math.cos(p) + dr[i] * Math.sin(p);
        a = Math.atan2(dy, dx);
        q[i] = new THREE.Quaternion().setFromAxisAngle(zax, a);
    }

    return [x, q];
};

PathFollower.prototype.initContext = function (container) {
    this.container = container;
    var h = this.container.height();
    var w = this.container.width();

    //renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    //renderer.setClearColor()
    this.renderer.setSize(w, h);

    this.camera.aspect = w / h;
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

    this.ctrl = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.ctrl.update();

};

PathFollower.prototype.render = function () {
    this.ctrl.update();

    var i = this.i;
    if (this.car) {
        this.car.position.copy(this.x[i]);
        this.car.quaternion.copy(this.q[i]);
        this.i = (this.i + 1) % this.n;
    }

    this.renderer.render(this.scene, this.camera);
    this.renderer.setClearColor(0x000000, 0);
};

PathFollower.prototype.animate = function () {
    var self = this;
    requestAnimationFrame(function () {
        self.animate();
    });
    this.render();
};