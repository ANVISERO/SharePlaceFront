const AUTH_SERVICE = "http://localhost:8081";
const CHAT_SERVICE = "http://localhost:8080";

const request = (options) => {
    const headers = new Headers();

    if (options.setContentType !== false) {
        headers.append("Content-Type", "application/json");
    }

    // Заголовок Authorization больше не добавляется вручную.
    // Браузер автоматически отправит cookie 'auth-token'.

    const defaults = {
        headers: headers,
        credentials: 'include', // Важно для отправки cookies с запросами
    };
    // Объединяем стандартные опции с переданными
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
        .then(async (response) => { // Делаем колбэк асинхронным для безопасного использования await response.json()
            let jsonPayload;
            try {
                if (response.status === 204) { // No Content
                    jsonPayload = null; // Для статуса 204 тело ответа пустое
                } else {
                    jsonPayload = await response.json(); // Пытаемся распарсить JSON
                }
            } catch (e) {
                // Если парсинг JSON не удался
                if (!response.ok) {
                    // Для неуспешных ответов без JSON-тела создаем ошибку со статусом
                    const error = new Error(`HTTP ошибка ${response.status}: ${response.statusText || 'Ошибка сервера'}`);
                    error.status = response.status;
                    error.response = response; // Сохраняем сам объект ответа
                    return Promise.reject(error);
                }
                // Если парсинг JSON не удался для успешного ответа (неожиданная ситуация)
                const error = new Error("Не удалось обработать JSON ответ от сервера при успешном статусе.");
                error.status = response.status;
                error.response = response;
                return Promise.reject(error);
            }

            if (!response.ok) {
                // Если ответ не успешный, но содержит JSON (например, ошибки валидации)
                const error = new Error(jsonPayload?.message || `HTTP ошибка ${response.status}`);
                error.status = response.status;
                error.body = jsonPayload; // Прикрепляем тело ошибки, если оно было
                error.response = response;
                return Promise.reject(error);
            }

            return jsonPayload; // Возвращаем JSON для успешных ответов
        })
        .catch(error => {
            // Этот catch перехватывает ошибки из .then (включая Promise.reject)
            // или ошибки сети, которые не были обработаны ранее.
            // Можно добавить дополнительное логирование или обработку здесь, если нужно.
            console.error("Ошибка при выполнении запроса:", error);
            return Promise.reject(error); // Передаем ошибку дальше
        });
};

// Функции для аутентификации
export function login(loginRequest) {
    return request({
        url: AUTH_SERVICE + "/signin",
        method: "POST",
        body: JSON.stringify(loginRequest),
    });
}

export function facebookLogin(facebookLoginRequest) {
    return request({
        url: AUTH_SERVICE + "/facebook/signin",
        method: "POST",
        body: JSON.stringify(facebookLoginRequest),
    });
}

export function signup(signupRequest) {
    return request({
        url: AUTH_SERVICE + "/users",
        method: "POST",
        body: JSON.stringify(signupRequest),
    });
}

// Функции, требующие аутентификации
// Клиентская проверка токена удалена. Сервер будет проверять cookie 'auth-token'.

export function getCurrentUser() {
    return request({
        url: AUTH_SERVICE + "/users/me",
        method: "GET",
    });
}

export function getUsers() {
    return request({
        url: AUTH_SERVICE + "/users/summaries",
        method: "GET",
    });
}

export function countNewMessages(senderId, recipientId) {
    return request({
        url: CHAT_SERVICE + "/messages/" + senderId + "/" + recipientId + "/count",
        method: "GET",
    });
}

export function findChatMessages(senderId, recipientId) {
    return request({
        url: CHAT_SERVICE + "/messages/" + senderId + "/" + recipientId,
        method: "GET",
    });
}

export function findChatMessage(id) {
    return request({
        url: CHAT_SERVICE + "/messages/" + id,
        method: "GET",
    });
}