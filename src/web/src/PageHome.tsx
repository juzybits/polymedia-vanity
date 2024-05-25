import React, { useEffect, useRef, useState } from "react";
import { AppStartEvent, WorkerEvent } from "./vanityWorker";

type WorkerStatus = "stopped" | "running";

export const PageHome: React.FC = () =>
{
    /* State */

    const worker = useRef<Worker|null>(null);
    const [ status, setStatus ] = useState<WorkerStatus>("stopped");
    const [ startsWith, setStartsWith ] = useState<string>("ab");
    const [ endsWith, setEndsWith ] = useState<string>("");

    /* Functions */

    useEffect(() => {
        return stopWorker; // clean up when the component unmounts
    }, []);

    const handleWorkerEvent = (evt: MessageEvent<WorkerEvent>) => {
        const e = evt.data;
        if (e.msg === "match") {
            console.log("[app] match:", e.data.address); // TODO show to user
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

        const event: AppStartEvent = {
            msg: "start",
            data: { startsWith, endsWith },
        };
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

    /* HTML */

    return <>
    <div id="config">
        <span>Begins with:</span>
        <input type="text" value={startsWith} onChange={onChangeStartsWith} />
        <span>Ends with:</span>
        <input type="text" value={endsWith} onChange={onChangeEndsWith} />
    </div>
    <div className="btn-group">
        <button className="btn" onClick={startWorker} disabled={status !== "stopped"}>Start</button>
        <button className="btn" onClick={stopWorker} disabled={status !== "running"}>Stop</button>
    </div>
    </>;
};

const isHex = (str: string) => /^[0-9a-fA-F]*$/.test(str);
