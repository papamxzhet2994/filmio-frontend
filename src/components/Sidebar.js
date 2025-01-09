import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const [rooms, setRooms] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const location = useLocation();

    const isTokenValid = (token) => {
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return Date.now() < payload.exp * 1000;
        } catch (error) {
            console.error("Invalid token:", error);
            return false;
        }
    };

    useEffect(() => {
        if (!token || !isTokenValid(token)) {
            localStorage.removeItem("token");
            setRooms([]);
            return;
        }

        axios.get("http://localhost:8080/api/rooms", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => setRooms(response.data))
            .catch(error => console.error("Ошибка при загрузке списка комнат:", error));

        axios.get("http://localhost:8080/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setAvatarUrl(response.data.avatarUrl
                    ? `http://localhost:8080${response.data.avatarUrl}`
                    : `https://ui-avatars.com/api/?name=${response.data.username}&background=random&rounded=true`);
            })
            .catch(error => console.error("Ошибка при получении информации о пользователе:", error));
    }, [token]);

    // Сворачивание сайдбара при смене маршрута
    useEffect(() => {
        if (location.pathname.startsWith("/rooms/")) {
            setIsCollapsed(true);
        }
        if (location.pathname === "/") {
            setIsCollapsed(false);
        }
    }, [location]);

    return (
        <div className="relative flex">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-3 left-full transform -translate-x-1/2 bg-gray-100 dark:bg-neutral-900 text-black dark:text-white rounded-full p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors z-10"
            >
                {isCollapsed ? <i className="fas fa-chevron-right"></i> : <i className="fas fa-chevron-left"></i>}
            </button>

            <div
                className={`bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 ${isCollapsed ? "w-24" : "w-96"} transition-all duration-300 flex flex-col h-screen`}
            >
                {!isCollapsed && (
                    <div className="p-4 border-b border-neutral-300 dark:border-neutral-800">
                        <h1 className="text-2xl font-bold text-black dark:text-white">Комнаты</h1>
                    </div>
                )}

                {isCollapsed && (
                    <div className="p-4 border-b border-neutral-300 dark:border-neutral-800">
                        <div className="flex items-center justify-center mr-4">
                            <img src='/logo2.svg' alt="Logo" className="w-8 h-8" />
                            <h3 className="text-sm font-bold text-black dark:text-white">filmio</h3>
                        </div>
                    </div>
                )}

                {token ? (
                    <ul className="flex-1 overflow-y-auto p-4 space-y-3">
                        {rooms.map(room => (
                            <li key={room.id}>
                                <Link
                                    to={`/rooms/${room.id}`}
                                    className={`flex items-center p-3 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ${isCollapsed ? "justify-center" : ""}`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-black dark:text-white">
                                        <img
                                            src={room.avatarUrl
                                                ? `http://localhost:8080/${room.avatarUrl}`
                                                : `https://ui-avatars.com/api/?name=${room.name}&background=random&rounded=true`}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </div>
                                    {!isCollapsed && (
                                        <div className="ml-4">
                                            <div className="flex items-center space-x-2">
                                                <p className="font-semibold text-black dark:text-white">{room.name}</p>
                                                <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                                                    {room.hasPassword ? <i className="fas fa-lock mr-1 text-red-700"></i> : <i className="fas fa-lock-open mr-1 text-green-500"></i>}
                                                </p>
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {room.description}
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !isCollapsed ? (
                        <div className="flex-1 p-4 flex items-center justify-center">
                            <p className="text-neutral-400 dark:text-neutral-500">Войдите в аккаунт, чтобы увидеть список комнат.</p>
                        </div>
                    ) : (
                        <div className="flex-1 p-4 flex items-center justify-center">
                            <i className="fas fa-warning text-yellow-500 text-4xl"></i>
                        </div>
                    )
                )}

                <div className="p-4 border-t border-neutral-300 dark:border-neutral-800 flex items-center justify-between">
                    {token ? (
                        <div className={`flex items-center ${isCollapsed ? "justify-center ml-2" : "space-x-3"}`}>
                            {isCollapsed && (
                                <Link to="/profile">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover bg-neutral-200 dark:bg-neutral-700"
                                    />
                                </Link>
                            )}
                            {!isCollapsed && (
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover bg-neutral-200 dark:bg-neutral-700"
                                    />
                                    <div className="">
                                        <p className="text-black dark:text-white">{username || "User"}</p>
                                        <Link to="/profile"
                                              className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
                                            Профиль
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="relative flex items-center justify-center p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 group"
                        >
                            Войти
                        </Link>
                    )}

                    {token && !isCollapsed && (
                        <Link
                            to="/create-room"
                            className="relative flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 group"
                        >
                            <i className="fas fa-plus text-lg"></i>
                            <span className="absolute top-1/2 left-full transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 text-sm font-medium bg-neutral-900 text-white py-1 px-2 rounded-md shadow-lg transition-all duration-200 whitespace-nowrap">
                                Создать комнату
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
