import { Vector3, Camera, Mesh, FreeCamera } from "babylonjs";
import { Flock, PlayerFishBehavior } from "./fish";

export class CameraFollowBehavior {
    velocity: Vector3;
    acceleration: Vector3;

    camera: FreeCamera;
    player: PlayerFishBehavior;
    flock: Flock;
    distanceScalar: number;
    chaseStrength: number;

    constructor(camera: FreeCamera, player: PlayerFishBehavior, flock: Flock, distanceScalar: number, chaseStrength: number) {
        this.camera = camera;
        this.player = player;
        this.flock = flock;
        this.distanceScalar = distanceScalar;
        this.chaseStrength = chaseStrength;

        this.velocity = Vector3.Zero();
        this.acceleration = Vector3.Zero();

        this.camera.position = this.player.mesh.position.add(Vector3.Up().scale(this.calculateTargetDistance()));
        this.camera.setTarget(this.player.mesh.position);

        this.player.mesh.onBeforeRenderObservable.add(this.update.bind(this));
    }

    updatePosition() {
        this.camera.position.addInPlace(this.velocity);

        this.acceleration = Vector3.Zero();
    }

    calculateTargetDistance(): number {
        return Math.sqrt(this.flock.flockingFish.length + 1) * this.distanceScalar;
    }

    update() {
        let target = new Vector3(this.player.mesh.position.x, this.calculateTargetDistance(), this.player.mesh.position.z);

        let delta = target.subtract(this.camera.position);

        delta = delta.scale(this.chaseStrength);

        this.velocity = delta;

        this.updatePosition();
    }
}