import { Vector3, Camera, Mesh, FreeCamera } from "babylonjs";

export class CameraFollowBehavior {
    velocity: Vector3;
    acceleration: Vector3;

    camera: FreeCamera;
    targetMesh: Mesh;
    targetDistance: number;
    chaseStrength: number;

    constructor(camera: FreeCamera, targetMesh: Mesh, targetDistance: number, chaseStrength: number) {
        this.camera = camera;
        this.targetMesh = targetMesh;
        this.targetDistance = targetDistance;
        this.chaseStrength = chaseStrength;

        this.velocity = Vector3.Zero();
        this.acceleration = Vector3.Zero();

        this.camera.position = this.targetMesh.position.add(Vector3.Up().scale(targetDistance));
        this.camera.setTarget(this.targetMesh.position);

        this.targetMesh.onBeforeRenderObservable.add(this.update.bind(this));
    }

    updatePosition() {
        this.camera.position.addInPlace(this.velocity);

        this.acceleration = Vector3.Zero();
    }

    update() {
        let target = new Vector3(this.targetMesh.position.x, this.targetDistance, this.targetMesh.position.z);

        let delta = target.subtract(this.camera.position);

        delta = delta.scale(this.chaseStrength);

        this.velocity = delta;

        this.updatePosition();
    }
}