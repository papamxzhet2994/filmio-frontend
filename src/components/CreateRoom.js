import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [password, setPassword] = useState("");
    const [description, setDescription] = useState(""); // Новое состояние
    const [isClosed, setIsClosed] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const maxDescriptionLength = 500; // Максимальная длина описания

    const validateRoomName = () => {
        if (!roomName.trim()) {
            setError("Название комнаты не может быть пустым.");
            return false;
        }
        if (roomName.length < 3) {
            setError("Название комнаты должно быть не менее 3 символов.");
            return false;
        }
        setError("");
        return true;
    };

    const checkPasswordStrength = (password) => {
        if (password.length === 0) return null;
        if (password.length < 6) return "Слабый";
        if (password.length < 10) return "Средний";
        return "Сильный";
    };

    const generatePassword = () => {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!";
        const length = 12;
        let generatedPassword = "";
        for (let i = 0; i < length; i++) {
            generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(generatedPassword);
        setPasswordStrength(checkPasswordStrength(generatedPassword));
    };

    const handleCreateRoom = () => {
        if (!validateRoomName()) return;

        setIsLoading(true);
        axios
            .post(
                "http://localhost:8080/api/rooms/create",
                { name: roomName, password, description, isClosed },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                navigate(`/rooms/${response.data.id}`);
            })
            .catch(() => {
                setError("Не удалось создать комнату. Попробуйте снова.");
            })
            .finally(() => setIsLoading(false));
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-200 dark:bg-neutral-800">
            <motion.div
                className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg max-w-md w-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-center mb-6">
                    <img src="/logo.svg" alt="Logo" className="w-32 h-32" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white text-center mb-6">
                    Создать новую комнату
                </h2>

                {error && (
                    <motion.div
                        className="mb-4 text-red-600 bg-red-100 dark:bg-red-800 p-3 rounded-md text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error}
                    </motion.div>
                )}

                <div className="mb-4">
                    <input
                        type="text"
                        className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-blue-500"
                        placeholder="Название комнаты"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <textarea
                        className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-blue-500"
                        placeholder="Описание комнаты (необязательно)"
                        value={description}
                        onChange={(e) => {
                            if (e.target.value.length <= maxDescriptionLength) {
                                setDescription(e.target.value);
                            }
                        }}
                        rows={4}
                    />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Осталось символов: {maxDescriptionLength - description.length}
                    </p>
                </div>

                <div className="mb-4 relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-blue-500"
                        placeholder="Пароль комнаты"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordStrength(checkPasswordStrength(e.target.value));
                        }}
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-3 text-gray-500 dark:text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "Скрыть" : "Показать"}
                    </button>
                </div>

                {passwordStrength && (
                    <motion.p
                        className={`text-sm mb-4 ${
                            passwordStrength === "Слабый"
                                ? "text-red-500"
                                : passwordStrength === "Средний"
                                    ? "text-yellow-500"
                                    : "text-green-500"
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        Сила пароля: {passwordStrength}
                    </motion.p>
                )}

                <motion.button
                    type="button"
                    onClick={generatePassword}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mb-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                    Сгенерировать пароль
                </motion.button>

                <div className="flex items-center mb-6">
                    <input
                        type="checkbox"
                        id="isClosed"
                        className="mr-2 rounded"
                        checked={isClosed}
                        onChange={() => setIsClosed(!isClosed)}
                    />
                    <label htmlFor="isClosed" className="text-sm text-neutral-600 dark:text-gray-300">
                        Закрытая комната
                    </label>
                </div>

                <div className="flex space-x-4">
                    <motion.button
                        onClick={handleCancel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 bg-neutral-200 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all"
                        disabled={isLoading}
                    >
                        Отмена
                    </motion.button>
                    <motion.button
                        onClick={handleCreateRoom}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-3 ${
                            isLoading
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        } font-semibold rounded-lg transition-all`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Создание..." : "Создать"}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateRoom;
