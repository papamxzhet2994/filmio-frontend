import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Header from "./components/Header";
import Room from "./components/Room";
import CreateRoom from "./components/CreateRoom";
import RoomsList from "./components/RoomList";
import EnterRoom from "./components/EnterRoom";
import MainLayout from "./components/MainLayout";
import Settings from "./components/Settings";
import {ThemeProvider} from "next-themes";
import {Toaster} from "react-hot-toast";

const App = () => {
    return (
        <ThemeProvider attribute="class">
        <Toaster position="top-right" reverseOrder={false} />

        <Router>
            <div className="">
                {/*<Header />*/}
                <Routes>
                    {/* Внешние маршруты */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* Вложенные маршруты для MainLayout */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<RoomsList />} /> {/* Список комнат по умолчанию */}
                        <Route path="create-room" element={<CreateRoom />} /> {/* Создание комнаты */}
                        <Route path="users" element={<RoomsList />} /> {/* Дублирующий маршрут для списка */}
                        <Route path="rooms/:id" element={<Room />} /> {/* Комната */}
                        <Route path="rooms/:id/enter" element={<EnterRoom />} /> {/* Вход в комнату */}
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Routes>
            </div>
        </Router>
        </ThemeProvider>
    );
};

export default App;
