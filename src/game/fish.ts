import { Mesh, Scene, Vector3, GroundGeometry } from "babylonjs";


class PhysicsBehavior {
    mesh: Mesh;

    mass: number;
    velocity: Vector3;
    acceleration: Vector3;


    constructor(mesh: Mesh, mass: number = 1.0) {
        this.mesh = mesh;
        this.mass = mass;

        this.velocity = Vector3.Zero();
        this.acceleration = Vector3.Zero();

        this.mesh.onBeforeRenderObservable.add(this.update.bind(this));
    }

    applyForce(force: Vector3) {
        this.acceleration = this.acceleration.add(force.scale(1.0 / this.mass));
    }

    updatePosition(deltaTime: number) {
        this.mesh.rotate(Vector3.Up(), Math.atan2(this.velocity.x, this.velocity.z));

        this.velocity.addInPlace(this.acceleration.scale(deltaTime));
        this.mesh.position.addInPlace(this.velocity.scale(deltaTime));
        this.mesh.position.y = 0;

        this.acceleration = Vector3.Zero();
    }

    update() {
        let deltaTime = 0.01;
        this.updatePosition(deltaTime);
    }
}

export class PlayerFishBehavior extends PhysicsBehavior {
    scene: Scene;
    ground: Mesh;

    target: Vector3;
    shouldFollowPointer: boolean;
    chaseStrength: number;

    constructor(scene: Scene,
        ground: Mesh,
        mesh: Mesh,
        chaseStrength = 3.5) {
        super(mesh);

        this.scene = scene;
        this.ground = ground;

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

        this.shouldFollowPointer = false;
        this.chaseStrength = chaseStrength;
    }

    getGroundPoint() : Vector3 {
        return this.scene.pick(this.scene.pointerX, this.scene.pointerY, mesh => mesh == this.ground).pickedPoint;
    }

    update() : void {
        if(this.shouldFollowPointer && this.target) {
            let target = new Vector3(this.target.x, 0, this.target.z);

            let delta = target.subtract(this.mesh.position);

            delta = delta.scale(this.chaseStrength);

            this.velocity = delta;
        }
        else {
            this.velocity.scaleInPlace(0.95);
        }

        super.update();
    }
}

export class Flock {
    playerFish: PlayerFishBehavior;
    flockingFish: FlockingFishBehavior[];

    constructor(playerFish: PlayerFishBehavior) {
        this.playerFish = playerFish;
        this.flockingFish = [];
    }

    addFlockingFish(flockingFish: FlockingFishBehavior) {
        this.flockingFish.push(flockingFish);
    }

    mergeFlocks(flock: Flock) {
        let bigFlock: Flock;
        let littleFlock: Flock;

        if(this.flockingFish.length > flock.flockingFish.length) {
            bigFlock = this;
            littleFlock = flock;
        }
        else if(this.flockingFish.length < flock.flockingFish.length) {
            bigFlock = flock;
            littleFlock = this;
        }
        else if(Math.random() < 0.5) {
            bigFlock = this;
            littleFlock = flock;
        }
        else {
            bigFlock = flock;
            littleFlock = this;
        }

        littleFlock.flockingFish.forEach(fish => fish.joinFlock(bigFlock));
    }
}

export class FlockingFishBehavior extends PhysicsBehavior {
    flock: Flock;

    separationDistance: number;
    separationStrength: number;

    cohesionDistance: number;
    cohesionStrength: number;

    alignmentDistance: number;
    alignmentStrength: number;

    constructor(mesh: Mesh,
        mass: number = 1.0,
        separationDistance: number = 5,
        separationStrength: number = 5,
        cohesionDistance: number = 20,
        cohesionStrength: number = 10,
        alignmentDistance: number = 20,
        alignmentStrength: number = 0.1) {

        super(mesh, mass);

        this.separationDistance = separationDistance;
        this.separationStrength = separationStrength;

        this.cohesionDistance = cohesionDistance;
        this.cohesionStrength = cohesionStrength;

        this.alignmentDistance = alignmentDistance;
        this.alignmentStrength = alignmentStrength;
    }

    joinFlock(flock: Flock) {
        flock.addFlockingFish(this);
        this.flock = flock;
    }

    applyForce(force: Vector3) {
        this.acceleration = this.acceleration.add(force.scale(1.0 / this.mass));
    }

    update() {
        let otherFish = this.flock.flockingFish
            .filter(fish => fish != this);

        let separationForce = this.calculateSeparation(otherFish, this.flock.playerFish);
        this.applyForce(separationForce);

        let cohesionForce = this.calculateCohesion(otherFish, this.flock.playerFish);
        this.applyForce(cohesionForce);

        let alignmentForce = this.calculateAlignment(otherFish, this.flock.playerFish);
        this.applyForce(alignmentForce);

        super.update();
    }

    calculateSeparation(flockingFish: FlockingFishBehavior[], playerFish: PlayerFishBehavior): Vector3 {
        let separationForce = Vector3.Zero();

        let calculateSeparation = (pos: Vector3) => {
            let delta = this.mesh.position.subtract(pos);

            if(delta.length() < this.separationDistance) {
                let force = delta.normalize().scale(this.separationStrength / delta.length());
                separationForce.addInPlace(force);
            }
        };

        flockingFish.forEach(fish => calculateSeparation(fish.mesh.position));
        calculateSeparation(playerFish.mesh.position);

        return separationForce;
    }

    calculateCohesion(flockingFish: FlockingFishBehavior[], playerFish: PlayerFishBehavior): Vector3 {
        let closeFlockMatePositionSum = Vector3.Zero();
        let closeFlockMateCount = 0;

        let calculateCohesion = (pos: Vector3) => {
            let delta = this.mesh.position.subtract(pos);

            if(delta.length() < this.cohesionDistance) {
                closeFlockMatePositionSum.addInPlace(pos);
                closeFlockMateCount++;
            }
        };

        flockingFish.forEach(fish => calculateCohesion(fish.mesh.position));
        calculateCohesion(playerFish.mesh.position);

        let averagePosition = closeFlockMatePositionSum.scaleInPlace(1.0 / closeFlockMateCount);

        return averagePosition.subtractInPlace(this.mesh.position).scaleInPlace(this.cohesionStrength);
    }

    calculateAlignment(flockingFish: FlockingFishBehavior[], playerFish: PlayerFishBehavior): Vector3 {
        let averageVelocity = Vector3.Zero();
        let closeFlockMateCount = 0;

        let calculateAlignment = (pos: Vector3, velocity: Vector3) => {
            let delta = this.mesh.position.subtract(pos);

            if(delta.length() < this.alignmentDistance) {
                averageVelocity.addInPlace(velocity);
                closeFlockMateCount++;
            }
        }

        flockingFish.forEach(fish => calculateAlignment(fish.mesh.position, fish.velocity));
        calculateAlignment(playerFish.mesh.position, playerFish.velocity);

        averageVelocity.scaleInPlace(1.0 / closeFlockMateCount);

        return averageVelocity.scaleInPlace(this.alignmentStrength);
    }
}