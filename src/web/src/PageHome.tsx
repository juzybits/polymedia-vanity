import React, { useEffect, useRef } from "react";
import { AppEvent, WorkerEvent } from "./grindWorker";

export const PageHome: React.FC = () =>
{
    /* State */

    const worker = useRef<Worker|null>(null);

    /* Functions */

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

        console.debug("[app] starting worker");

        const newWorker = new Worker(
            new URL("./grindWorker.ts", import.meta.url),
            { type: "module" },
        );
        newWorker.onmessage = handleWorkerEvent;

        worker.current = newWorker;

        const event: AppEvent = { msg: "start" };
        newWorker.postMessage(event);
    };

    const stopWorker = () => {
        if (!worker.current) {
            console.warn("[app] worker already stopped");
            return;
        }
        console.debug("[app] stopping worker");
        worker.current.terminate();
        worker.current = null;
    };

    // Ensure the worker is cleaned up when the component unmounts
    useEffect(() => {
        return stopWorker;
    }, []);

    /* HTML */

    return <>
        <div className="btn-group">
            <button className="btn" onClick={startWorker}>Start</button>
            <button className="btn" onClick={stopWorker}>Stop</button>
        </div>
    </>;
};
