import React from 'react';
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";

import YandexAuthHelper from "./pages/yandex-login/YandexAuthHelper.jsx";
import PingPage from "./pages/PingPage.jsx";
import YandexLoginPage from "./pages/yandex-login/YandexLoginPage.jsx";

import Header from './components/Header/Header'; // Ваш общий Header
import Footer from './components/Footer/Footer'; // Ваш общий Footer
import UserProfilePage from "./pages/profile/UserProfilePage.jsx";
import ChatPage from "./pages/chat/ChatPage.jsx"; // Ваша ChatPage

// AppLayout для страниц с общим Header и Footer
function AppLayout() {
    return (
        <div className="app-layout-container">
            <Header/>
            <main className="main-content">
                <Outlet/>
            </main>
            <Footer/>
        </div>
    );
}

// AppLayoutWithoutFooter для страниц с общим Header, но БЕЗ Footer
function AppLayoutWithoutFooter() {
    return (
        <div className="app-layout-container">
            <Header/> {/* Этот Header теперь будет на странице чата */}
            <main className="main-content">
                <Outlet/>
            </main>
        </div>
    );
}


const router = createBrowserRouter([
    {
        element: <AppLayout/>, // Этот Layout применяется к его дочерним роутам
        children: [
            {
                path: "/",
                element: <PingPage/>,
            },
            {
                path: "/ping",
                element: <PingPage/>,
            },
            {
                path: "/profile",
                element: <UserProfilePage/>,
            },
        ],
    },
    {
        // Используем AppLayoutWithoutFooter для /chat, чтобы добавить общий Header
        element: <AppLayoutWithoutFooter/>,
        children: [
            {
                path: "/chat",
                element: <ChatPage/>, // ChatPage теперь будет иметь общий Header и свой userInfoHeader
            },
        ],
    },
    {
        // YandexLoginPage является маршрутом верхнего уровня (без общего Header/Footer)
        path: "/yandex-login",
        element: <YandexLoginPage/>,
    },
    {
        // YandexAuthHelper также является маршрутом верхнего уровня
        path: "/yandex-auth-helper",
        element: <YandexAuthHelper/>,
    },
]);

function App() {
    return <RouterProvider router={router}/>;
}

export default App;
