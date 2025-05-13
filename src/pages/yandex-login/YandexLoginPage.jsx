import {useEffect} from 'react';
import axios from "axios";
import './YandexLoginPage.css';
import Header from "../../components/header/Header.jsx";
import Footer from "../../components/footer/Footer.jsx";

function YandexLoginPage() {

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const scriptId = 'yandex-auth-sdk-script';
            if (document.getElementById(scriptId)) {
                initializeYandexAuth();
                return;
            }

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js';
            script.async = true;
            script.onload = initializeYandexAuth;
            script.onerror = () => console.error('Ошибка загрузки скрипта Яндекс SDK.');
            document.body.appendChild(script);

            return () => {
                const yandexButtonContainer = document.getElementById('yandex-auth-button-container');
                if (yandexButtonContainer) {
                    yandexButtonContainer.innerHTML = '';
                }
            };
        }
    }, []);

    const initializeYandexAuth = () => {
        if (window.YaAuthSuggest && document.getElementById('yandex-auth-button-container')) {
            window.YaAuthSuggest.init(
                {
                    client_id: '22a312ad87fa4103a246a439d2816388',
                    response_type: 'token',
                    redirect_uri: 'http://localhost:5173/yandex-auth-helper'
                },
                'http://localhost:5173/',
                {
                    view: 'button',
                    parentId: 'yandex-auth-button-container',
                    buttonView: 'main',
                    buttonTheme: 'light',
                    buttonSize: 'xl',
                    buttonBorderRadius: '26'
                }
            )
                .then(function (result) {
                    return result.handler();
                })
                .then(async function (data) {
                    console.log('Токен от Яндекса получен: ', data);

                    try {
                        const response = await axios.post(
                            'http://localhost:8081/api/v1/auth/yandex/signin',
                            {oauthToken: data.access_token},
                            {
                                withCredentials: true
                            }
                        );

                        console.log('Ответ от сервера (после отправки токена):', response.data);
                        alert('Успешная авторизация через Яндекс! Данные пользователя: ' + JSON.stringify(response.data));
                        if (typeof window !== 'undefined') {
                            window.location.href = '/';
                        }

                    } catch (error) {
                        if (error.response) {
                            console.error('Ошибка от сервера:', error.response.data);
                            alert('Ошибка при обмене токена на сервере: ' + JSON.stringify(error.response.data));
                        } else {
                            console.error('Ошибка сети или Axios:', error.message);
                            alert('Сетевая ошибка или ошибка конфигурации запроса: ' + error.message);
                        }
                    }
                })
                .catch(function (error) {
                    console.error('Ошибка при инициализации виджета Яндекса или в процессе авторизации: ', error);
                });
        } else {
            console.warn('SDK Яндекса (YaAuthSuggest) еще не загружен или контейнер кнопки не найден.');
        }
    };

    return (
        <>
            <Header/>
            <div className="login-page">
                <div className="login-container">
                    <h2>Вход в аккаунт</h2>
                    <p>Пожалуйста, войдите используя ваш Яндекс ID.</p>
                    <div id="yandex-auth-button-container" className="yandex-button-placeholder">
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}

export default YandexLoginPage;