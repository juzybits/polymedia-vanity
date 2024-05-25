import React, { useEffect, useRef, useState } from "react";
import { AppEvent, WorkerEvent } from "./vanityWorker";

type WorkerStatus = "stopped" | "running";

export const PageHome: React.FC = () =>
{
    /* State */

    const worker = useRef<Worker|null>(null);
    const [ status, setStatus ] = useState<WorkerStatus>("stopped");

    /* Functions */

    useEffect(() => {
        return stopWorker; // clean up when the component unmounts
    }, []);

    const handleWorkerEvent = (evt: MessageEvent<WorkerEvent>) => {
        const e = evt.data;
        if (e.msg === "match") {
            console.log("[app] match:", e.data); // TODO show to user
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

        const event: AppEvent = { msg: "start" };
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

    /* HTML */

    return <>
        <div className="btn-group">
            <button className="btn" onClick={startWorker} disabled={status !== "stopped"}>Start</button>
            <button className="btn" onClick={stopWorker} disabled={status !== "running"}>Stop</button>
        </div>
    </>;
};
