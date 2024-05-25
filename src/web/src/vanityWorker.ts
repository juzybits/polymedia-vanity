import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const RESTART_AFTER_COUNT = 5000;

export type AppEvent = {
    msg: "start";
}

export type WorkerEvent = {
    msg: "match" | "restart";
    data: unknown;
}

self.onmessage = (evt: MessageEvent<AppEvent>) => {
    const e = evt.data;
    if (e.msg === "start") {
        run();
    }
};

const run = () => {
    console.debug("[worker] starting");
    let count = 0;
    while (true)
    {
        count++;
        const pair = new Ed25519Keypair();
        const address = pair.toSuiAddress();

        if (address.startsWith("0xfee")) {
            const secretKey = pair.getSecretKey();
            const event: WorkerEvent = {
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
            const event: WorkerEvent = {
                msg: "restart",
                data: null,
            };
            postMessage(event);
            break;
        }
    }
};
