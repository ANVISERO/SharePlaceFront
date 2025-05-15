// src/pages/chat/components/ChatRoomList.jsx
import React, { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { List, Typography, Spin, Alert, Button, Input } from 'antd';
import { PlusOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';
import { chatRoomsAtom, selectedRoomIdAtom, currentUserAtom } from '../../util/ApplicationGlobalState.jsx';
import { fetchChatRooms } from '../../service/ChatRoomService.jsx';
import CreateChatRoomModal from '../CreateChatRoomModal/CreateChatRoomModal.jsx';
import './ChatRoomList.css';

dayjs.extend(relativeTime);
dayjs.locale('ru');

const { Text } = Typography;

function ChatRoomList({ onRoomSelect }) {
    const [rooms, setRooms] = useRecoilState(chatRoomsAtom);
    const [selectedRoomId, setSelectedRoomId] = useRecoilState(selectedRoomIdAtom);
    const currentUser = useRecoilValue(currentUserAtom);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadRooms = async () => {
        setLoading(true);
        setError('');
        try {
            const roomPage = await fetchChatRooms();
            setRooms(roomPage.content || []);
        } catch (err) {
            setError('Не удалось загрузить список чатов.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    const handleRoomClick = (roomId) => {
        setSelectedRoomId(roomId);
        if (onRoomSelect) {
            onRoomSelect(roomId);
        }
    };

    const handleModalOpen = () => setIsModalVisible(true);
    const handleModalClose = () => setIsModalVisible(false);
    const handleRoomCreated = (newRoom) => {
        setRooms(prevRooms => [newRoom, ...prevRooms.filter(r => r.id !== newRoom.id)]);
        setSelectedRoomId(newRoom.id);
        if (onRoomSelect) onRoomSelect(newRoom.id);
        setIsModalVisible(false);
    };

    const getRoomDisplayName = (room) => {
        if (room.type === 'PRIVATE') {
            const otherParticipantId = room.participantIds.find(id => id !== currentUser.id);
            return room.name || `Чат с ${otherParticipantId || 'пользователем'}`;
        }
        return room.name || 'Групповой чат';
    };

    const filteredRooms = rooms.filter(room =>
        getRoomDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="chatroom-list-loading"><Spin tip="Загрузка чатов..." /></div>;
    }

    if (error) {
        return <Alert message="Ошибка" description={error} type="error" showIcon />;
    }

    return (
        <div className="chatroom-list-container">
            <div className="chatroom-list-header">
                <Input
                    placeholder="Поиск чатов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: 8 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleModalOpen}
                    block
                >
                    Создать чат
                </Button>
            </div>
            <List
                className="chatroom-list"
                itemLayout="horizontal"
                dataSource={filteredRooms}
                renderItem={(room) => (
                    <List.Item
                        onClick={() => handleRoomClick(room.id)}
                        className={room.id === selectedRoomId ? 'selected' : ''}
                        actions={[<Text type="secondary" key={`time-${room.id}`} style={{fontSize: '0.8em'}}>{dayjs(room.lastActivityAt).fromNow(true)}</Text>]}
                    >
                        <List.Item.Meta
                            avatar={room.type === 'GROUP' ? <Avatar icon={<TeamOutlined />} /> : <Avatar icon={<UserOutlined />} />}
                            title={<Text ellipsis>{getRoomDisplayName(room)}</Text>}
                            description={<Text type="secondary" ellipsis>
                                {room.lastMessageSnippet || 'Нет сообщений'}
                            </Text>}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: <Text type="secondary">Чаты не найдены</Text> }}
            />
            <CreateChatRoomModal
                visible={isModalVisible}
                onClose={handleModalClose}
                onRoomCreated={handleRoomCreated}
            />
        </div>
    );
}

export default ChatRoomList;
