import { Engine, Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, Mesh } from "babylonjs";

import PlayerFish from './game/fish';

var canvas: any = document.getElementById("renderCanvas");
var engine: Engine = new Engine(canvas, true);

function createScene(): Scene {
    var scene: Scene = new Scene(engine);

    var camera: FreeCamera = new FreeCamera("Camera", new Vector3(0, 10, 0), scene);

    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1.0 }, scene);

    let fish = new PlayerFish(scene, ground, sphere);

    camera.setTarget(ground.position);
    return scene;
}

var scene: Scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});