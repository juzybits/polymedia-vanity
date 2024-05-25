import React, { useEffect, useRef, useState } from "react";
import { isHex, shortAddress, shortNumber } from "./utils";
import { AppStartEvent, Keypair, WorkerEvent } from "./vanityWorker";

type WorkerStatus = "stopped" | "running";

export const PageHome: React.FC = () =>
{
    /* State */

    const worker = useRef<Worker|null>(null);
    const [ status, setStatus ] = useState<WorkerStatus>("stopped");
    const [ startsWith, setStartsWith ] = useState<string>("abc");
    const [ endsWith, setEndsWith ] = useState<string>("");
    const [ keypairs, setKeypairs ] = useState<Keypair[]>([]);
    const [ pairCount, setPairCount ] = useState<number>(0);

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

        const event: AppStartEvent = { msg: "start", startsWith, endsWith };
        worker.current.postMessage(event);
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

    const onChangeStartsWith = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (isHex(value)) {
            setStartsWith(value);
        }
    };

    const onChangeEndsWith = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (isHex(value)) {
            setEndsWith(value);
        }
    };

    const startsLength = startsWith.length;
    const endsLength = endsWith.length;
    const criteriaLength = startsLength + endsLength;

    const searchSpace = Math.pow(16, criteriaLength);

    /* HTML */

    return <>

    <h1 className="rainbow">Sui Vanity Address Generator</h1>

    <div id="config">
        <p>Begins with:</p>
        <input type="text" value={startsWith} onChange={onChangeStartsWith} />
        <p>Ends with:</p>
        <input type="text" value={endsWith} onChange={onChangeEndsWith} />
    </div>

    <div className="btn-group">
        <button className="btn" onClick={startWorker} disabled={status !== "stopped"}>Start</button>
        <button className="btn" onClick={stopWorker} disabled={status !== "running"}>Stop</button>
    </div>

    <div className="tight">
        {criteriaLength > 0 &&
        <p>
            Search space: {shortNumber(searchSpace)}
        </p>
        }

        {pairCount > 0 &&
        <p>
            Pairs generated: {shortNumber(pairCount)}
        </p>
    }
    </div>

    {keypairs.length > 0 &&
    <div id="pairs">
        <h2>Keypairs</h2>
        {keypairs.map(pair =>
        <div className="pair" key={pair.address}>
            <div className="short-address">{shortAddress(pair.address, startsLength, endsLength)}</div>
            <div className="address">{pair.address}</div>
            <div className="secret-key">{pair.secretKey}</div>
        </div>)}
    </div>
    }

    </>;
};
