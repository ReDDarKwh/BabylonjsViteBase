import * as B from "babylonjs";
import { CONFIG } from "../config";
import { Observable, Subject, filter } from "rxjs";

const InputTypeMap: { [key: string]: B.DeviceType } = {
    keyboard: B.DeviceType.Keyboard,
    mouse: B.DeviceType.Mouse,
};

const MouseInputMap: { [key: number]: string } = {
    0: "Left",
    1: "Middle",
    2: "Right",
    3: "X1",
    4: "X2",
};

type ActionEvent = {
    name: string;
    type: "down" | "up";
};

export class Input {
    private mappings: Map<
        B.DeviceType,
        Map<string /*code*/, string[] /*actions*/>
    >;

    private pressedActions: Set<string>;

    private OnAction: Subject<ActionEvent>;

    getActionObservable(actionName: string): Observable<ActionEvent> {
        return this.OnAction.pipe(filter((x) => x.name == actionName));
    }

    getActionDownObservable(actionName: string): Observable<ActionEvent> {
        return this.getActionObservable(actionName).pipe(
            filter((x) => x.type == "down")
        );
    }

    getActionUpObservable(actionName: string): Observable<ActionEvent> {
        return this.getActionObservable(actionName).pipe(
            filter((x) => x.type == "up")
        );
    }

    constructor(engine: B.Engine) {
        const deviceSourceManager = new B.DeviceSourceManager(engine);
        this.mappings = new Map();
        this.pressedActions = new Set();
        this.OnAction = new Subject();

        for (const [key, value] of Object.entries(CONFIG.input.mappings)) {
            for (const [inputType, inputCodes] of Object.entries(value)) {
                const deviceType = InputTypeMap[inputType];
                if (!this.mappings.has(deviceType)) {
                    this.mappings.set(deviceType, new Map());
                }

                const actionsByCode = this.mappings.get(deviceType)!;

                for (const inputCode of inputCodes) {
                    if (!actionsByCode.has(inputCode)) {
                        actionsByCode.set(inputCode, []);
                    }

                    const actions = actionsByCode.get(inputCode)!;

                    actions.push(key);
                }
            }
        }

        deviceSourceManager.onDeviceConnectedObservable.add((device) => {
            const codes = this.mappings.get(device.deviceType);

            if (device.deviceType === B.DeviceType.Keyboard) {
                deviceSourceManager
                    .getDeviceSource(B.DeviceType.Keyboard)
                    ?.onInputChangedObservable.add((eventData) => {
                        const actions = codes?.get(eventData.code);

                        if (!actions) return;

                        for (const action of actions) {
                            this.processAction(
                                action,
                                eventData.type == "keydown" ? "down" : "up"
                            );
                        }
                    });
            } else if (device.deviceType === B.DeviceType.Mouse) {
                deviceSourceManager
                    .getDeviceSource(B.DeviceType.Mouse)
                    ?.onInputChangedObservable.add((eventData) => {
                        const actions = codes?.get(
                            MouseInputMap[eventData.button]
                        );

                        if (!actions) return;

                        for (const action of actions) {
                            this.processAction(
                                action,
                                eventData.type == "pointerdown" ? "down" : "up"
                            );
                        }
                    });
            }
        });
    }

    processAction(name: string, type: "down" | "up") {
        let sendEvent = false;

        if (type == "down" && !this.pressedActions.has(name)) {
            this.pressedActions.add(name);
            sendEvent = true;
        } else if (type == "up") {
            this.pressedActions.delete(name);
            sendEvent = true;
        }

        if (sendEvent) {
            this.OnAction.next({ name, type });
        }
    }
}
