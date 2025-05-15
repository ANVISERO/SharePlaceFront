// src/pages/chat/components/MessageList.jsx
import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { List, Typography, Avatar, Skeleton, Empty } from 'antd';
import dayjs from 'dayjs';
import { roomMessagesAtom, currentUserAtom } from '../../util/ApplicationGlobalState.jsx';
import './MessageList.css';

const { Text, Paragraph } = Typography;

function MessageItem({ message, isCurrentUser }) {
    return (
        <List.Item className={`message-item ${isCurrentUser ? 'current-user' : 'other-user'}`}>
            <List.Item.Meta
                avatar={!isCurrentUser && <Avatar>{message.senderUsername?.[0]?.toUpperCase()}</Avatar>}
                title={!isCurrentUser && <Text strong>{message.senderUsername}</Text>}
                description={
                    <div className="message-content-wrapper">
                        <Paragraph className="message-text">{message.content}</Paragraph>
                        <Text type="secondary" className="message-timestamp">
                            {dayjs(message.timestamp).format('HH:mm')}
                        </Text>
                    </div>
                }
            />
        </List.Item>
    );
}


function MessageList({ loadingMessages }) {
    const messages = useRecoilValue(roomMessagesAtom);
    const currentUser = useRecoilValue(currentUserAtom);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    if (loadingMessages && messages.length === 0) {
        return (
            <div className="message-list-container" style={{ padding: '20px' }}>
                <Skeleton active avatar paragraph={{ rows: 1 }} />
                <Skeleton active avatar paragraph={{ rows: 1 }} />
                <Skeleton active avatar paragraph={{ rows: 1 }} />
            </div>
        );
    }


    if (!loadingMessages && messages.length === 0) {
        return (
            <div className="message-list-container empty-chat">
                <Empty description="Сообщений пока нет. Начните диалог!" />
            </div>
        );
    }

    return (
        <div className="message-list-container">
            <List
                dataSource={messages}
                renderItem={(message) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        isCurrentUser={message.senderId === currentUser.id}
                    />
                )}
            />
            <div ref={messagesEndRef} />
        </div>
    );
}

export default MessageList;
