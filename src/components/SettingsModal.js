import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const SettingsModal = ({ isOpen, onClose, roomId, token, onRoomUpdate }) => {
    const [newPassword, setNewPassword] = useState("");
    const [roomName, setRoomName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            alert("Введите новый пароль!");
            return;
        }
        setLoading(true);
        try {
            await axios.put(
                `http://localhost:8080/api/rooms/${roomId}/update-password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Пароль успешно обновлен!");
            setNewPassword("");
        } catch (error) {
            console.error("Ошибка при обновлении пароля:", error);
            toast.error("Не удалось обновить пароль.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRoomName = async () => {
        if (!roomName) {
            toast.error("Введите новое имя комнаты!");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:8080/api/rooms/${roomId}/update-name`,
                { name: roomName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedRoom = response.data;
            toast.success("Имя комнаты успешно обновлено!");
            onRoomUpdate(updatedRoom);
            setRoomName("");
        } catch (error) {
            console.error("Ошибка при обновлении имени комнаты:", error);
            toast.error("Не удалось обновить имя комнаты.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            onClick={handleBackdropClick}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%", transition: { type: "spring", stiffness: 80, damping: 15 } }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                }}
                className="w-full max-w-full h-[90%] fixed bottom-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg p-6 flex flex-col"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Настройки</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>

                {/* Смена пароля */}
                <div className="mb-8 rounded-lg shadow-lg bg-white dark:bg-gray-900 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <i className="fas fa-lock mr-2"></i>
                        Сменить пароль
                    </h3>
                    <label htmlFor="newPassword" className="block">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Введите новый пароль</span>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 text-base text-gray-700 dark:text-gray-300 transition duration-150 ease-in-out bg-white dark:bg-gray-900 appearance-none border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите новый пароль"
                        />
                    </label>
                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading}
                        className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none"
                    >
                        {loading ? "..." : "Обновить"}
                    </button>
                </div>

                {/* Обновление имени комнаты */}
                <div className="mb-8 rounded-lg shadow-lg bg-white dark:bg-gray-900 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <i className="fas fa-edit mr-2"></i>
                        Изменить имя комнаты
                    </h3>
                    <label htmlFor="roomName" className="block">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Введите новое имя комнаты</span>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full px-4 py-3 text-base text-gray-700 dark:text-gray-300 transition duration-150 ease-in-out bg-white dark:bg-gray-900 appearance-none border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите новое имя комнаты"
                        />
                    </label>
                    <button
                        onClick={handleUpdateRoomName}
                        disabled={loading}
                        className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none"
                    >
                        {loading ? "..." : "Изменить"}
                    </button>
                </div>
            </motion.div>
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", transition: { type: "spring", stiffness: 80, damping: 15 }, opacity: 0 }}
                className="absolute bottom-0 left-0">
                <img
                    src="/logo2.svg"
                    alt="Logo"
                    className="w-24 h-24"
                />
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;
