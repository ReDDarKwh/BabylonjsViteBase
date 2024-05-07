import * as B from "babylonjs";
import { Query, With, World } from "miniplex";
import { Input } from "./input/input";
import { Entity } from "./ecs/entity";

export abstract class App {
    world: World<Entity>;
    engine!: B.Engine;
    scene!: B.Scene;
    queries: {
        node: Query<With<Entity, "node">>;
        physics: Query<With<Entity, "node" | "physics">>;
    };
    input!: Input;

    readonly canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.world = new World();
        this.queries = {
            node: this.world.with("node"),
            physics: this.world.with("node", "physics"),
        };

        this.queries.node.onEntityRemoved.subscribe(({ node }) => {
            node.dispose();
        });

        this.queries.physics.onEntityAdded.subscribe(({ node, physics }) => {
            
            
            const imposter = new BABYLON.PhysicsImpostor(
                node.,
                BABYLON.PhysicsImpostor.BoxImpostor,
                { mass: 2, friction: 0.0, restitution: 0.3 },
                node._scene
            );


        });
    }

    static async createEngine(canvas: HTMLCanvasElement) {
        const webGPUSupported = await (B.WebGPUEngine as any).IsSupportedAsync;
        if (webGPUSupported) {
            const engine = new B.WebGPUEngine(canvas);
            await engine.initAsync();
            return engine;
        }
        return new B.Engine(canvas, true);
    }

    async init() {
        this.engine = await App.createEngine(this.canvas);
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.input = new Input(this.engine);
        this.scene = new B.Scene(this.engine);

        this.scene.enablePhysics(B.Vector3.Zero(), new B.AmmoJSPlugin());

        this.input.getActionDownObservable("debug").subscribe(() => {
            this.debug(!this.scene.debugLayer.isVisible());
        });

        this.scene.registerBeforeRender(this.internalBeforeRender);

        this.start(this.scene);
    }

    private internalBeforeRender() {
        this.update();
    }

    abstract start(scene: B.Scene): void;
    abstract update(): void;

    debug(debugOn: boolean = true) {
        if (debugOn) {
            this.scene.debugLayer.show({ overlay: true });
        } else {
            this.scene.debugLayer.hide();
        }
    }

    async run() {
        await this.init();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}
