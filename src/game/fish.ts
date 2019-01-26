import { Mesh, Scene, Node, Nullable, Vector3, GroundGeometry } from "babylonjs";


export default class PlayerFishBehavior {
    scene: Scene;
    ground: Mesh;
    mesh: Mesh;

    target: Vector3;
    shouldFollowPointer: boolean;
    speed: number;

    constructor(scene: Scene, ground: Mesh, mesh: Mesh) {
        this.scene = scene;
        this.mesh = mesh;

        this.scene.onPointerObservable.add(pointerInfo => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    this.shouldFollowPointer = true;
                    this.target = this.getGroundPoint();
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:
                    if(this.shouldFollowPointer) {
                        this.target = this.getGroundPoint();
                    }
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    this.shouldFollowPointer = false;
                    break;
            }
        });

        this.mesh.onBeforeRenderObservable.add(this.update.bind(this));

        this.shouldFollowPointer = false;
        this.speed = 0.1;
    }

    getGroundPoint() : Vector3 {
        return this.scene.pick(this.scene.pointerX, this.scene.pointerY).pickedPoint;
    }

    update() : void {
        if(this.shouldFollowPointer && this.target) {
            let target = new Vector3(this.target.x, 0, this.target.z);

            let delta = target.subtract(this.mesh.position);

            if(delta.length() > this.speed) {
                delta = delta.normalize().scale(this.speed);
            }

            this.mesh.position.addInPlace(delta);
        }
    }
}