import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const RESTART_AFTER_COUNT = 5000;
const UPDATE_AFTER_COUNT = 100;

export type Keypair = {
    address: string;
    secretKey: string;
};

export type AppEvent = AppStartEvent;
export type AppStartEvent = {
    msg: "start";
    startsWith: string;
    endsWith: string;
};

export type WorkerEvent = WorkerMatchEvent | WorkerRestartEvent | WorkerCountUpdateEvent;
export type WorkerMatchEvent = {
    msg: "match";
    pair: Keypair;
};
export type WorkerRestartEvent = {
    msg: "restart";
};
export type WorkerCountUpdateEvent = {
    msg: "countUpdate";
    count: number;
};

self.onmessage = (evt: MessageEvent<AppEvent>) => {
    const e = evt.data;
    if (e.msg === "start") {
        run("0x" + e.startsWith, e.endsWith);
    }
};

const run = (startsWith: string, endsWith: string) => {
    let count = 0;
    while (true)
    {
        count++;
        const pair = new Ed25519Keypair();
        const address = pair.toSuiAddress();

        if (address.startsWith(startsWith) && address.endsWith(endsWith)) {
            const secretKey = pair.getSecretKey();
            const event: WorkerMatchEvent = {
                msg: "match",
                pair: { address, secretKey },
            };
            postMessage(event);
        }

        if (count % UPDATE_AFTER_COUNT === 0) {
            const event: WorkerCountUpdateEvent = { msg: "countUpdate", count: UPDATE_AFTER_COUNT };
            postMessage(event);
        }

        if (count === RESTART_AFTER_COUNT) {
            console.debug("[worker] restarting");
            const event: WorkerRestartEvent = { msg: "restart" };
            postMessage(event);
            break;
        }
    }
};
