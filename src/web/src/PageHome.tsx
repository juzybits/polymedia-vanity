import React, { useEffect, useRef, useState } from "react";
import { isHex, shortAddress, shortNumber } from "./utils";
import { AppStartEvent, Keypair, WorkerEvent } from "./vanityWorker";

type WorkerStatus = "stopped" | "running";

export const PageHome: React.FC = () =>
{
    /* State */

    const worker = useRef<Worker|null>(null);
    const [ status, setStatus ] = useState<WorkerStatus>("stopped");
    const [ beginsWith, setBeginsWith ] = useState<string>("");
    const [ endsWith, setEndsWith ] = useState<string>("");
    const [ keypairs, setKeypairs ] = useState<Keypair[]>([]);
    const [ pairCount, setPairCount ] = useState<number>(0);
    const timeStart = useRef<number>(0);
    const [ pairsPerSec, setPairsPerSec ] = useState<number>(0);

    /* Functions */

    useEffect(() => {
        // clean up when the component unmounts
        return () => {
            worker.current && stopWorker;
        };
    }, []);

    const handleWorkerEvent = (evt: MessageEvent<WorkerEvent>) => {
        const e = evt.data;
        if (e.msg === "match") {
            setKeypairs(oldMatches => [e.pair, ...oldMatches]);
        }
        else if (e.msg === "countUpdate") {
            const now = performance.now();
            setPairsPerSec(1000 * e.count / (now - timeStart.current));
            timeStart.current = now;
            setPairCount(oldCount => oldCount + e.count);
        }
        else if (e.msg === "restart") {
            stopWorker();
            startWorker();
        }
    };

    const startWorker = () => {
        if (worker.current) {
            console.warn("[app] worker already running");
            return;
        }

        setStatus("running");
        console.debug("[app] starting worker");

        worker.current =  new Worker(
            new URL("./vanityWorker.ts", import.meta.url),
            { type: "module" },
        );
        worker.current.onmessage = handleWorkerEvent;

        const event: AppStartEvent = { msg: "start", beginsWith, endsWith };
        worker.current.postMessage(event);
        timeStart.current = performance.now();
    };

    const stopWorker = () => {
        if (!worker.current) {
            console.warn("[app] worker already stopped");
            return;
        }
        console.debug("[app] stopping worker");
        worker.current.terminate();
        worker.current = null;
        setStatus("stopped");
    };

    const onChangeBeginsWith = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (isHex(value)) {
            setBeginsWith(value.toLowerCase());
        }
    };

    const onChangeEndsWith = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (isHex(value)) {
            setEndsWith(value.toLowerCase());
        }
    };

    const beginsLength = beginsWith.length;
    const endsLength = endsWith.length;
    const criteriaLength = beginsLength + endsLength;
    const combinations = Math.pow(16, criteriaLength);

    /* HTML */

    return <>

    <h1><span className="rainbow">Sui Vanity Address Generator</span></h1>

    <div id="config-section">
        <p>Begins with:</p>
        <input type="text" value={beginsWith} onChange={onChangeBeginsWith} maxLength={64} />

        <p>Ends with:</p>
        <input type="text" value={endsWith} onChange={onChangeEndsWith} maxLength={64} />

        <div className="btn-group">
            <button className="btn" onClick={startWorker} disabled={status !== "stopped"}>SEARCH</button>
            <button className="btn" onClick={stopWorker} disabled={status !== "running"}>STOP</button>
        </div>
    </div>

    <div id="info-section" className="tight">
        {criteriaLength > 0 &&
        <p>
            Combinations: <span className="font-mono break-all">{shortNumber(combinations)}</span>
        </p>
        }

        {pairCount > 0 &&
        <p>
            Keypairs generated: <span className="font-mono">{shortNumber(pairCount)}</span>
        </p>
        }

        {pairsPerSec > 0 &&
        <p>
            Keypairs per second: <span className="font-mono">{pairsPerSec.toFixed(0)}</span>
        </p>
        }
    </div>

    {keypairs.length > 0 &&
    <div id="pairs-section">
        <h1><span className="rainbow">KEYPAIRS</span></h1>
        <div id="pairs-list">
            {keypairs.map(pair =>
            <div className="pair" key={pair.address}>
                <div className="short-address"><span>{shortAddress(pair.address, beginsLength, endsLength)}</span></div>
                <div className="address text-green">{pair.address}</div>
                <div className="secret-key text-orange">{pair.secretKey}</div>
            </div>)}
        </div>
    </div>
    }

    </>;
};
