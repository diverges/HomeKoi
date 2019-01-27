import { Engine, Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, Mesh } from "babylonjs";

import { PlayerFishBehavior, FlockingFishBehavior, Flock } from './game/fish';

var canvas: any = document.getElementById("renderCanvas");
var engine: Engine = new Engine(canvas, true);

function createFlockingFish(flock: Flock, index: number): FlockingFishBehavior {
    let npcFishMesh = MeshBuilder.CreateSphere(`sphere_flocking_${index}`, { diameter: 1.0 }, scene);
        npcFishMesh.position = new Vector3(Math.random(), 0, Math.random()).scale(5);

        let flockingFish = new FlockingFishBehavior(npcFishMesh);
        flockingFish.joinFlock(flock);

        return flockingFish;
}

function createScene(): Scene {
    var scene: Scene = new Scene(engine);

    var camera: FreeCamera = new FreeCamera("Camera", new Vector3(0, 100, 0), scene);

    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);

    var playerFishMesh: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1.0 }, scene);
    let playerFish = new PlayerFishBehavior(scene, ground, playerFishMesh);

    let flock = new Flock(playerFish);

    for(let i = 0; i < 10; i++) {
        createFlockingFish(flock, i);
    }

    camera.setTarget(ground.position);
    return scene;
}

var scene: Scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});