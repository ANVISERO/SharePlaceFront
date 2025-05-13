// src/services/webSocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WEBSOCKET_URL } from '../util/ApiClient.jsx';

let stompClientInstance = null;
let activeSubscription = null;

export const connectWebSocket = (onConnectedCallback, onErrorCallback) => {
    const client = new Client({
        webSocketFactory: () => new SockJS(WEBSOCKET_URL),
        connectHeaders: {
        },
        debug: (str) => {
            console.log('STOMP DEBUG: ', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        stompClientInstance = client;
        if (onConnectedCallback) onConnectedCallback(client);
    };

    client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        if (onErrorCallback) onErrorCallback(frame);
    };

    client.onWebSocketError = (error) => {
        console.error('WebSocket Error:', error);
        if (onErrorCallback) onErrorCallback(error);
    };

    client.onDisconnect = () => {
        console.log('Disconnected from WebSocket');
        stompClientInstance = null;
        activeSubscription = null;
    };

    client.activate();
    return client;
};

export const subscribeToRoom = (client, roomId, onMessageReceived) => {
    if (activeSubscription) {
        activeSubscription.unsubscribe();
        console.log(`Unsubscribed from previous room topic.`);
    }
    if (client && client.connected) {
        activeSubscription = client.subscribe(`/topic/room/${roomId}`, (message) => {
            onMessageReceived(JSON.parse(message.body));
        });
        console.log(`Subscribed to /topic/room/${roomId}`);
    } else {
        console.error('Cannot subscribe, STOMP client not connected.');
    }
};

export const sendMessage = (client, roomId, chatMessage) => {
    if (client && client.connected) {
        client.publish({
            destination: `/app/chat.sendMessage/${roomId}`,
            body: JSON.stringify(chatMessage),
        });
    } else {
        console.error('Cannot send message, STOMP client not connected.');
    }
};

export const disconnectWebSocket = () => {
    if (stompClientInstance && stompClientInstance.connected) {
        stompClientInstance.deactivate();
    }
    stompClientInstance = null;
    activeSubscription = null;
};

export const getStompClient = () => stompClientInstance;
