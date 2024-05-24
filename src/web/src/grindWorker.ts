import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

self.onmessage = (evt: MessageEvent<string>) => {
    const msg = evt.data;
    if (msg === "start") {
        grind();
    }
};

const grind = () => {
    // let count = 0;
    while (true) {
        const phrase = generateMnemonic(wordlist);
        const pair = Ed25519Keypair.deriveKeypair(phrase);
        const address = pair.toSuiAddress();
        if (address.startsWith("0xfee")) {
            const secretKey = pair.getSecretKey();
            postMessage({address, secretKey, phrase});
        }
        // if (++count % 100 === 0) {
        //     console.log(count);
        // }
    }
};

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
