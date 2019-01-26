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
    
        var camera: FreeCamera = new FreeCamera("Camera", new Vector3(0, 30, 0), scene);
        camera.attachControl(this.canvas, true);
    
        var hemisphericLight: HemisphericLight = new HemisphericLight("light2", new BABYLON.Vector3(1, 1, 1), scene);
        hemisphericLight.intensity = 0.6;
        hemisphericLight.specular = Color3.Black();
    
        var directionalLight = new DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
        directionalLight.position = new Vector3(0, 5, 5);
    
        scene = await SceneLoader.AppendAsync('/assets/3d/long_fish/', '12993_Long_Fin_White_Cloud_v1_l3.obj', scene);
        camera.setTarget(scene.meshes[0].position);
        var sea : Sea = new Sea(scene);
        sea.addToRenderList(scene.meshes[0]);
    
        return scene;
    }
}
export const gApp = new App();