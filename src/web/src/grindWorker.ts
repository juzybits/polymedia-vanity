import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

self.onmessage = (evt: MessageEvent<unknown>) => {
    const msg = evt.data;
    if (msg === "start") {
        grind();
    }
};

const grind = () => {
    let count = 0;
    while (true) {
        const pair = new Ed25519Keypair();
        const address = pair.toSuiAddress();
        if (address.startsWith("0xfee")) {
            const secretKey = pair.getSecretKey();
            postMessage({address, secretKey});
        }
        if (++count % 1000 === 0) {
            console.log(count);
        }
    }
};
