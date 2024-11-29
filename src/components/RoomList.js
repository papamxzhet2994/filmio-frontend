import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RoomsList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return; // Если токен отсутствует, запросы не делаем

        axios.get("http://localhost:8080/api/rooms", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setRooms(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка при получении списка комнат:", error);
                setError("Не удалось загрузить комнаты. Попробуйте снова позже.");
                setLoading(false);
            });
    }, [token]);

    if (!token) {
        return (
            <div className="flex items-center min-h-screen bg-gray-200 dark:bg-gray-800 text-white flex-col">

                <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-400">Доступ запрещен</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-lg">
                    У вас нет доступа к списку комнат. Пожалуйста, войдите в систему, чтобы продолжить.
                </p>
                <Link
                    to="/login"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Войти
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
                <p className="text-xl">Загрузка комнат...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
                <p className="text-xl text-red-600 dark:text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-800 text-black dark:text-white p-6">
            <h2 className="text-3xl font-bold mb-6">Доступные комнаты</h2>
            <ul className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <li
                        key={room.id}
                        className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Link to={`/rooms/${room.id}`} className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                                {room.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-black dark:text-white">{room.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Участников: {room.participants || 0}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RoomsList;
