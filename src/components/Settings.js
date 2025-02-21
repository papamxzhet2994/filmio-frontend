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
                    <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
                        Сменить пароль
                    </h3>
                    <button
                        onClick={() => setIsChangingPassword(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-8 rounded-full shadow-md transition duration-300 ease-in-out"
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
                    className="mb-6 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-500 dark:border-neutral-700 pb-6"
                >
                    <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
                        Изменение пароля
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Текущий пароль"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="block w-full px-5 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 rounded-full border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                        />
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full px-5 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 rounded-full border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                        />
                        <input
                            type="password"
                            placeholder="Подтвердите новый пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full px-5 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200 rounded-full border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                        />
                    </div>
                    <div className="flex  items-center mt-6">
                        <button
                            onClick={handleChangePassword}
                            className={`w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 text-white py-3 rounded-full font-semibold shadow-md transition duration-300 ease-in-out ${
                                isLoading && 'opacity-50 cursor-not-allowed'
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Загрузка...' : 'Сохранить'}
                        </button>
                        <button
                            onClick={() => setIsChangingPassword(false)}
                            className="w-full max-w-xs ml-4 py-3 rounded-full font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-neutral-400 dark:focus:ring-neutral-500"
                        >
                            Отмена
                        </button>
                    </div>
                </motion.div>
            )}
            {/* Danger Zone */}
            <h3 className="text-lg font-semibold mb-4">Удаление аккаунта</h3>
            <div
                className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-lg">
                <div className="flex items-center mb-4">
                    <div className="bg-red-100 dark:bg-red-800 text-red-500 dark:text-red-300 rounded-full px-4 py-3">
                        <i className="fas fa-exclamation-circle text-xl animate-pulse"></i>
                    </div>
                    <h3 className="ml-4 text-xl font-bold text-neutral-900 dark:text-white">
                        Внимание!
                    </h3>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                    Удаление аккаунта приведёт к безвозвратной потере всех ваших данных. Убедитесь, что вы действительно
                    хотите это сделать.
                </p>
                <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="w-full max-w-xs bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-full text-sm font-bold transition hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? 'Удаление...' : 'Удалить аккаунт'}
                </button>

                {isConfirmingDelete && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3}}
                    >
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl w-full max-w-md">
                            <div className="flex items-center mb-6">
                                <div
                                    className="bg-red-100 dark:bg-red-800 text-red-500 dark:text-red-300 rounded-full px-4 py-3">
                                    <i className="fas fa-lock text-xl"></i>
                                </div>
                                <h3 className="ml-4 text-lg font-semibold text-neutral-900 dark:text-white">
                                    Подтверждение удаления
                                </h3>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
                                Для подтверждения удаления введите свой пароль.
                            </p>
                            <input
                                type="password"
                                placeholder="Введите пароль"
                                value={deletePassword}
                                onChange={(e) => {
                                    setDeletePassword(e.target.value);
                                    setPasswordError(false);
                                }}
                                className={`w-full px-4 py-3 text-sm rounded-lg transition duration-200 ease-in-out border dark:border-neutral-600 ${
                                    passwordError
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900'
                                        : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800'
                                } text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                            />
                            {passwordError && (
                                <p className="text-xs text-red-500 mt-2">Неверный пароль. Попробуйте ещё раз.</p>
                            )}
                            <div className="flex justify-end items-center gap-4 mt-6">
                                <button
                                    onClick={() => setIsConfirmingDelete(false)}
                                    className="py-3 px-6 rounded-full text-sm font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition focus:outline-none"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="py-3 px-6 rounded-full text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
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
