import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const RESTART_AFTER_COUNT = 5000;

export type AppEvent = AppStartEvent;
export type AppStartEvent = {
    msg: "start";
    data: {
        startsWith: string;
        endsWith: string;
    };
}

export type WorkerEvent = WorkerMatchEvent | WorkerRestartEvent;
export type WorkerMatchEvent = {
    msg: "match";
    data: {
        address: string;
        secretKey: string;
    };
}
export type WorkerRestartEvent = {
    msg: "restart";
};

self.onmessage = (evt: MessageEvent<AppEvent>) => {
    const e = evt.data;
    if (e.msg === "start") {
        run("0x" + e.data.startsWith, e.data.endsWith);
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
                data: { address, secretKey },
            };
            postMessage(event);
        }

        if (count % 1000 === 0) {
            console.debug(count);
        }

        if (count === RESTART_AFTER_COUNT) {
            console.debug("[worker] restarting");
            const event: WorkerEvent = { msg: "restart" };
            postMessage(event);
            break;
        }
    }
};
