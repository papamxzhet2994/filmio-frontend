import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ThemeSwitcher from "./ThemeSwitcher";

const Settings = () => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const token = localStorage.getItem("token");
    const [userId, setUserId] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    const showToast = (message, type) => {
        toast.custom(
            <motion.div
                className={`p-4 rounded-md ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-gray-700"} text-white`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {message}
            </motion.div>,
            {
                duration: 4000,
                position: "top-right",
                style: { zIndex: 9999 }
            }
        );
    };

    const handleConfirmDelete = () => {
        if (!deletePassword) {
            setPasswordError(true);
            return;
        }

        axios
            .post(
                `http://localhost:8080/api/users/${userId}/verify-password`,
                { password: deletePassword },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then(() => {
                handleDeleteAccount();
            })
            .catch(() => {
                showToast("Пароль неверен. Удаление невозможно.", "error");
            });
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    useEffect(() => {
        if (token) {
            axios
                .get('http://localhost:8080/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    setUserId(response.data.id);
                })
                .catch(() => {
                    showToast("Ошибка при получении данных пользователя", "error");
                });
        }
    }, [token]);

    const handleChangePassword = () => {
        if (!newPassword || !confirmPassword || !currentPassword) {
            showToast("Все поля должны быть заполнены", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Пароли не совпадают", "error");
            return;
        }

        if (!validatePassword(newPassword)) {
            showToast("Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру", "error");
            return;
        }

        if (!userId) {
            showToast("Пользователь не найден", "error");
            return;
        }

        setIsLoading(true);

        axios
            .put(
                `http://localhost:8080/api/users/${userId}/change-password`,
                { currentPassword, newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then(() => {
                showToast("Пароль успешно изменен!", "success");
                setNewPassword('');
                setConfirmPassword('');
                setCurrentPassword('');
                setIsChangingPassword(false);
            })
            .catch((error) => {
                const errorMessage =
                    typeof error.response?.data === "string"
                        ? error.response.data
                        : error.response?.data?.message || "Не удалось изменить пароль";

                showToast(errorMessage, "error");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleDeleteAccount = () => {
        if (!userId) {
            showToast("Пользователь не найден", "error");
            return;
        }

        setIsLoading(true);

        axios
            .delete(`http://localhost:8080/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(() => {
                showToast("Аккаунт успешно удалён!", "success");
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                window.location.href = "/";
            })
            .catch(() => {
                showToast("Не удалось удалить аккаунт. Попробуйте позже.", "error");
            })
            .finally(() => {
                setIsLoading(false);
                setIsConfirmingDelete(false);
            });
    };

    return (
        <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
            <Toaster/>
            <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">Настройки</h2>
            <div className="mb-6 border-b border-neutral-500 dark:border-neutral-700 pb-6">
                <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Сменить тему</h3>
                <ThemeSwitcher/>
            </div>
            {!isChangingPassword ? (
                <div className="mb-6 border-b border-neutral-500 dark:border-neutral-700 pb-6">
                    <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Сменить пароль</h3>
                    <button
                        onClick={() => setIsChangingPassword(true)}
                        className="text-blue-500 border border-blue-500 py-2 px-6 rounded-lg transition duration-200 ease-in-out hover:bg-blue-500 hover:text-white"
                    >
                        Изменить пароль
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -20}}
                    transition={{duration: 0.3}}
                    className="mb-6"
                >
                    <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Изменение пароля</h3>
                    <input
                        type="password"
                        placeholder="Текущий пароль"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full px-4 py-2 mb-4 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 rounded-lg"
                    />
                    <input
                        type="password"
                        placeholder="Новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full px-4 py-2 mb-4 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 rounded-lg"
                    />
                    <input
                        type="password"
                        placeholder="Подтвердите новый пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full px-4 py-2 mb-4 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 rounded-lg"
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={handleChangePassword}
                            className={`text-white border px-6 py-2 rounded-lg transition duration-200 ease-in-out ${
                                isLoading
                                    ? 'border-gray-500 bg-neutral-500 cursor-not-allowed'
                                    : 'border-blue-500 bg-blue-500 hover:bg-blue-600'
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Загрузка...' : 'Сохранить'}
                        </button>
                        <button
                            onClick={() => setIsChangingPassword(false)}
                            className="text-neutral-400 border border-neutral-500 px-6 py-2 rounded-lg transition duration-200 ease-in-out hover:bg-neutral-500 hover:text-white"
                        >
                            Отмена
                        </button>
                    </div>
                </motion.div>
            )}
            {/* Danger Zone */}
            <h3 className="text-lg font-semibold mb-4">Удаление аккаунта</h3>
            <div className=" bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-red-600 p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Внимание!</h3>
                <p className="text-neutral-400 mb-4">
                    Удаление аккаунта приведёт к безвозвратной потере всех ваших данных. Пожалуйста, будьте осторожны.
                </p>
                <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="text-white bg-red-600 py-2 px-6 rounded-lg transition duration-200 ease-in-out hover:bg-red-700"
                    disabled={isLoading}
                >
                    {isLoading ? 'Удаление...' : 'Удалить аккаунт'}
                </button>

                {/* Custom Confirmation Modal */}
                {isConfirmingDelete && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                    >
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-xl w-full">
                            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-4">
                                Подтверждение удаления
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                Введите пароль для подтверждения удаления аккаунта.
                            </p>
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={deletePassword}
                                onChange={(e) => {
                                    setDeletePassword(e.target.value);
                                    setPasswordError(false);
                                }}
                                className={`block w-full px-4 py-2 mb-4 rounded-lg ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {passwordError && (
                                <p className="text-red-500 text-sm mb-4">Неверный пароль. Попробуйте ещё раз.</p>
                            )}
                            <div className="flex gap-4 justify-end items-center">
                                <button
                                    onClick={() => setIsConfirmingDelete(false)}
                                    className="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 py-2 px-6 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="bg-red-500 dark:bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-600 dark:hover:bg-red-700"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Settings;
