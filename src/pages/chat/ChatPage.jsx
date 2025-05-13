import React, { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const ChatPage = () => {
    const stompClientRef = useRef(null); // Используем ref для хранения экземпляра клиента

    useEffect(() => {
        // Создаем и настраиваем STOMP клиент
        const client = new Client({
            webSocketFactory: () => {
                // URL для SockJS должен быть HTTP или HTTPS
                return new SockJS('http://localhost:8081/ws-chat');
            },
            connectHeaders: {
                // Если ваш STOMP брокер (на сервере) требует какие-то специфичные заголовки
                // для самого STOMP CONNECT фрейма (не для HTTP handshake), их можно добавить сюда.
                // Для аутентификации через HTTP cookie браузера они здесь обычно не нужны.
            },
            debug: (str) => {
                // Логирование отладочной информации от STOMP клиента
                console.log(`STOMP DEBUG: ${new Date().toISOString()} --- ${str}`);
            },
            reconnectDelay: 5000, // Задержка перед попыткой переподключения (в мс)

            onConnect: (frame) => {
                // Этот колбэк вызывается при успешном STOMP подключении
                console.log('STOMP подключение успешно установлено:', frame);
                const userName = frame.headers['user-name']; // Пытаемся извлечь 'user-name' из заголовков ответа CONNECTED
                alert(`STOMP успешно подключен! Пользователь: ${userName || 'не определен (анонимно?)'}`);

                // Здесь вы можете добавить логику после подключения, например, подписку на топики:
                // stompClientRef.current.subscribe('/topic/room/someRoomId', (message) => {
                //   console.log('Получено сообщение:', message.body);
                // });
            },
            onStompError: (frame) => {
                // Ошибки на уровне протокола STOMP (например, если сервер отклонил CONNECT)
                console.error('Ошибка STOMP протокола: ' + frame.headers['message']);
                console.error('Дополнительные детали: ' + frame.body);
                alert('Ошибка STOMP протокола: ' + (frame.headers['message'] || 'Неизвестная STOMP ошибка'));
            },
            onWebSocketError: (event) => {
                // Ошибки на уровне WebSocket (например, если сервер недоступен или отклонил HTTP handshake)
                console.error('Ошибка WebSocket соединения:', event);
                alert('Ошибка WebSocket соединения. Проверьте консоль и убедитесь, что сервер запущен, доступен и аутентификация (если требуется) проходит.');
            },
            onWebSocketClose: (event) => {
                // WebSocket соединение было закрыто
                console.log('WebSocket соединение закрыто:', event);
                // Можно добавить уведомление пользователю
                // alert('WebSocket соединение было закрыто.');
            }
        });

        // Сохраняем экземпляр клиента в ref, чтобы он был доступен в функции очистки
        stompClientRef.current = client;

        // Активируем клиент (начинаем процесс подключения)
        console.log('Активация STOMP клиента...');
        client.activate();

        // Функция очистки, которая будет вызвана при размонтировании компонента
        return () => {
            if (stompClientRef.current && stompClientRef.current.active) {
                console.log('Деактивация STOMP клиента...');
                stompClientRef.current.deactivate();
            }
            stompClientRef.current = null; // Очищаем ref
        };
    }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании и очистится при размонтировании

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Тестовая страница STOMP подключения</h1>
            <p>Идет попытка подключения к WebSocket серверу через STOMP...</p>
            <p>Откройте консоль разработчика (F12) для просмотра подробных логов STOMP DEBUG.</p>
            <hr />
            <h2>Важно для аутентификации:</h2>
            <p>
                Если ваш сервер настроен на аутентификацию WebSocket соединений (что обычно и происходит),
                убедитесь, что вы **предварительно вошли в систему через ваш основной сайт/приложение в этом же браузере** (например, через страницу логина, работающую на <code>http://localhost:8081</code>).
            </p>
            <p>
                Это необходимо для того, чтобы сервер установил в ваш браузер соответствующий
                <code>auth-token</code> cookie. Браузер затем автоматически отправит этот cookie
                при установке WebSocket (SockJS) соединения.
            </p>
        </div>
    );
};

export default ChatPage;