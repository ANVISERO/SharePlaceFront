import React from 'react';

const YandexAuth = () => {
    const handleLogin = () => {
        const clientId = '22a312ad87fa4103a246a439d2816388';
        const redirectUri = encodeURIComponent('http://localhost:5173/auth/yandex/callback');
        const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

        window.location.href = authUrl;
    };

    return (
        <button onClick={handleLogin}>
            Войти через Яндекс
        </button>
    );
};

export default YandexAuth;