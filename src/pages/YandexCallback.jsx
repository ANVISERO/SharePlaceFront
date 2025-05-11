import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

const YandexCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        console.log('code')
        console.log(code)

        // if (code) {
        //     // Отправляем код на бэкенд
        //     axios.post('/api/auth/yandex', { code })
        //         .then(response => {
        //             // Сохраняем токен и перенаправляем
        //             localStorage.setItem('token', response.data.token);
        //             navigate('/');
        //         })
        //         .catch(error => {
        //             console.error('Auth error:', error);
        //             navigate('/login');
        //         });
        // }
    }, [location, navigate]);

    return <div>Processing Yandex authentication...</div>;
};

export default YandexCallback;