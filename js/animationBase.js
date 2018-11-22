var AnimationBase = function (opts) {
    this._opts = {
        shadow : false,
        transparent : false,
        center : true,
        ctrl : true,
        rsz : true
    };
    Object.assign(this._opts, opts);

    this.scene = new THREE.Scene();
    // create default camera ...
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.position.set(5, 0, 3);
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);

};

AnimationBase.prototype.initContext = function (container) {
    var opts = this._opts;

    this.container = container;
    var h = this.container.height();
    var w = this.container.width();

    // camera
    //renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

    if(opts.shadow){
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    }

    if(opts.transparent){
        this.renderer.setClearColor(0xFFFFFF, 0);
    }

    // fill container ...
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    if(opts.center){
        $(this.renderer.domElement).css({
            'position': 'relative',
            'left': '50%',
            'top': '50%',
            'margin-left': function () {
                return -$(this).outerWidth() / 2
            },
            'margin-top': function () {
                return -$(this).outerHeight() / 2
            }
        });
    }

    this.container.get(0).appendChild(this.renderer.domElement);

    if(opts.ctrl){
        this.ctrl = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.ctrl.update();
    }

    if(opts.rsz){
        $(this.renderer.domElement).resize(function(){
            var h = this.height();
            var w = this.width();
            self.camera.aspect = w / h;
            self.camera.updateProjectionMatrix();
            self.renderer.setSize(w, h);
        });
    }
};

AnimationBase.prototype.render = function(){
    if(this._opts.ctrl){
        this.ctrl.update();
    }
    this.renderer.render(this.scene, this.camera);
};

AnimationBase.prototype.animate = function () {
    var self = this;
    requestAnimationFrame(function () {
        self.animate();
    });
    this.render();
};