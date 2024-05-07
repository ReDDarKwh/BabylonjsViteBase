import * as B from "babylonjs";

export type Entity = {
    playerControlled?: {};
    physics?: {
        gravity?: B.Vector3;
        hasCollisions?: boolean;
        acceleration?: B.Vector3;
        velocity?: B.Vector3;
    };
    node?: B.Node;
};
