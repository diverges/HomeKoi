import {
    Scene,
    Color3,
    Mesh, 
    Texture,
    Vector2,
    CubeTexture
} from "babylonjs";
import { StandardMaterial, WaterMaterial } from 'babylonjs-materials';

export class Sea {
    private skybox: Mesh;
    private skyboxMaterial: StandardMaterial;
    private waterMesh : Mesh;
    private water: WaterMaterial;

    constructor(scene: Scene)
    {
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
    }

    public addToRenderList(node: any) {
        this.water.addToRenderList(node);
    }
}