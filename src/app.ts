import {
    Engine,
    Scene,
    FreeCamera,
    HemisphericLight, DirectionalLight,
    Vector3, Color3,
    SceneLoader, Sound, AbstractMesh, InstancedMesh
} from "babylonjs";
import 'babylonjs-loaders';
import { Sea } from './sea';

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
        var fishMesh: any = scene.meshes[0];
        fishMesh.rotate(new Vector3(1,0,0), -Math.PI / 2);
        fishMesh.position.y -= 0.5

        var camera: FreeCamera = new FreeCamera("Camera", new Vector3(0, 20, 0), scene);
        camera.attachControl(this.canvas, true);
        camera.setTarget(fishMesh.position);
        var sea = new Sea(scene);
        sea.addToRenderList(fishMesh);

        new Sound("background", "/assets/sound/background.wav", scene, null, {
            loop: true,
            autoplay: true,
            volume: 0.6
        });
    
        return scene;
    }
}
export const gApp = new App();