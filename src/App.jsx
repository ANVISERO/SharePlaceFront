import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import YandexAuthHelper from "./pages/YandexAuthHelper.jsx";
import PingPage from "./pages/PingPage.jsx";
import YandexLoginPage from "./pages/yandex-login/YandexLoginPage.jsx";

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import UserProfilePage from "./pages/profile/UserProfilePage.jsx";
import ChatPage from "./pages/chat/ChatPage.jsx";

function AppLayout() {
    return (
        <div className="app-layout-container">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}


const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: <PingPage />,
            },
            {
                path: "/ping",
                element: <PingPage />,
            },
            {
                path: "/chat",
                element: <ChatPage />,
            },
            {
                path: "/profile",
                element: <UserProfilePage />,
            }
        ],
    },
    {
        path: "/yandex-login",
        element: <YandexLoginPage />,
    },
    {
        path: "/yandex-auth-helper",
        element: <YandexAuthHelper />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
