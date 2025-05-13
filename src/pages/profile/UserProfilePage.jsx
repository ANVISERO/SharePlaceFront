import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Input, Select, DatePicker, Spin, Alert, Typography, Image, Row, Col } from "antd";
import dayjs from 'dayjs';
import './UserProfilePage.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const API_BASE_URL = 'http://localhost:8081/api/v1/users';

function UserProfilePage() {
    const [form] = Form.useForm();
    const [initialUserData, setInitialUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await axios.get(`${API_BASE_URL}/me`, {
                withCredentials: true,
            });
            const fetchedData = response.data;
            const initializedData = {
                id: fetchedData.id || null,
                name: fetchedData.name || '',
                surname: fetchedData.surname || '',
                email: fetchedData.email || '',
                phone: fetchedData.phone || '',
                profilePictureUrl: fetchedData.profilePictureUrl || '',
                birthday: fetchedData.birthday ? dayjs(fetchedData.birthday) : null,
                sex: fetchedData.sex || 'НЕ_УКАЗАН',
                profession: fetchedData.profession || '',
                aboutMe: fetchedData.aboutMe || '',
                languages: fetchedData.languages || '',
                createdAt: fetchedData.createdAt || '',
                updatedAt: fetchedData.updatedAt || '',
            };
            form.setFieldsValue(initializedData);
            setInitialUserData(JSON.parse(JSON.stringify(initializedData)));
            setLoading(false);
            setHasChanges(false);
        } catch (err) {
            console.error("Ошибка при загрузке профиля:", err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Не удалось загрузить данные профиля.'
            );
            setLoading(false);
        }
    }, [form]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const onValuesChange = (changedValues, allValues) => {
        setSuccessMessage('');
        const currentDataForComparison = {
            ...allValues,
            birthday: allValues.birthday ? allValues.birthday.format('YYYY-MM-DD') : null,
        };
        const initialDataForComparison = {
            ...initialUserData,
            birthday: initialUserData?.birthday ? dayjs(initialUserData.birthday).format('YYYY-MM-DD') : null,
        };
        setHasChanges(JSON.stringify(currentDataForComparison) !== JSON.stringify(initialDataForComparison));
    };

    const onFinish = async (values) => {
        if (!initialUserData || initialUserData.id == null) {
            setError('ID пользователя не определен. Невозможно сохранить изменения.');
            return;
        }
        setError('');
        setSuccessMessage('');
        setSaving(true);

        const dataToSend = {
            ...values,
            birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
            id: initialUserData.id,
            email: initialUserData.email,
        };

        try {
            const response = await axios.put(
                `${API_BASE_URL}/${initialUserData.id}/profile`,
                dataToSend,
                {
                    withCredentials: true,
                }
            );
            const updatedData = response.data;
            const initializedData = {
                ...updatedData,
                birthday: updatedData.birthday ? dayjs(updatedData.birthday) : null,
            };
            form.setFieldsValue(initializedData);
            setInitialUserData(JSON.parse(JSON.stringify(initializedData)));
            setSuccessMessage('Профиль успешно обновлен!');
            setHasChanges(false);
        } catch (err) {
            console.error("Ошибка при сохранении профиля:", err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'Не удалось сохранить изменения.'
            );
        } finally {
            setSaving(false);
        }
    };


    if (loading && !initialUserData) {
        return (
            <div className="profile-page-spinner">
                <Spin size="large" tip="Загрузка данных профиля..." />
            </div>
        );
    }

    if (error && !initialUserData) {
        return (
            <div className="profile-page-container">
                <Alert
                    message="Ошибка загрузки профиля"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button type="primary" onClick={fetchUserProfile}>
                            Попробовать снова
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!initialUserData && !loading) {
        return <div className="profile-page-container"><Alert message="Данные профиля не найдены." type="warning" showIcon /></div>;
    }


    return (
        <div className="profile-page-container">
            <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Личный кабинет</Title>
            {error && !successMessage && <Alert message="Ошибка" description={error} type="error" closable onClose={() => setError('')} style={{ marginBottom: '16px' }} />}
            {successMessage && <Alert message="Успех" description={successMessage} type="success" closable onClose={() => setSuccessMessage('')} style={{ marginBottom: '16px' }} />}

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={onValuesChange}
                className="profile-form"
                initialValues={{
                    ...initialUserData,
                    birthday: initialUserData?.birthday ? dayjs(initialUserData.birthday) : null,
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Имя"
                            name="name"
                            rules={[{ required: true, message: 'Пожалуйста, введите ваше имя!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Фамилия"
                            name="surname"
                            rules={[{ required: true, message: 'Пожалуйста, введите вашу фамилию!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Пожалуйста, введите корректный email!' }]}
                    help="Email нельзя изменить через эту форму."
                >
                    <Input readOnly />
                </Form.Item>

                <Form.Item
                    label="Телефон"
                    name="phone"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="URL фото профиля"
                    name="profilePictureUrl"
                    rules={[{ type: 'url', message: 'Пожалуйста, введите корректный URL!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    shouldUpdate={(prevValues, currentValues) => prevValues.profilePictureUrl !== currentValues.profilePictureUrl}
                >
                    {({ getFieldValue }) => {
                        const profilePictureUrl = getFieldValue('profilePictureUrl');
                        return profilePictureUrl ? (
                            <Image
                                width={150}
                                src={profilePictureUrl}
                                alt="Предпросмотр фото"
                                style={{ marginBottom: '16px', borderRadius: '8px', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : null;
                    }}
                </Form.Item>

                <Row gutter={24}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Дата рождения"
                            name="birthday"
                        >
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Пол"
                            name="sex"
                        >
                            <Select>
                                <Option value="НЕ_УКАЗАН">Не указан</Option>
                                <Option value="МУЖСКОЙ">Мужской</Option>
                                <Option value="ЖЕНСКИЙ">Женский</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Профессия"
                    name="profession"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Обо мне"
                    name="aboutMe"
                >
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    label="Языки (через запятую)"
                    name="languages"
                >
                    <Input />
                </Form.Item>

                <div className="form-readonly-section" style={{ marginTop: '24px', marginBottom: '24px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <Paragraph><Text strong>ID пользователя:</Text> {initialUserData?.id}</Paragraph>
                    {initialUserData?.createdAt && <Paragraph><Text strong>Дата создания:</Text> {dayjs(initialUserData.createdAt).format('DD.MM.YYYY HH:mm')}</Paragraph>}
                    {initialUserData?.updatedAt && <Paragraph><Text strong>Последнее обновление:</Text> {dayjs(initialUserData.updatedAt).format('DD.MM.YYYY HH:mm')}</Paragraph>}
                </div>

                <Form.Item style={{ textAlign: 'center' }}>
                    <Button type="primary" htmlType="submit" loading={saving} disabled={!hasChanges || saving} size="large">
                        {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default UserProfilePage;