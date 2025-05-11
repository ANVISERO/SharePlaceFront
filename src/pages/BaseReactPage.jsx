import { useState, useEffect } from 'react';
import reactLogo from './../assets/react.svg';
import viteLogo from '/vite.svg';
import YandexAuth from "./../components/YandexAuth.jsx";

function BaseReactPage() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Проверяем, что код выполняется на клиенте (не во время SSR)
        if (typeof window !== 'undefined') {
            // Загружаем скрипт Yandex SDK динамически
            const script = document.createElement('script');
            script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js';
            script.async = true;
            script.onload = initializeYandexAuth;
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, []);

    const initializeYandexAuth = () => {
        if (window.YaAuthSuggest) {
            window.YaAuthSuggest.init(
                {
                    client_id: '22a312ad87fa4103a246a439d2816388',
                    response_type: 'token',
                    redirect_uri: 'http://localhost:5173/yandex-auth-helper'
                },
                'http://localhost:5173/',
                {
                    view: 'button',
                    parentId: 'container',
                    buttonView: 'main',
                    buttonTheme: 'light',
                    buttonSize: 'xl',
                    buttonBorderRadius: '26'
                }
            )
                .then(function(result) {
                    return result.handler();
                })
                .then(function(data) {
                    console.log('Сообщение с токеном: ', data);
                    // Здесь можно сохранить токен в состоянии или отправить на сервер

                })
                .catch(function(error) {
                    console.log('Что-то пошло не так: ', error);
                });
        }
    };

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                {/*<YandexAuth/>*/}
                {/* Контейнер для кнопки Яндекс ID */}
                <div id="container"></div>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default BaseReactPage;