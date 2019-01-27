import {
    Engine,
    Scene,
    Mesh,
    HemisphericLight, DirectionalLight,
    Vector3, Color3,
    SceneLoader, Sound, MeshBuilder, FreeCamera, ArcFollowCamera
} from "babylonjs";
import 'babylonjs-loaders';
import { Sea } from './game/sea';
import { PlayerFishBehavior, FlockingFishBehavior, Flock } from './game/fish';
import { SceneActor } from './game/actor';

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
    
        scene = await SceneLoader.AppendAsync('/assets/3d/long_fish/', '12993_Long_Fin_White_Cloud_v1_l3.obj', scene);
        
        var playerFishMesh: Mesh = (<Mesh>scene.meshes[0]);
        playerFishMesh.position.y -= 5;
        playerFishMesh.name = "player_fish";
        
        let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
        ground.position.y -= 5;
        ground.parent = playerFishMesh;

        let playerFish = new PlayerFishBehavior(scene, ground, playerFishMesh);

        let camera: FreeCamera = new FreeCamera("Camera", new Vector3(0,100,0), scene);
        camera.setTarget(playerFishMesh.position);
        camera.parent = playerFishMesh;

        var sea = new Sea(scene);
        this.sceneActors.push(sea);
        sea.addToRenderList(playerFishMesh);
    
        // let flock = new Flock(playerFish);
        // for(let i = 0; i < 10; i++) {
        //     let flockingFish = this.createFlockingFish(flock, i);
        //     sea.addToRenderList(flockingFish.mesh);
        // }

        new Sound("background", "/assets/sound/background.wav", scene, null, {
            loop: true,
            autoplay: true,
            volume: 0.6
        });
    
        return scene;
    }

    private createFlockingFish(flock: Flock, index: number): FlockingFishBehavior {
        let npcFishMesh =  flock.playerFish.mesh.clone('fish_'+index);
            npcFishMesh.position = new Vector3(Math.random(), 0, Math.random()).scale(5);
    
            let flockingFish = new FlockingFishBehavior(npcFishMesh);
            flockingFish.joinFlock(flock);
    
            return flockingFish;
    }
}
export const gApp = new App();