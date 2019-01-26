import { Engine, Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, Mesh } from "babylonjs";

var canvas: any = document.getElementById("renderCanvas");
var lastMouseEvent : MouseEvent;
canvas.addEventListener('click', function(event: MouseEvent) { 
    console.log(event);
    lastMouseEvent = event;
}, false);

var engine: Engine = new Engine(canvas, true);

function createScene(): Scene {
    var scene: Scene = new Scene(engine);

    var camera: FreeCamera = new FreeCamera("Camera", new Vector3(0, 0,-10), scene);
    //camera.attachControl(canvas, true);

    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);


    return scene;
}

var scene: Scene = createScene();
var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 0.25 }, scene);

engine.runRenderLoop(() => {
    scene.render();
    if(lastMouseEvent === undefined)
        return;
    console.log(sphere);
    sphere.position.x = lastMouseEvent.x;
    sphere.position.y = lastMouseEvent.y;
});