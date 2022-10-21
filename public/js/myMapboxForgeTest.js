class MyMapboxForgeExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
    }
    quad(x,y) {
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 256, 256 ),
            new THREE.MeshLambertMaterial({ color:0xa0a0a0, depthWrite:false, 
                map: (THREE.ImageUtils.loadTexture(`https://api.mapbox.com/v4/mapbox.satellite/16/${59157+x}/${40217-y}.webp?sku=101gdtmdKGvJF&access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA`)) })
        );
        mesh.position.set (x*256,y*256, 1);
        return mesh;
    }

    load() {
        this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, ()=>{
            if (!this.viewer.overlays.hasScene('map')) {
                this.viewer.overlays.addScene('map');
            }
            const tiles = new THREE.Object3D();
            tiles.position.set(-1140,-800, -10);
            tiles.scale.set(2,2,1);
            const tilex = [-1,0,1,2,3];
            const tiley = [0,1,2];
            tilex.map( x => {
                tiley.map( y => {
                    tiles.add(this.quad(x,y));
            })});
            window.tiles=tiles;
            this.viewer.overlays.addMesh(tiles, 'map');
        });
        return true;
    }
    unload() {
        return true;
    }
}
Autodesk.Viewing.theExtensionManager.registerExtension('MyMapboxForgeExtension', MyMapboxForgeExtension);