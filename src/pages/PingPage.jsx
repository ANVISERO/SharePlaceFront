import { useEffect, useState } from 'react';
import axios from 'axios';

function PingPage() {
    const [pingResult, setPingResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8081/v1/ping', {
            withCredentials: true
        })
            .then(response => {
                setPingResult(response.data);
            })
            .catch(err => {
                console.error('Ошибка запроса /v1/ping:', err);
                setError(err.response?.data || err.message);
            });
    }, []);

    return (
        <div>
            <h1>Ping от сервера</h1>
            {pingResult && (
                <pre>{JSON.stringify(pingResult, null, 2)}</pre>
            )}
            {error && (
                <p style={{ color: 'red' }}>Ошибка: {JSON.stringify(error)}</p>
            )}
        </div>
    );
}

export default PingPage;