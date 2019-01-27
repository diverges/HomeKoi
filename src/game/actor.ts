import { Scene } from 'babylonjs';

export interface SceneActor {
    update(scene: Scene) : void;
}