import { useAppState } from '../hooks/useAppState';

export function ReadyStateChecker() {
    const { app } = useAppState();
    const readyState = app.ready ? 'YES' : 'NO';

    return (
        <div>
            <p>App Ready: <span>{readyState}</span></p>
        </div>
    );
}