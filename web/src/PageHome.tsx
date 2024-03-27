import React, { useState } from 'react';

export const PageHome: React.FC = () => {
    const [worker, setWorker] = useState<Worker|null>(null);

    const startGrind = () => {
        if (worker) {
            return;
        }

        const newWorker = new Worker(
            new URL('./grindWorker.ts', import.meta.url),
            { type: 'module' }
        );
        setWorker(newWorker);

        newWorker.onmessage = (e: MessageEvent<string>) => {
            console.debug('address:', e.data);
        };

        newWorker.postMessage('start');

        console.debug('grind started');
    };

    const stopGrind = () => {
        if (worker) {
            worker.terminate();
            setWorker(null);
            console.debug('grind stopped');
        }
    };

    return (
        <div id='page-home' className='page'>
            <div className='btn-group'>
                <button className='btn' onClick={startGrind} disabled={!!worker}>Start</button>
                <button className='btn' onClick={stopGrind} disabled={!worker}>Stop</button>
            </div>
        </div>
    );
};
