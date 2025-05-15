import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import './ChatPage.css'; // Импортируем CSS файл

// --- Заглушки данных (mockMessages можно будет полностью убрать, когда загрузка сообщений будет с API) ---
const mockMessages = {
    // chat1: [
    //     { id: 'm1', text: 'Привет! Как твои дела?', senderId: 'chat1', timestamp: '10:30', isMe: false },
    //     { id: 'm2', text: 'Привет! Все отлично, спасибо :) А у тебя?', senderId: 'currentUser', timestamp: '10:31', isMe: true },
    // ],
    // "6825ae2e41b49c2c499cf93f": [
    //     { id: 'api_m1', text: 'Это сообщение из моковых данных для чата с API ID.', senderId: 'someUser', timestamp: '11:00', isMe: false },
    //     { id: 'api_m2', text: 'Понял!', senderId: 'currentUser', timestamp: '11:01', isMe: true },
    // ],
};

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    const words = name.split(' ').filter(Boolean);
    if (words.length === 0) return '??';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};


const ChatPage = () => {
    const stompClientRef = useRef(null);
    const currentSubscriptionRef = useRef(null); // Для хранения текущей подписки
    const [currentUser, setCurrentUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const [loadingChats, setLoadingChats] = useState(false);
    const [chatError, setChatError] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messagesError, setMessagesError] = useState(null);


    // Загрузка данных пользователя из sessionStorage
    useEffect(() => {
        const storedUserData = sessionStorage.getItem('currentUser');
        if (storedUserData) {
            try {
                const userDataObject = JSON.parse(storedUserData);
                setCurrentUser(userDataObject);
                console.log('ChatPage: Данные пользователя загружены из sessionStorage:', userDataObject);
            } catch (e) {
                console.error('ChatPage: Ошибка парсинга данных пользователя из sessionStorage:', e);
            }
        } else {
            console.log('ChatPage: Данные пользователя в sessionStorage не найдены.');
        }
    }, []);

    // Загрузка списка чатов с API
    useEffect(() => {
        if (currentUser && currentUser.id) {
            setLoadingChats(true);
            setChatError(null);
            axios.get('http://localhost:8081/api/chat/rooms', {
                withCredentials: true
            })
                .then(response => {
                    if (response.data && Array.isArray(response.data.content)) {
                        const fetchedChats = response.data.content.map(chat => {
                            let displayName = chat.name || 'Безымянный чат';
                            let displayInitials = getInitials(displayName);

                            if (chat.type === "PRIVATE" && chat.participantsInfo && currentUser) {
                                const participantIds = Object.keys(chat.participantsInfo);
                                const otherParticipantId = participantIds.find(id => id !== String(currentUser.id));

                                if (otherParticipantId && chat.participantsInfo[otherParticipantId]) {
                                    const otherParticipant = chat.participantsInfo[otherParticipantId];
                                    displayName = `${otherParticipant.firstName || ''} ${otherParticipant.surname || ''}`.trim();
                                    if (!displayName) displayName = 'Приватный чат';
                                    displayInitials = getInitials(displayName);
                                } else if (participantIds.length === 1 && participantIds[0] === String(currentUser.id)) {
                                    displayName = chat.name || 'Избранное';
                                    displayInitials = getInitials(displayName);
                                }
                            }

                            return {
                                id: chat.id,
                                name: displayName,
                                avatarInitial: displayInitials,
                                avatarColor: getRandomColor(),
                                lastMessage: 'Нет новых сообщений',
                                timestamp: chat.lastActivityAt ? new Date(chat.lastActivityAt).toLocaleTimeString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Недавно',
                                unread: 0,
                                originalType: chat.type,
                                participantsInfo: chat.participantsInfo,
                            };
                        });
                        setChats(fetchedChats);
                        if (fetchedChats.length > 0 && !selectedChatId) {
                            setSelectedChatId(fetchedChats[0].id);
                        } else if (fetchedChats.length === 0) {
                            setSelectedChatId(null);
                        }
                    } else {
                        setChats([]);
                    }
                })
                .catch(error => {
                    console.error('ChatPage: Ошибка загрузки списка чатов:', error);
                    let errorMsg = 'Не удалось загрузить список чатов.';
                    if (error.response) {
                        errorMsg += ` Статус: ${error.response.status}.`;
                        if (error.response.status === 401) {
                            errorMsg = 'Ошибка авторизации при загрузке чатов. Пожалуйста, войдите снова.';
                        }
                    }
                    setChatError(errorMsg);
                })
                .finally(() => {
                    setLoadingChats(false);
                });
        } else if (!currentUser) {
            setChats([]);
            setSelectedChatId(null);
        }
    }, [currentUser]);


    // Загрузка истории сообщений для выбранного чата
    useEffect(() => {
        if (selectedChatId && currentUser) {
            setLoadingMessages(true);
            setMessagesError(null);
            setMessages([]);
            axios.get(`http://localhost:8081/api/chat/rooms/${selectedChatId}/messages`, {
                withCredentials: true,
                params: { page: 0, size: 50 }
            })
                .then(response => {
                    if (response.data && Array.isArray(response.data.content)) {
                        const fetchedMessages = response.data.content.map(msg => ({
                            id: msg.id,
                            text: msg.content,
                            senderId: msg.senderId,
                            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isMe: String(msg.senderId) === String(currentUser.id),
                        })).reverse();
                        setMessages(fetchedMessages);
                        console.log(`ChatPage: Загружена история сообщений для чата ${selectedChatId}:`, fetchedMessages);
                    } else {
                        setMessages([]);
                    }
                })
                .catch(error => {
                    console.error(`ChatPage: Ошибка загрузки сообщений для чата ${selectedChatId}:`, error);
                    setMessagesError('Не удалось загрузить сообщения.');
                })
                .finally(() => {
                    setLoadingMessages(false);
                });
        } else {
            setMessages([]);
        }
    }, [selectedChatId, currentUser]);

    // Авто-скролл к последнему сообщению
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Логика STOMP клиента
    useEffect(() => {
        if (!currentUser || !selectedChatId) {
            if (stompClientRef.current && stompClientRef.current.active) {
                console.log('ChatPage: Деактивация STOMP из-за отсутствия currentUser или selectedChatId.');
                stompClientRef.current.deactivate();
            }
            return;
        }

        if (stompClientRef.current && stompClientRef.current.connected &&
            currentSubscriptionRef.current && currentSubscriptionRef.current.id.includes(selectedChatId)) {
            console.log(`ChatPage: STOMP уже подключен и подписан на /topic/room/${selectedChatId}`);
            return;
        }

        if (stompClientRef.current) {
            console.log('ChatPage: Деактивация существующего STOMP клиента для переподключения/переподписки.');
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            if(currentSubscriptionRef.current) {
                currentSubscriptionRef.current.unsubscribe();
                currentSubscriptionRef.current = null;
            }
        }

        console.log(`ChatPage: Инициализация STOMP клиента для чата ${selectedChatId}, currentUser: ${currentUser.name}`);
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8081/ws-chat'),
            connectHeaders: {},
            debug: (str) => console.log(`STOMP DEBUG: ${new Date().toISOString()} --- ${str}`),
            reconnectDelay: 5000,
            onConnect: (frame) => {
                console.log('STOMP: Подключение успешно установлено:', frame);
                const serverPrincipalName = frame.headers['user-name'];
                console.log(`STOMP: Сервер идентифицировал как: ${serverPrincipalName || 'не определен'}`);

                if (selectedChatId) {
                    const subscription = client.subscribe(`/topic/room/${selectedChatId}`, (message) => {
                        try {
                            const receivedMessage = JSON.parse(message.body);
                            console.log('STOMP: Получено сообщение:', receivedMessage);

                            if (String(receivedMessage.roomId) === String(selectedChatId)) {
                                setMessages(prevMessages => [
                                    ...prevMessages,
                                    {
                                        id: receivedMessage.id,
                                        text: receivedMessage.content,
                                        senderId: receivedMessage.senderId,
                                        timestamp: new Date(receivedMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        isMe: String(receivedMessage.senderId) === String(currentUser.id),
                                    }
                                ]);
                            } else {
                                console.warn(`STOMP: Получено сообщение для другого чата (${receivedMessage.roomId}), текущий ${selectedChatId}`);
                            }
                        } catch (e) {
                            console.error('STOMP: Ошибка парсинга полученного сообщения', e, message.body);
                        }
                    });
                    currentSubscriptionRef.current = subscription;
                    console.log(`STOMP: Подписан на /topic/room/${selectedChatId}`);
                }
            },
            onStompError: (frame) => {
                console.error('STOMP: Ошибка протокола: ' + frame.headers['message'], frame.body);
            },
            onWebSocketError: (event) => {
                console.error('STOMP: Ошибка WebSocket соединения:', event);
            },
            onWebSocketClose: (event) => {
                console.log('STOMP: WebSocket соединение закрыто:', event);
            }
        });

        stompClientRef.current = client;
        console.log('STOMP: Активация клиента...');
        client.activate();

        return () => {
            console.log(`STOMP: Очистка useEffect для чата ${selectedChatId}. Деактивация клиента.`);
            if (currentSubscriptionRef.current) {
                currentSubscriptionRef.current.unsubscribe();
                console.log(`STOMP: Отписан от /topic/room/${selectedChatId}`);
                currentSubscriptionRef.current = null;
            }
            if (stompClientRef.current && stompClientRef.current.active) {
                stompClientRef.current.deactivate();
                console.log('STOMP: Клиент деактивирован.');
            }
            stompClientRef.current = null;
        };
    }, [currentUser, selectedChatId]);


    const handleSelectChat = (chatId) => {
        console.log('ChatPage: Выбран чат:', chatId);
        setSelectedChatId(chatId);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !selectedChatId || !currentUser || !currentUser.id) {
            console.warn('Невозможно отправить сообщение: нет текста, не выбран чат или отсутствует ID пользователя.');
            return;
        }

        if (stompClientRef.current && stompClientRef.current.connected) {
            // ИЗМЕНЕНО: Payload теперь содержит 'content' и 'userId'
            const payload = {
                content: newMessage,
                userId: String(currentUser.id) // Убедимся, что ID пользователя - строка, если бэкенд ожидает String
            };
            const destination = `/app/chat.sendMessage/${selectedChatId}`;

            try {
                stompClientRef.current.publish({
                    destination: destination,
                    body: JSON.stringify(payload)
                });
                console.log(`STOMP: Сообщение отправлено на ${destination}:`, payload);
                setNewMessage('');
            } catch (error) {
                console.error('STOMP: Ошибка при отправке сообщения:', error);
                alert('Не удалось отправить сообщение.');
            }
        } else {
            console.error('STOMP клиент не подключен. Сообщение не отправлено.');
            alert('Не удалось отправить сообщение. Нет подключения к чат-серверу.');
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.name && chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedChatDetails = chats.find(chat => chat.id === selectedChatId);

    return (
        <div className="chatPageContainer">
            {currentUser && (
                <div className="userInfoHeader">
                    Пользователь: <strong>{currentUser.name} {currentUser.surname}</strong> ({currentUser.email})
                    <span style={{ float: 'right', fontSize: '0.9em', color: '#555' }}>
                        STOMP: {stompClientRef.current?.connected ? 'Подключен' : (stompClientRef.current?.active ? 'Подключение...' : 'Отключен')}
                    </span>
                </div>
            )}
            {!currentUser && (
                <div className="userInfoHeader userInfoHeaderError">
                    Пользователь не аутентифицирован. Для использования чата <a href="/login" style={{color: '#c62828', fontWeight: 'bold'}}>войдите в систему</a>.
                </div>
            )}

            {currentUser && (
                <div className="chatLayout">
                    <div className="sidebar">
                        <div className="searchBar">
                            <input
                                type="text"
                                placeholder="Поиск или новый чат..."
                                className="searchInput"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="chatList">
                            {loadingChats && <p className="chatsNotFoundMessage">Загрузка чатов...</p>}
                            {chatError && <p className="chatsNotFoundMessage" style={{color: 'red'}}>{chatError}</p>}
                            {!loadingChats && !chatError && filteredChats.map(chat => (
                                <div
                                    key={chat.id}
                                    className={`chatListItem ${selectedChatId === chat.id ? 'chatListItemSelected' : ''}`}
                                    onClick={() => handleSelectChat(chat.id)}
                                >
                                    <div className="avatar" style={{backgroundColor: chat.avatarColor || '#007bff'}}>
                                        {chat.avatarInitial}
                                    </div>
                                    <div className="chatInfo">
                                        <div className="chatName">{chat.name}</div>
                                        <div className="lastMessage">{chat.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                            {!loadingChats && !chatError && filteredChats.length === 0 && chats.length > 0 && searchTerm && (
                                <p className="chatsNotFoundMessage">Чаты не найдены по вашему запросу.</p>
                            )}
                            {!loadingChats && !chatError && chats.length === 0 && (
                                <p className="chatsNotFoundMessage">У вас пока нет чатов.</p>
                            )}
                        </div>
                    </div>

                    <div className="mainChatArea">
                        {selectedChatDetails ? (
                            <>
                                <div className="chatHeader">
                                    <div className="avatar" style={{backgroundColor: selectedChatDetails.avatarColor || '#007bff'}}>
                                        {selectedChatDetails.avatarInitial}
                                    </div>
                                    {selectedChatDetails.name}
                                </div>
                                <div className="messageArea">
                                    {loadingMessages && <p style={{textAlign: 'center'}}>Загрузка сообщений...</p>}
                                    {messagesError && <p style={{textAlign: 'center', color: 'red'}}>{messagesError}</p>}
                                    {!loadingMessages && !messagesError && messages.length === 0 && (
                                        <p style={{textAlign: 'center', color: '#777'}}>Сообщений пока нет.</p>
                                    )}
                                    <div className="messageListContent">
                                        {messages.map(msg => (
                                            <div
                                                key={msg.id}
                                                className={`messageBubble ${msg.isMe ? 'myMessage' : 'otherMessage'}`}
                                            >
                                                {msg.text}
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                                <div className="messageInputArea">
                                    <input
                                        type="text"
                                        placeholder="Напишите сообщение..."
                                        className="messageInput"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={!currentUser || loadingMessages}
                                    />
                                    <button
                                        className="sendButton"
                                        onClick={handleSendMessage}
                                        disabled={!currentUser || newMessage.trim() === '' || loadingMessages}
                                    >
                                        &uarr;
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="noChatSelectedPlaceholder">
                                {loadingChats ? (
                                    <p>Загрузка чатов...</p>
                                ) : chatError ? (
                                    <p style={{color: 'red'}}>{chatError}</p>
                                ) : chats.length > 0 ? (
                                    <>
                                        <img src="https://placehold.co/100x100/e0e0e0/757575?text=Чат" alt="Иконка чата" />
                                        Выберите чат для начала общения
                                    </>
                                ) : (
                                    <p>У вас пока нет доступных чатов. Создайте новый!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
