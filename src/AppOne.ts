import * as B from "babylonjs";
import * as Colyseus from "colyseus.js"; // not necessary if included via <script> tag.
import { App } from "./app";

export class AppOne extends App {
    override start(scene: B.Scene): void {
        const { node: camera } = this.world.add({
            node: new B.FreeCamera("camera1", new B.Vector3(0, 5, -10), scene),
        });

        camera.setTarget(B.Vector3.Zero());
        camera.attachControl(this.canvas, true);

        var ground = B.MeshBuilder.CreateGround(
            "ground",
            { width: 6, height: 6 },
            scene
        );
        var groundMaterial = new B.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = new B.Color3(0.5, 0.8, 0.5); // RGB for a greenish color
        ground.material = groundMaterial;
        groundMaterial.bumpTexture = new B.Texture("./normal.jpg", scene);

        var player = new B.TransformNode("player", scene);

        this.world.add({
            node: new B.HemisphericLight(
                "light",
                new B.Vector3(0, 1, 0),
                scene
            ),
        });

        this.world.add({
            node: B.MeshBuilder.CreateSphere(
                "sphere",
                { diameter: 2, segments: 32 },
                scene
            ),
            physics: {
                gravity: new B.Vector3(0, -0.9, 0),
                hasCollisions: true,
                velocity: B.Vector3.Zero(),
                acceleration: B.Vector3.Zero(),
            },
        });
    }

    override update(): void {}
}

function connectToServer() {
    var client = new Colyseus.Client("ws://localhost:2567");

    client
        .joinOrCreate("my_room")
        .then((room) => {
            console.log(room.sessionId, "joined", room.name);

            room.onMessage("message_type", (message) => {
                console.log(room.sessionId, "received on", room.name, message);
            });

            // room.onMessage("__playground_message_types", (message) => {
            //     console.log(room.sessionId, "received on", room.name, message);
            // });
        })
        .catch((e) => {
            console.log("JOIN ERROR", e);
        });
}
