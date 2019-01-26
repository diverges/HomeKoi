import {
    Engine,
    Scene,
    FreeCamera,
    HemisphericLight, DirectionalLight,
    Vector3, Color3,
    SceneLoader
} from "babylonjs";
import 'babylonjs-loaders';
import { Sea } from './sea';

var canvas: any = document.getElementById("renderCanvas");
var engine: Engine = new Engine(canvas, true);

function createScene(): Scene {
    var scene: Scene = new Scene(engine);

    var camera: FreeCamera = new FreeCamera("Camera", new Vector3(0, 20, 0), scene);
    camera.attachControl(canvas, true);

    var light: HemisphericLight = new HemisphericLight("light2", new BABYLON.Vector3(1, 1, 1), scene);
	light.intensity = 0.6;
	light.specular = Color3.Black();

    var light2 = new DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    light2.position = new Vector3(0, 5, 5);

    //var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1.0 }, scene);
    SceneLoader.Append('/assets/3d/long_fish/', '12993_Long_Fin_White_Cloud_v1_l3.obj', scene, function (ctx:Scene) {
        console.log(ctx);
        camera.setTarget(ctx.meshes[0].position);
        var sea : Sea = new Sea(scene);
        sea.addToRenderList(ctx.meshes[0]);
    });
    return scene;
}

var scene: Scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});