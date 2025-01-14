import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validateForm = () => {
        if (username.length < 3) {
            setError("Никнейм должен содержать не менее 3-х символов.");
            return false;
        }
        if (!email.includes("@")) {
            setError("Некорректный формат почты.");
            return false;
        }
        if (password.length < 6) {
            setError("Пароль должен содержать не менее 6 символов.");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Пароли не совпадают.");
            return false;
        }
        setError("");
        return true;
    };

    const handleRegister = () => {
        if (!validateForm()) {
            return;
        }
        axios
            .post("http://localhost:8080/api/auth/register", {
                username,
                email,
                password,
            })
            .then(() => {
                alert("Регистрация прошла успешно!");
                navigate("/login");
            })
            .catch((error) => {
                setError(error.response?.data || "Произошла ошибка при регистрации.");
            });
    };

    return (
        <motion.div
            className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
            >
                <motion.h2
                    className="text-3xl font-bold text-center text-neutral-900 dark:text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Регистрация
                </motion.h2>
                {error && (
                    <motion.p
                        className="text-red-600 dark:text-red-400 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error}
                    </motion.p>
                )}
                <motion.form
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                            Имя пользователя
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-full focus:outline-none focus:ring focus:ring-fuchsia-500 dark:focus:ring-fuchsia-400 transition-all duration-300 ease-in-out"
                            placeholder="Введите имя"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-full focus:outline-none focus:ring focus:ring-fuchsia-500 dark:focus:ring-fuchsia-400 transition-all duration-300 ease-in-out"
                            placeholder="Введите почту"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                            Пароль
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-full focus:outline-none focus:ring focus:ring-fuchsia-500 dark:focus:ring-fuchsia-400 transition-all duration-300 ease-in-out"
                            placeholder="Введите пароль"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                            Повторите пароль
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-full focus:outline-none focus:ring focus:ring-fuchsia-500 dark:focus:ring-fuchsia-400 transition-all duration-300 ease-in-out"
                            placeholder="Повторите пароль"
                            required
                        />
                    </div>
                    <motion.button
                        type="button"
                        onClick={handleRegister}
                        className="w-full py-3 mt-4 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Зарегистрироваться
                    </motion.button>
                </motion.form>
                <motion.p
                    className="text-center text-neutral-600 dark:text-neutral-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Уже есть аккаунт?{" "}
                    <Link
                        to="/login"
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 transition-all duration-300"
                    >
                        Войти
                    </Link>
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default Register;
