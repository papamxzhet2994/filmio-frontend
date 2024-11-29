import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [password, setPassword] = useState("");
    const [isClosed, setIsClosed] = useState(false);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        if (!roomName.trim()) {
            setError("Название комнаты не может быть пустым.");
            return;
        }

        axios.post(
            "http://localhost:8080/api/rooms/create",
            { name: roomName, password, isClosed },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then(response => {
                navigate(`/rooms/${response.data.id}`);
            })
            .catch(error => {
                console.error("Ошибка при создании комнаты:", error);
                setError("Не удалось создать комнату. Попробуйте снова.");
            });
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-white">
            <div className="bg-gray-200 dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-semibold mb-6 text-center dark:text-white text-gray-900">Создать новую комнату</h2>

                {error && (
                    <div className="mb-4 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <input
                        type="text"
                        className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите название комнаты"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите пароль комнаты"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="mb-6 flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isClosed"
                        className="w-5 h-5 text-blue-500 border-gray-600 rounded focus:ring-blue-500"
                        checked={isClosed}
                        onChange={() => setIsClosed(!isClosed)}
                    />
                    <label htmlFor="isClosed" className="text-gray-600 dark:text-gray-400">
                        Закрытая комната
                    </label>
                </div>
                <div className="flex justify-between items-center space-x-2">
                    <button
                        onClick={handleCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 w-full rounded-lg transition duration-200 ease-in-out"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleCreateRoom}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 w-full rounded-lg transition duration-200 ease-in-out"
                    >
                        Создать
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
