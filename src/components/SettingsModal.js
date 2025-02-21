import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Cliploader from "react-spinners/ClipLoader";

const SettingsModal = ({ isOpen, onClose, roomId, token, onRoomUpdate }) => {
    const [newPassword, setNewPassword] = useState("");
    const [roomName, setRoomName] = useState("");
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [description, setDescription] = useState("");

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            toast.error("Введите новый пароль!");
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

    const handleFileChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) {
            toast.error("Выберите файл для загрузки!");
            return;
        }

        const formData = new FormData();
        formData.append("file", avatarFile);

        setLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:8080/api/rooms/${roomId}/upload-avatar`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const updatedRoom = response.data;
            onRoomUpdate(updatedRoom);
            toast.success("Аватар успешно загружен!");
        } catch (error) {
            console.error("Ошибка при загрузке аватара:", error);
            toast.error("Не удалось загрузить аватар.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDescription = async () => {
        if (!description) {
            toast.error("Введите новое описание комнаты!");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.put(
                `http://localhost:8080/api/rooms/${roomId}/update-description`,
                { description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedRoom = response.data;
            toast.success("Описание комнаты успешно обновлено!");
            onRoomUpdate(updatedRoom);
            setDescription("");
        } catch (error) {
            console.error("Ошибка при обновлении описания комнаты:", error);
            toast.error("Не удалось обновить описание комнаты.");
        } finally {
            setLoading(false);
        }
    };

    const modalVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const contentVariants = {
        hidden: { y: "100%" },
        visible: {
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 20 },
        },
        exit: {
            y: "100%",
            transition: { type: "spring", stiffness: 80, damping: 15 },
        },
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
        >
            <motion.div
                className="w-2/3 max-w-full h-[90%] fixed bottom-0 bg-white dark:bg-neutral-800 rounded-t-3xl shadow-lg p-6 flex flex-col overflow-y-auto"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Настройки</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-200 dark:bg-neutral-700 rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>

                {/* Смена пароля */}
                <div className="mb-8 rounded-3xl shadow-lg bg-white dark:bg-neutral-900 p-8">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        <i className="fas fa-lock mr-2"></i>
                        Сменить пароль
                    </h3>
                    <label htmlFor="newPassword" className="block">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Введите новый пароль</span>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 mt-2 text-base text-neutral-700 dark:text-neutral-300 transition duration-150 ease-in-out bg-white dark:bg-neutral-900 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите новый пароль"
                        />
                    </label>
                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading}
                        className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-full shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none"
                    >
                        {loading ? <Cliploader size={20} color="white" /> : "Обновить"}
                    </button>
                </div>

                {/* Обновление имени комнаты */}
                <div className="mb-8 rounded-3xl shadow-lg bg-white dark:bg-neutral-900 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        <i className="fas fa-edit mr-2"></i>
                        Изменить имя комнаты
                    </h3>
                    <label htmlFor="roomName" className="block">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Введите новое имя комнаты</span>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full px-4 py-3 text-base text-neutral-700 dark:text-neutral-300 transition duration-150 ease-in-out bg-white dark:bg-neutral-900 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите новое имя комнаты"
                        />
                    </label>
                    <button
                        onClick={handleUpdateRoomName}
                        disabled={loading}
                        className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-full shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none"
                    >
                        {loading ? <Cliploader size={20} color="white" /> : "Изменить"}
                    </button>
                </div>
                {/* Загрузка аватара комнаты */}
                <div className="mb-8 rounded-3xl shadow-lg bg-white dark:bg-neutral-900 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        <i className="fas fa-upload mr-2"></i>
                        Загрузить аватар комнаты
                    </h3>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="mb-4 w-full text-sm text-neutral-700 dark:text-neutral-300
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-neutral-200 dark:file:bg-neutral-700 file:text-neutral-700 dark:file:text-neutral-200
                        hover:file:bg-neutral-300 dark:hover:file:bg-neutral-600"
                    />
                    <button
                        onClick={handleUploadAvatar}
                        disabled={loading}
                        className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-full shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none "
                    >
                        {loading ? <Cliploader size={20} color="white" /> : "Загрузить"}
                    </button>
                </div>
                <div className="mb-8 rounded-3xl shadow-lg bg-white dark:bg-neutral-900 p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                        <i className="fas fa-edit mr-2"></i>
                        Изменить описание комнаты
                    </h3>
                    <label htmlFor="description" className="block">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Введите новое описание комнаты</span>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 text-base text-neutral-700 dark:text-neutral-300 transition duration-150 ease-in-out bg-white dark:bg-neutral-900 appearance-none border border-neutral-300 dark:border-neutral-600 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите новое описание комнаты"
                        />
                    </label>
                    <button
                        onClick={handleUpdateDescription}
                        disabled={loading}
                        className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-full shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none"
                    >
                        {loading ? <Cliploader size={20} color="white" /> : "Изменить"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;
