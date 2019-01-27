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
import { PlayerFishBehavior, Flock, FlockingFishBehavior } from "./fish";
import { SceneActor } from './actor'; 

const MAX_WILD_FISH  = 30;
const MAX_SPAWN_RADIUS = 200;
const DESPAWN_RADIUS = 300;
const FLOCK_JOIN_DISTANCE = 10;

export class Sea implements SceneActor {

    private skybox: Mesh;
    private skyboxMaterial: StandardMaterial;
    private waterMesh : Mesh;
    private water: WaterMaterial;

    private uid: number;
    private wildFish: AbstractMesh[];
    private playerFlock: Flock;

    constructor(scene: Scene, playerFlock: Flock)
    {
        this.uid = 0;
        this.wildFish = [];
        this.playerFlock = playerFlock;
        this.playerFlock.onFishLeavesFlock = (fish: FlockingFishBehavior) => {
            this.wildFish.push(fish.mesh);
        }

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
            this.spawnFish(20, 100, scene.getMeshByName("player_fish"));
        }
    }

    public addToRenderList(node: any) {
        this.water.addToRenderList(node);
    }

    public update(scene : Scene) : void {
        const fishMesh = scene.getMeshByName("player_fish");

        scene.cameras[0].position.y = 35 + 25*Math.sqrt(this.playerFlock.flockingFish.length);

        // despawn far away fish
        this.wildFish.forEach((element, index) => {
            let distanceToPlayer = Vector3.Distance(element.position, fishMesh.position);
            
            if(distanceToPlayer > DESPAWN_RADIUS)
            {
                element.dispose();
                this.wildFish.splice(index,1);
            }

            if(distanceToPlayer < FLOCK_JOIN_DISTANCE)
            {
                this.joinFlock(element);
                this.wildFish.splice(index,1);
            }
        });

        // spawn new fish
        if(this.wildFish.length < MAX_WILD_FISH)
        {
            for(let i = 0; i < MAX_WILD_FISH-this.wildFish.length; ++i)
            {
                this.spawnFish(100, 200, scene.getMeshByName("player_fish"));
            }
        }
    }

    private joinFlock(fish: AbstractMesh): FlockingFishBehavior {
        let flockingFish = new FlockingFishBehavior(<Mesh>fish);
        flockingFish.joinFlock(this.playerFlock);
        return flockingFish;
    }

    private spawnFish(minRadius: number, maxRadius: number, fishMesh: AbstractMesh): void {
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