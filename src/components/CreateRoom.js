import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

        axios
            .post(
                "http://localhost:8080/api/rooms/create",
                { name: roomName, password, isClosed },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                navigate(`/rooms/${response.data.id}`);
            })
            .catch((error) => {
                console.error("Ошибка при создании комнаты:", error);
                setError("Не удалось создать комнату. Попробуйте снова.");
            });
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-800 text-white">
            <motion.div
                className="bg-neutral-200 dark:bg-neutral-900 p-8 rounded-lg shadow-lg max-w-md w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <h2 className="text-3xl font-semibold mb-6 text-center dark:text-neutral-200 text-neutral-900">
                    Создать новую комнату
                </h2>

                {error && (
                    <motion.div
                        className="mb-4 text-red-500 text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error}
                    </motion.div>
                )}

                <div className="mb-4">
                    <input
                        type="text"
                        className="bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-1 focus:ring-fuchsia-900"
                        placeholder="Введите название комнаты"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        className="bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
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
                <motion.div
                    className="flex justify-between items-center space-x-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <button
                        onClick={handleCancel}
                        className="bg-neutral-600 hover:bg-neutral-700 text-white py-3 px-6 w-full rounded-lg transition duration-200 ease-in-out"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleCreateRoom}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 w-full rounded-lg transition duration-200 ease-in-out"
                    >
                        Создать
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default CreateRoom;
