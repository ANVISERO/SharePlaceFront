// src/pages/chat/components/MessageInput.jsx
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Input, Button, Form, Row, Col } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { currentUserAtom, selectedRoomIdAtom, stompClientAtom } from '../../util/ApplicationGlobalState.jsx';
import { sendMessage as sendWsMessage } from '../../service/WebSocketService.jsx';

function MessageInput() {
    const [form] = Form.useForm();
    const currentUser = useRecoilValue(currentUserAtom);
    const selectedRoomId = useRecoilValue(selectedRoomIdAtom);
    const stompClient = useRecoilValue(stompClientAtom);
    const [sending, setSending] = useState(false);

    const handleSendMessage = async (values) => {
        if (!values.content || !selectedRoomId || !stompClient || !currentUser) return;
        setSending(true);
        const messagePayload = {
            content: values.content,
            senderUsername: currentUser.username,
        };

        try {
            sendWsMessage(stompClient, selectedRoomId, messagePayload);
            form.resetFields();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    if (!selectedRoomId) {
        return null;
    }

    return (
        <Form form={form} onFinish={handleSendMessage} className="message-input-form">
            <Row gutter={8}>
                <Col flex="auto">
                    <Form.Item
                        name="content"
                        rules={[{ required: true, message: 'Сообщение не может быть пустым' }]}
                    >
                        <Input.TextArea
                            placeholder="Введите ваше сообщение..."
                            autoSize={{ minRows: 1, maxRows: 3 }}
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    form.submit();
                                }
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SendOutlined />}
                            loading={sending}
                            disabled={!stompClient?.connected}
                        >
                            Отправить
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}

export default MessageInput;
