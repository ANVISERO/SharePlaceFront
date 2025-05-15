import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PingPage() {
    // Существующее состояние для результатов ping-запроса
    const [pingResult, setPingResult] = useState(null);
    const [error, setError] = useState(null);

    // Новое состояние для хранения данных пользователя из sessionStorage
    const [currentUser, setCurrentUser] = useState(null);

    // Эффект для загрузки данных пользователя из sessionStorage при монтировании компонента
    useEffect(() => {
        const storedUserData = sessionStorage.getItem('currentUser');
        if (storedUserData) {
            try {
                const userDataObject = JSON.parse(storedUserData);
                setCurrentUser(userDataObject);
                console.log('PingPage: Данные пользователя загружены из sessionStorage:', userDataObject);
            } catch (e) {
                console.error('PingPage: Ошибка парсинга данных пользователя из sessionStorage:', e);
                sessionStorage.removeItem('currentUser'); // Удаляем поврежденные данные
            }
        } else {
            console.log('PingPage: Данные пользователя в sessionStorage не найдены.');
        }
    }, []); // Пустой массив зависимостей - выполняется один раз при монтировании

    // Существующий useEffect для выполнения ping-запроса (остается без изменений)
    useEffect(() => {
        axios.get('http://localhost:8081/api/v1/v1/ping', {
            withCredentials: true
        })
            .then(response => {
                setPingResult(response.data);
                setError(null);
            })
            .catch(err => {
                console.error('Ошибка запроса /v1/ping:', err);
                setPingResult(null);
                const errorMessage = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : err.message;
                setError(`Ошибка ping: ${errorMessage}`);
            });
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Блок для отображения данных пользователя из состояния компонента (загруженных из sessionStorage) */}
            {currentUser ? (
                <div style={{ border: '1px solid #007bff', padding: '15px', marginBottom: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                    <h2>Данные текущего пользователя (из sessionStorage):</h2>
                    <p><strong>ID:</strong> {currentUser.id}</p>
                    <p><strong>Имя:</strong> {currentUser.name} {currentUser.surname}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    {currentUser.phone && <p><strong>Телефон:</strong> {currentUser.phone}</p>}
                    <button onClick={() => console.log('Текущий currentUser на PingPage (из state):', currentUser)}>
                        Лог currentUser в консоль
                    </button>
                </div>
            ) : (
                <div style={{ border: '1px solid #ffc107', padding: '15px', marginBottom: '20px', backgroundColor: '#fff9e6', borderRadius: '8px' }}>
                    <p><strong>Данные о пользователе не найдены в сессии браузера.</strong> Возможно, вы не вошли в систему.</p>
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            <h1>Ping от сервера</h1>
            {/* ... (ваш существующий JSX для отображения pingResult и error) ... */}
            {pingResult !== null && (
                <div>
                    <p>Результат ping:</p>
                    <pre>{typeof pingResult === 'object' ? JSON.stringify(pingResult, null, 2) : String(pingResult)}</pre>
                </div>
            )}
            {error && (
                <p style={{ color: 'red' }}>{error}</p>
            )}
            {!pingResult && !error && !currentUser && ( // Показываем "Загрузка" если нет ни ping, ни user
                <p>Загрузка данных...</p>
            )}
        </div>
    );
}

export default PingPage;