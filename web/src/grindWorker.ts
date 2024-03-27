import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

self.onmessage = async (evt: MessageEvent<string>) => {
    const msg = evt.data;
    if (msg === 'start') {
        grind();
    }
};

const grind = () => {
    while (true) {
        const mem = generateMnemonic(wordlist);
        const pair = Ed25519Keypair.deriveKeypair(mem);
        const addr = pair.toSuiAddress();
        postMessage(addr);
    }
};
