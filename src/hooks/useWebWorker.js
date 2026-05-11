import { useEffect, useRef, useCallback, useState } from 'react';

export const useDataProcessor = () => {
    const workerRef = useRef(null);
    const requestIdRef = useRef(0);
    const callbacksRef = useRef(new Map());
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Create worker
        workerRef.current = new Worker('/workers/dataProcessor.worker.js');
        
        workerRef.current.onmessage = (e) => {
            const { type, data, requestId } = e.data;
            const callback = callbacksRef.current.get(requestId);
            
            if (callback) {
                callback(data);
                callbacksRef.current.delete(requestId);
            }
        };

        workerRef.current.onerror = (error) => {
            console.error('Worker error:', error);
        };

        setIsReady(true);

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const processEventData = useCallback((eventData) => {
        return new Promise((resolve) => {
            if (!workerRef.current || !isReady) {
                resolve({ regularGroups: [], sessionGroups: [], isEmpty: true });
                return;
            }

            const requestId = ++requestIdRef.current;
            callbacksRef.current.set(requestId, resolve);

            workerRef.current.postMessage({
                type: 'PROCESS_EVENT_DATA',
                data: { eventData, requestId }
            });
        });
    }, [isReady]);


    return {
        processEventData,
        isReady
    };
};
