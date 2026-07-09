import { useState, useEffect } from 'react';

const useSessionState = (key, initialValue) => {
    const [state, setState] = useState(() => {
        const stored = sessionStorage.getItem(key);
        if (stored !== null) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return stored;
            }
        }
        return initialValue;
    });

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
};

export default useSessionState;
