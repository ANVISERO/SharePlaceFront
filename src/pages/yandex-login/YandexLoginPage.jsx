import React, { useEffect, useCallback } from 'react'; // useCallback может понадобиться если initializeYandexAuth в deps useEffect
import axios from "axios";
import './YandexLoginPage.css'; // Предполагается, что этот файл существует
import Header from "../../components/header/Header.jsx"; // Предполагается, что эти компоненты существуют
import Footer from "../../components/footer/Footer.jsx";


function YandexLoginPage() {

    const fetchAndStoreUserInSession = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/v1/users/me', {
                withCredentials: true
            });
            const userData = response.data;

            if (userData && Object.keys(userData).length > 0) { // Проверяем, что userData не пустой объект
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
                console.log('Данные пользователя УСПЕШНО загружены и сохранены в sessionStorage:', userData);
            } else {
                sessionStorage.removeItem('currentUser');
                console.log('Получены пустые данные пользователя, sessionStorage очищен или не обновлен.');
            }
            return true;
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя (/users/me) для sessionStorage:', error);
            if (error.response) {
                console.error('Данные ошибки от сервера:', error.response.data);
                console.error('Статус ошибки от сервера:', error.response.status);
            }
            sessionStorage.removeItem('currentUser'); // Очищаем при ошибке
            return false;
        }
    }, []); // Нет зависимостей, если setUser Recoil убран

    const initializeYandexAuth = useCallback(() => {
        const yandexButtonContainer = document.getElementById('yandex-auth-button-container');
        if (window.YaAuthSuggest && yandexButtonContainer) {
            yandexButtonContainer.innerHTML = ''; // Очистка перед инициализацией
            window.YaAuthSuggest.init(
                { client_id: '22a312ad87fa4103a246a439d2816388', response_type: 'token', redirect_uri: 'http://localhost:5173/yandex-auth-helper' },
                'http://localhost:5173/',
                { view: 'button', parentId: 'yandex-auth-button-container', buttonView: 'main', buttonTheme: 'light', buttonSize: 'xl', buttonBorderRadius: '26' }
            )
                .then(result => result.handler())
                .then(async (yandexOAuthData) => {
                    console.log('Токен от Яндекса получен: ', yandexOAuthData);
                    try {
                        const backendAuthResponse = await axios.post(
                            'http://localhost:8081/api/v1/auth/yandex/signin',
                            { oauthToken: yandexOAuthData.access_token },
                            { withCredentials: true }
                        );
                        console.log('Ответ от сервера (после /auth/yandex/signin):', backendAuthResponse.data);

                        const userDetailsStoredInSession = await fetchAndStoreUserInSession();

                        if (userDetailsStoredInSession) {
                            alert('Успешная авторизация через Яндекс! Данные пользователя сохранены в сессии браузера.');
                            if (typeof window !== 'undefined') {
                                window.location.href = '/'; // Перенаправляем
                            }
                        } else {
                            alert('Авторизация с Яндексом прошла, но не удалось загрузить/сохранить данные пользователя.');
                            // Можно добавить логику для повторной инициализации кнопки Яндекса
                        }
                    } catch (error) {
                        // ... (обработка ошибок для axios.post) ...
                        console.error('Ошибка при обмене токена или сохранении данных в сессию:', error);
                        alert('Ошибка при обмене токена или сохранении данных в сессию.');
                    }
                })
                .catch(yandexSDKError => {
                    console.error('Ошибка SDK Яндекса:', yandexSDKError);
                    alert('Ошибка SDK Яндекса.');
                });
        } else {
            console.warn('SDK Яндекса или контейнер кнопки не найден. Попытка позже...');
            // Можно добавить setTimeout для повторной попытки, если SDK загружается с задержкой
            // setTimeout(initializeYandexAuth, 1000);
        }
    }, [fetchAndStoreUserInSession]); // fetchAndStoreUserInSession теперь зависимость

    useEffect(() => {
        // ... (ваша логика загрузки скрипта Яндекс SDK, которая вызывает initializeYandexAuth) ...
        if (typeof window !== 'undefined') {
            const scriptId = 'yandex-auth-sdk-script';
            if (document.getElementById(scriptId) && window.YaAuthSuggest) {
                initializeYandexAuth();
                return;
            }
            if (document.getElementById(scriptId) && !window.YaAuthSuggest) {
                return;
            }
            if (document.getElementById(scriptId)) return;

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js';
            script.async = true;
            script.onload = initializeYandexAuth;
            script.onerror = () => console.error('Ошибка загрузки скрипта Яндекс SDK.');
            document.body.appendChild(script);

            return () => {
                const yandexButtonContainer = document.getElementById('yandex-auth-button-container');
                if (yandexButtonContainer) yandexButtonContainer.innerHTML = '';
            };
        }
    }, [initializeYandexAuth]);

    return (
        <>
            <Header/>
            <div className="login-page">
                <div className="login-container">
                    <h2>Вход в аккаунт</h2>
                    <p>Пожалуйста, войдите используя ваш Яндекс ID.</p>
                    <div id="yandex-auth-button-container" className="yandex-button-placeholder"></div>
                </div>
            </div>
            <Footer/>
        </>
    );
}

export default YandexLoginPage;