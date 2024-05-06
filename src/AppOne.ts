import * as B from "babylonjs";
import * as Colyseus from "colyseus.js"; // not necessary if included via <script> tag.
import { App } from "./app";

export class AppOne extends App {
    start(scene: B.Scene): void {
        const { node: camera } = this.world.add({
            node: new B.FreeCamera("camera1", new B.Vector3(0, 5, -10), scene),
        });

        camera.setTarget(B.Vector3.Zero());
        camera.attachControl(this.canvas, true);

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
        });
    }

    createScene(engine: B.Engine, canvas: HTMLCanvasElement): B.Scene {
        connectToServer();

        // this is the default code from the playground:

        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new B.Scene(engine);

        // This creates and positions a free camera (non-mesh)
        var camera = new B.FreeCamera(
            "camera1",
            new B.Vector3(0, 5, -10),
            scene
        );

        // This targets the camera to scene origin
        camera.setTarget(B.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new B.HemisphericLight(
            "light",
            new B.Vector3(0, 1, 0),
            scene
        );

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape.
        var sphere = B.MeshBuilder.CreateSphere(
            "sphere",
            { diameter: 2, segments: 32 },
            scene
        );
        // Move the sphere upward 1/2 its height
        let startPos = 2;
        sphere.position.y = startPos;

        // Our built-in 'ground' shape.
        var ground = B.MeshBuilder.CreateGround(
            "ground",
            { width: 6, height: 6 },
            scene
        );
        var groundMaterial = new B.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = new B.Color3(0.5, 0.8, 0.5); // RGB for a greenish color
        ground.material = groundMaterial;
        groundMaterial.bumpTexture = new B.Texture("./normal.jpg", scene);
        //groundMaterial.bumpTexture.level = 0.125;

        var redMaterial = new B.StandardMaterial("redMaterial", scene);
        redMaterial.diffuseColor = new B.Color3(1, 0, 0); // RGB for red
        sphere.material = redMaterial;

        var sphereVelocity = 0;
        var gravity = 0.009;
        var reboundLoss = 0.1;

        scene.registerBeforeRender(() => {
            sphereVelocity += gravity;
            let newY = sphere.position.y - sphereVelocity;
            sphere.position.y -= sphereVelocity;
            if (newY < 1) {
                sphereVelocity = (reboundLoss - 1) * sphereVelocity;
                newY = 1;
            }
            sphere.position.y = newY;
            if (Math.abs(sphereVelocity) <= gravity && newY < 1 + gravity) {
                sphere.position.y = startPos++;
            }
        });

        return scene;
    }
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
