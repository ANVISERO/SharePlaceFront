import { useEffect } from 'react';

function YandexAuthHelper() {
    useEffect(() => {
        // Загружаем скрипт Яндекс SDK
        const script = document.createElement('script');
        script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js';
        script.async = true;
        script.onload = () => {
            window.YaSendSuggestToken(window.location.origin, {
                "kek": true
            })
                .then(data => {
                    console.log('Auth success:', data);
                    // Здесь можно обработать успешную авторизацию
                })
                .catch(error => {
                    console.error('Auth error:', error);
                });
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div style={{
            background: '#eee',
            margin: 0,
            padding: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div>Processing Yandex authentication...</div>
        </div>
    );
}

export default YandexAuthHelper;