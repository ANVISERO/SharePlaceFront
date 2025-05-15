import React, { useEffect, useState, useCallback } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { Typography, Spin, Alert, Empty, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import MessageList from '../MessageList/MessageList.jsx';
import MessageInput from '../MessageInput/MessageInput.jsx';
import {
    selectedRoomIdAtom,
    selectedRoomAtom,
    roomMessagesAtom,
    stompClientAtom,
    currentUserAtom
} from '../../util/ApplicationGlobalState.jsx';
// import { fetchMessagesForRoom } from '../../service/ChatRoomService.jsx';
import { fetchChatRoomById } from '../../service/ChatRoomService.jsx';
import { subscribeToRoom } from '../../service/WebSocketService.jsx';
import './ChatWindow.css';

const { Title, Text } = Typography;

function ChatWindow({ onBackToList }) {
    const selectedRoomId = useRecoilValue(selectedRoomIdAtom);
    const [selectedRoom, setSelectedRoom] = useRecoilState(selectedRoomAtom);
    const [, setMessages] = useRecoilState(roomMessagesAtom);
    const stompClient = useRecoilValue(stompClientAtom);
    const currentUser = useRecoilValue(currentUserAtom);

    const [loadingRoom, setLoadingRoom] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState('');
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);


    const loadRoomDetails = useCallback(async (roomId) => {
        if (!roomId) return;
        setLoadingRoom(true);
        setError('');
        try {
            const roomData = await fetchChatRoomById(roomId);
            setSelectedRoom(roomData);
        } catch (err) {
            console.error("Error fetching room details:", err);
            setError('Не удалось загрузить детали комнаты.');
        } finally {
            setLoadingRoom(false);
        }
    }, [setSelectedRoom]);

    const loadMessages = useCallback(async (roomId) => {
        if (!roomId) return;
        setLoadingMessages(true);
        setError('');
        try {
            const messagePage = "await fetchMessagesForRoom(roomId, 0, 50);"
            // const messagePage = await fetchMessagesForRoom(roomId, 0, 50);
            setMessages(messagePage.content.reverse());
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError('Не удалось загрузить сообщения.');
        } finally {
            setLoadingMessages(false);
            setInitialLoadComplete(true);
        }
    }, [setMessages]);

    useEffect(() => {
        if (selectedRoomId) {
            setInitialLoadComplete(false);
            setMessages([]);
            setSelectedRoom(null);
            loadRoomDetails(selectedRoomId);
            loadMessages(selectedRoomId);
        } else {
            setMessages([]);
            setSelectedRoom(null);
        }
    }, [selectedRoomId, loadRoomDetails, loadMessages, setMessages, setSelectedRoom]);

    const handleNewMessage = useCallback((newMessage) => {
        if (newMessage.roomId === selectedRoomId) {
            setMessages((prevMessages) => {
                if (prevMessages.find(msg => msg.id === newMessage.id)) {
                    return prevMessages;
                }
                return [...prevMessages, newMessage];
            });
        }
    }, [selectedRoomId, setMessages]);

    useEffect(() => {
        if (stompClient && stompClient.connected && selectedRoomId) {
            subscribeToRoom(stompClient, selectedRoomId, handleNewMessage);
        }
        return () => {
        };
    }, [stompClient, selectedRoomId, handleNewMessage]);


    if (!selectedRoomId) {
        return (
            <div className="chat-window-container placeholder">
                <Empty description="Выберите чат для начала общения" />
            </div>
        );
    }

    if (loadingRoom || (loadingMessages && !initialLoadComplete)) {
        return (
            <div className="chat-window-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" tip="Загрузка чата..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="chat-window-container">
                <Alert message="Ошибка" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!selectedRoom && !loadingRoom) {
        return (
            <div className="chat-window-container placeholder">
                <Empty description="Комната не найдена или доступ запрещен." />
            </div>
        );
    }

    const getRoomDisplayName = () => {
        if (!selectedRoom) return 'Загрузка...';
        if (selectedRoom.type === 'PRIVATE') {
            const otherParticipantId = selectedRoom.participantIds.find(id => id !== currentUser.id);
            return selectedRoom.name || `Чат с ${otherParticipantId || 'пользователем'}`;
        }
        return selectedRoom.name || 'Групповой чат';
    };


    return (
        <div className="chat-window-container">
            <div className="chat-window-header">
                <Button
                    className="back-button-mobile"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBackToList}
                    type="text"
                />
                <Title level={4} style={{ margin: 0 }}>{getRoomDisplayName()}</Title>
            </div>
            <MessageList loadingMessages={loadingMessages && !initialLoadComplete} />
            <div className="message-input-wrapper">
                <MessageInput />
            </div>
        </div>
    );
}

export default ChatWindow;
