import {
    Engine,
    Scene,
    Camera,
    HemisphericLight, DirectionalLight,
    Vector3, Color3,
    SceneLoader, Sound, MeshBuilder, AbstractMesh, FollowCamera, TargetCamera, ArcFollowCamera
} from "babylonjs";
import 'babylonjs-loaders';
import { Sea } from './sea';
import { PlayerFishBehavior, FlockingFishBehavior, Flock } from './game/fish';

export class App {
    public canvas;
    public engine: Engine;
    public scene: Scene;
    private isLoaded: boolean;

    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new Engine(this.canvas, true);
        this.isLoaded = false;
        this.createScene().then((scene: Scene): void => {
            this.scene = scene;
            this.isLoaded = true;
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });
    }

    public IsRunning(): boolean {
        return this.isLoaded;
    }

    private async createScene(): Promise<Scene> {
        var scene: Scene = new Scene(this.engine);
    
        var hemisphericLight: HemisphericLight = new HemisphericLight("light2", new BABYLON.Vector3(1, 1, 1), scene);
        hemisphericLight.intensity = 0.6;
        hemisphericLight.specular = Color3.Black();
        var directionalLight = new DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -5.0), scene);
        directionalLight.position = new Vector3(0, 5, 5);
    
        scene = await SceneLoader.AppendAsync('/assets/3d/long_fish/', '12993_Long_Fin_White_Cloud_v1_l3.obj', scene);
        
        var playerFishMesh: any = scene.meshes[0];
        let ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
        let playerFish = new PlayerFishBehavior(scene, ground, playerFishMesh);

        var camera: ArcFollowCamera = new ArcFollowCamera("Camera", 0, 90, 50, playerFishMesh, scene);
        camera.position = new Vector3(0,50,0);

        var sea = new Sea(scene);
        sea.addToRenderList(playerFishMesh);
    
        let flock = new Flock(playerFish);
        for(let i = 0; i < 10; i++) {
            let flockingFish = this.createFlockingFish(flock, i);
            sea.addToRenderList(flockingFish.mesh);
        }

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