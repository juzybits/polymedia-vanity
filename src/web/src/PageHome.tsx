import React, { useState, useEffect, useRef } from 'react';

export const PageHome: React.FC = () => {
    const [worker, setWorker] = useState<Worker | null>(null);
    const stopRequested = useRef(false); // Tracks whether the user requested to stop the worker

    const restartWorker = () => {
        // Check if stop was requested by the user
        if (stopRequested.current) {
            console.debug('Worker stop requested, not restarting.');
            return;
        }

        // Terminate the existing worker if it exists
        if (worker) {
            worker.terminate();
        }

        // Create a new worker and set up message handling
        const newWorker = new Worker(new URL('./grindWorker.ts', import.meta.url), { type: 'module' });
        newWorker.onmessage = (e: MessageEvent) => {
            console.debug(e.data);
        };
        newWorker.postMessage('start');
        console.debug('Worker started');

        // Update the state to hold the new worker
        setWorker(newWorker);

        // Automatically stop and restart the worker after its lifetime expires
        setTimeout(() => {
            restartWorker(); // Recursively restart the worker
        }, 10_000);
    };

    const startGrind = () => {
        stopRequested.current = false; // Reset the stop requested flag
        if (!worker) {
            restartWorker();
        }
    };

    const stopGrind = () => {
        if (worker) {
            stopRequested.current = true; // Set the flag to true as stop is requested by the user
            worker.terminate();
            setWorker(null);
            console.debug('Worker stopped');
        }
    };

    // Ensure the worker is cleaned up when the component unmounts
    useEffect(() => {
        return () => {
            if (worker) {
                worker.terminate();
            }
        };
    }, [worker]);

    return (
        <div id='page-home' className='page'>
            <div className='btn-group'>
                <button className='btn' onClick={startGrind} disabled={!!worker}>Start</button>
                <button className='btn' onClick={stopGrind} disabled={!worker}>Stop</button>
            </div>
        </div>
    );
};
