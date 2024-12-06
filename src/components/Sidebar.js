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

    useEffect(() => {
        if (!token) return;

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
                setAvatarUrl(response.data.avatarUrl ? `http://localhost:8080${response.data.avatarUrl}` : "https://i.pravatar.cc/300");
            })
            .catch(error => console.error("Ошибка при получении информации о пользователе:", error));
    }, [token]);

    useEffect(() => {
        if (location.pathname.includes("/rooms/")) {
            setIsCollapsed(true);
        }
    }, [location.pathname]);

    return (
        <div className="relative flex">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-4 left-full transform -translate-x-1/2 bg-gray-100 dark:bg-gray-900 text-black dark:text-white rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
            >
                {isCollapsed ? <i className="fas fa-chevron-right"></i> : <i className="fas fa-chevron-left"></i>}
            </button>

            <div
                className={`bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 ${isCollapsed ? "w-24" : "w-96"} transition-all duration-300 flex flex-col h-screen`}
            >
                {!isCollapsed && (
                    <div className="p-4 border-b border-gray-300 dark:border-gray-800">
                        <h1 className="text-3xl font-bold text-black dark:text-white">Комнаты</h1>
                    </div>
                )}

                {token ? (
                    <ul className="flex-1 overflow-y-auto p-4 space-y-3">
                        {rooms.map(room => (
                            <li key={room.id}>
                                <Link
                                    to={`/rooms/${room.id}`}
                                    className={`flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? "justify-center" : ""}`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-black dark:text-white">
                                        {room.name.charAt(0).toUpperCase()}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="ml-4">
                                            <div className="flex items-center space-x-2">
                                                <p>{room.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {room.hasPassword ? <i className="fas fa-lock mr-1 text-red-500"></i> : <i className="fas fa-lock-open mr-1 text-blue-500"></i> }
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {room.isClosed ? "Закрытая" : "Открытая"} |
                                                Участников: {room.participantCount}
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex-1 p-4 flex items-center justify-center">
                        <p className="text-gray-400 dark:text-gray-500">Войдите в аккаунт, чтобы увидеть список
                            комнат.</p>
                    </div>
                )}

                <div className="p-4 border-t border-gray-300 dark:border-gray-800 flex items-center justify-between">
                    {token ? (
                        <div className={`flex items-center ${isCollapsed ? "justify-center ml-2" : "space-x-3"}`}>
                            {isCollapsed && (
                                <Link to="/profile">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </Link>
                            )}
                            {!isCollapsed && (
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
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
                            className="text-sm font-medium text-blue-600 dark:text-blue-500 border border-blue-600 dark:border-blue-500 px-4 py-1.5 rounded hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            Войти в аккаунт
                        </Link>
                    )}

                    {token && !isCollapsed && (
                        <Link
                            to="/create-room"
                            className="px-2 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                            <i className="fas fa-plus"></i>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
