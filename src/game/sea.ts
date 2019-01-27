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
import { Flock, FlockingFishBehavior, WildFishBehavior } from "./fish";
import { SceneActor } from './actor'; 

const INITIAL_FISH = 10;
const MAX_WILD_FISH  = 40;
const MIN_SPAWN_RADIUS = 50;
const MAX_SPAWN_RADIUS = 150;
const DESPAWN_RADIUS = 300;
const FLOCK_JOIN_DISTANCE = 10;

export class Sea implements SceneActor {
    private skybox: Mesh;
    private skyboxMaterial: StandardMaterial;
    private waterMesh : Mesh;
    private water: WaterMaterial;

    private uid: number;
    private wildFish: WildFishBehavior[];
    private playerFlock: Flock;

    constructor(scene: Scene, playerFlock: Flock)
    {
        this.uid = 0;
        this.wildFish = [];
        this.playerFlock = playerFlock;
        this.playerFlock.onFishLeavesFlock = (fish: FlockingFishBehavior) => {
            this.wildFish.push(new WildFishBehavior(fish.mesh));
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

        for(let i = 0; i < INITIAL_FISH; ++i)
        {
            this.spawnFish(20, 100, scene.getMeshByName("player_fish"));
        }
    }

    public addToRenderList(node: any) {
        this.water.addToRenderList(node);
    }

    public update(scene : Scene) : void {
        const fishMesh = scene.getMeshByName("player_fish");

        scene.cameras[0].position.y = 45 + 25*Math.sqrt(this.playerFlock.flockingFish.length);

        // despawn far away fish
        this.wildFish.forEach((element, index) => {
            let wildFishMesh = element.mesh;
            let distanceToPlayer = Vector3.Distance(wildFishMesh.position, fishMesh.position);
            
            if(distanceToPlayer > DESPAWN_RADIUS)
            {
                wildFishMesh.dispose();
                element.dispose();
                this.wildFish.splice(index,1);
            }

            if(distanceToPlayer < FLOCK_JOIN_DISTANCE)
            {
                this.joinFlock(element.mesh);
                element.dispose();
                this.wildFish.splice(index,1);
            }
        });

        // spawn new fish
        if(this.wildFish.length < MAX_WILD_FISH)
        {
            for(let i = 0; i < MAX_WILD_FISH-this.wildFish.length; ++i)
            {
                this.spawnFish(
                    MIN_SPAWN_RADIUS,
                    MAX_SPAWN_RADIUS,
                    scene.getMeshByName("player_fish"));
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
        this.wildFish.push(new WildFishBehavior(<Mesh>npcFishMesh));
        this.uid++;
    }

}