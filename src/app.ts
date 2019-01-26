import {
    Engine,
    Scene,
    FreeCamera,
    HemisphericLight,
    Vector3,
    SceneLoader,
    MeshBuilder,
    Mesh
} from "babylonjs";
import 'babylonjs-loaders';

var canvas: any = document.getElementById("renderCanvas");
var engine: Engine = new Engine(canvas, true);

function createScene(): Scene {
    var scene: Scene = new Scene(engine);

    var camera: FreeCamera = new FreeCamera("Camera", new Vector3(0, 0,-10), scene);
    camera.attachControl(canvas, true);

    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    //var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1.0 }, scene);
    SceneLoader.Append('/assets/3d/long_fish/', '12993_Long_Fin_White_Cloud_v1_l3.obj', scene, function (newMeshes) {});
    return scene;
}

var scene: Scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});