import apiClient from '../util/ApiClient.jsx';

export const fetchChatRooms = async (page = 0, size = 20) => {
    try {
        const response = await apiClient.get(`/chat/rooms?page=${page}&size=${size}&sort=lastActivityAt,desc`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chat rooms:", error);
        throw error;
    }
};

export const fetchChatRoomById = async (roomId) => {
    try {
        const response = await apiClient.get(`/chat/rooms/${roomId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching chat room ${roomId}:`, error);
        throw error;
    }
};

export const createChatRoom = async (createChatRoomRequest) => {
    try {
        const response = await apiClient.post('/chat/rooms', createChatRoomRequest);
        return response.data;
    } catch (error) {
        console.error("Error creating chat room:", error);
        throw error;
    }
};
