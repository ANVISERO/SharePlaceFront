import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Modal, Form, Input, Select, Button, message as antdMessage } from 'antd';
import { createChatRoom } from '../../service/ChatRoomService.jsx';
import { currentUserAtom } from '../../util/ApplicationGlobalState.jsx';
import { RoomType } from '../../util/ApiClient.jsx';

const { Option } = Select;

function CreateChatRoomModal({ visible, onClose, onRoomCreated }) {
    const [form] = Form.useForm();
    const currentUser = useRecoilValue(currentUserAtom);
    const [loading, setLoading] = useState(false);
    const [roomType, setRoomType] = useState(RoomType.PRIVATE);

    const handleRoomTypeChange = (value) => {
        setRoomType(value);
        form.setFieldsValue({ name: '' });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const participantIds = values.participantIdsString
                ? values.participantIdsString.split(',').map(id => id.trim()).filter(id => id !== currentUser.id && id !== '')
                : [];

            if (values.type === RoomType.PRIVATE && participantIds.length !== 1) {
                antdMessage.error('Для приватного чата должен быть указан один ID участника (кроме вашего).');
                setLoading(false);
                return;
            }
            if (values.type === RoomType.GROUP && participantIds.length === 0) {
                antdMessage.error('Для группового чата должен быть указан хотя бы один ID участника (кроме вашего) или оставьте поле пустым, если это чат только с самим собой (для заметок).');
            }

            const request = {
                name: values.type === RoomType.GROUP ? values.name : null,
                participantIds: participantIds,
                type: values.type,
            };

            const newRoom = await createChatRoom(request);
            antdMessage.success(`Чат "${newRoom.name || 'Приватный чат'}" успешно создан!`);
            onRoomCreated(newRoom);
            form.resetFields();
            setRoomType(RoomType.PRIVATE);
        } catch (error) {
            console.error("Failed to create chat room:", error);
            antdMessage.error(error.response?.data?.message || 'Не удалось создать чат. Проверьте ID участников.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Создать новый чат"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Отмена
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Создать
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" initialValues={{ type: RoomType.PRIVATE }}>
                <Form.Item
                    name="type"
                    label="Тип чата"
                    rules={[{ required: true, message: 'Выберите тип чата' }]}
                >
                    <Select onChange={handleRoomTypeChange}>
                        <Option value={RoomType.PRIVATE}>Приватный</Option>
                        <Option value={RoomType.GROUP}>Групповой</Option>
                    </Select>
                </Form.Item>

                {roomType === RoomType.GROUP && (
                    <Form.Item
                        name="name"
                        label="Название группового чата"
                        rules={[{ required: true, message: 'Введите название группы' }]}
                    >
                        <Input placeholder="Название группы" />
                    </Form.Item>
                )}

                <Form.Item
                    name="participantIdsString"
                    label={roomType === RoomType.PRIVATE ? "ID участника" : "ID участников (через запятую)"}
                    help={roomType === RoomType.PRIVATE ? "Введите ID одного пользователя для приватного чата." : "Введите ID пользователей через запятую. Ваш ID будет добавлен автоматически."}
                    rules={[
                        {
                            required: roomType === RoomType.PRIVATE,
                            message: 'Укажите ID участника для приватного чата',
                        },
                    ]}
                >
                    <Input placeholder={roomType === RoomType.PRIVATE ? "ID пользователя" : "user2_id, user3_id"} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default CreateChatRoomModal;
