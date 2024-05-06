
import * as B from 'babylonjs'
import { Query, With, World } from "miniplex"

type Entity = {
    position?: { x: number; y: number; z: number },
    node?: B.Node
}

export abstract class App{

    world: World<Entity>;
    engine!: B.Engine;
    scene!: B.Scene;
    queries: {
        node: Query<With<Entity, "node">>;
    };

    readonly canvas: HTMLCanvasElement

    static async createEngine(canvas: HTMLCanvasElement) {
        const webGPUSupported = await (B.WebGPUEngine as any).IsSupportedAsync;
        if (webGPUSupported) {
            const engine = new B.WebGPUEngine(canvas);
            await engine.initAsync();
            return engine;
        }
        return new B.Engine(canvas, true);
    }

    async init(){
        this.engine = await App.createEngine(this.canvas) ;
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.scene = new B.Scene(this.engine);
        this.start(this.scene);
    }

    abstract start(scene: B.Scene): void;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.world = new World();
        this.queries = {
            node: this.world.with("node")
        };

        this.queries.node.onEntityRemoved.subscribe(({node}) => {
            node.dispose();
        });
    }

    debug(debugOn: boolean = true) {
        if (debugOn) {
            this.scene.debugLayer.show({ overlay: true });
        } else {
            this.scene.debugLayer.hide();
        }
    }

    async run() {
        await this.init();
        this.debug(true);

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}