import {
    Engine,
    Scene,
    Mesh,
    HemisphericLight, DirectionalLight,
    Vector3, Color3,
    SceneLoader, Sound, MeshBuilder, FreeCamera
} from "babylonjs";
import 'babylonjs-loaders';
import { Sea } from './game/sea';
import { PlayerFishBehavior, Flock } from './game/fish';
import { SceneActor } from './game/actor';
import { CameraFollowBehavior } from './game/camera';

export class App {
    public canvas;
    public engine: Engine;
    public scene: Scene;

    private isLoaded: boolean;
    private sceneActors : SceneActor[];

    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new Engine(this.canvas, true);
        this.sceneActors = [];
        this.isLoaded = false;
        this.createScene().then((scene: Scene): void => {
            this.scene = scene;
            scene.debugLayer.show();
            this.isLoaded = true;
            this.scene.onBeforeRenderObservable.add((scene : Scene) => {
                this.sceneActors.forEach(e => e.update(scene));
            });
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });
    }

    public IsRunning(): boolean {
        return this.isLoaded;
    }

    private async createScene(): Promise<Scene> {
        let scene: Scene = new Scene(this.engine);

        let hemisphericLight: HemisphericLight = new HemisphericLight("light2", new BABYLON.Vector3(1, 1, 1), scene);
        hemisphericLight.intensity = 0.6;
        hemisphericLight.specular = Color3.Black();
        let directionalLight = new DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -5.0), scene);
        directionalLight.position = new Vector3(0, 5, 5);
    
        scene = await SceneLoader.AppendAsync('/assets/3d/fish/', 'fish.glb', scene);
        
        let playerFishMesh = (<Mesh>scene.meshes.filter(mesh => mesh.id == "fish")[0]);

        playerFishMesh.parent = null;
        playerFishMesh.rotate(Vector3.Right(), 90);
        playerFishMesh.name = "player_fish";
        
        let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
        ground.position.y -= 5;
        ground.parent = playerFishMesh;

        let playerFish = new PlayerFishBehavior(scene, ground, playerFishMesh);

        let camera: FreeCamera = new FreeCamera("Camera", new Vector3(0,35,0), scene);
        let followBehavior = new CameraFollowBehavior(camera, playerFishMesh, 35, 0.1);

        let flock = new Flock(playerFish);
        let sea = new Sea(scene, flock);
        this.sceneActors.push(sea);
        this.sceneActors.push(flock);
        sea.addToRenderList(playerFishMesh);

        new Sound("background", "/assets/sound/background.wav", scene, null, {
            loop: true,
            autoplay: true,
            volume: 0.6
        });
    
        return scene;
    }
}
export const gApp = new App();