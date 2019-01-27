import {
    Scene,
    Color3,
    Mesh, 
    Texture,
    Vector2, Vector3,
    CubeTexture,
    AbstractMesh
} from "babylonjs";
import { StandardMaterial, WaterMaterial } from 'babylonjs-materials';
import { PlayerFishBehavior } from "./fish";
import { SceneActor } from './actor'; 

const MAX_WILD_FISH  = 20;
const MAX_SPAWN_RADIUS = 200;
const DESPAWN_RADIUS = 300;

export class Sea implements SceneActor {

    private skybox: Mesh;
    private skyboxMaterial: StandardMaterial;
    private waterMesh : Mesh;
    private water: WaterMaterial;

    private uid: number;
    private wildFish: AbstractMesh[];

    constructor(scene: Scene)
    {
        this.uid = 0;
        this.wildFish = [];

        this.skybox = Mesh.CreateBox("skyBox", 5000.0, scene);
        this.skyboxMaterial = new StandardMaterial("skyBox", scene);
        this.skyboxMaterial.backFaceCulling = false;
        this.skyboxMaterial.reflectionTexture = new CubeTexture("assets/textures/skybox/", scene);
        this.skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        this.skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        this.skyboxMaterial.specularColor = new Color3(0, 0, 0);
        this.skyboxMaterial.disableLighting = true;
        this.skybox.material = this.skyboxMaterial;
    
        this.waterMesh = Mesh.CreateGround("waterMesh", 524, 524, 16, scene);
        this.water = new WaterMaterial("water", scene);
        this.water.backFaceCulling = true;
        this.water.bumpTexture = new Texture("assets/textures/waterbump.png", scene);
        this.water.windForce = -5;
        this.water.waveHeight = 0.2;
        this.water.bumpHeight = 0.02;
        this.water.windDirection = new Vector2(1, 1);
        this.water.waterColor = new Color3(0, 0, 221 / 255);
        this.water.colorBlendFactor = 0.0;
        this.water.addToRenderList(this.skybox);
        this.waterMesh.material = this.water;

        for(let i = 0; i < 10; ++i)
        {
            this.spawnFish(20, 100, 10, scene.getMeshByName("player_fish"));
        }
    }

    public addToRenderList(node: any) {
        this.water.addToRenderList(node);
    }

    public update(scene : Scene) : void {
        const fishMesh = scene.getMeshByName("player_fish");

        // despawn far away fish
        // this.wildFish.forEach(element => {
        //     if(Vector3.Distance(element.position, fishMesh.position) > 100)
        //     {
        //         element.dispose();
        //     }
        // });

        // spawn enw fish

    }

    private spawnFish(minRadius: number, maxRadius: number, quantity: number, fishMesh: AbstractMesh): void {
        var plusOrMinusX = Math.random() < 0.5 ? -1 : 1;
        var plusOrMinusZ = Math.random() < 0.5 ? -1 : 1;

        const rX = fishMesh.position.x + plusOrMinusX
            * (Math.floor(Math.random() * maxRadius) + minRadius);
        const rZ = fishMesh.position.z + plusOrMinusZ
            * (Math.floor(Math.random() * maxRadius) + minRadius);
        
        const npcFishMesh = fishMesh.clone('fish_'+this.uid, null);
        npcFishMesh.position = new Vector3(rX, 0, rZ);
        this.water.addToRenderList(npcFishMesh);
        this.wildFish.push(npcFishMesh);
        this.uid++;
    }

}