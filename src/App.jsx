import './App.css'
import {createBrowserRouter, Route, RouterProvider} from "react-router-dom";
import BaseReactPage from "./pages/BaseReactPage.jsx";
import YandexCallback from "./pages/YandexCallback.jsx";
import YandexAuthHelper from "./pages/YandexAuthHelper.jsx";

function App() {

    const router = createBrowserRouter(
        [
            {
                path: "/",
                element: <BaseReactPage />,
                // errorElement: <NotFound />
            },
            {
                path: "/auth/yandex/callback",
                element: <YandexCallback />,
                // errorElement: <NotFound />
            },
            {
                path: "/yandex-auth-helper",
                element: <YandexAuthHelper />,
                // errorElement: <NotFound />
            }
    ]);

    return (
        <RouterProvider router={router}>
            <Route path='/' element={<BaseReactPage/>}/>
            <Route path='/auth/yandex/callback' element={<YandexCallback/>}/>
            <Route path='/yandex-auth-helper' element={<YandexAuthHelper/>}/>
        </RouterProvider>
    )
}

export default App
