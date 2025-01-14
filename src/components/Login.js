import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const expiration = payload.exp * 1000;
            return Date.now() > expiration;
        } catch (e) {
            console.error("Invalid token:", e);
            return true;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && !isTokenExpired(token)) {
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            navigate("/login");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/api/auth/login", {
                username,
                password,
            });
            const token = response.data.token;
            if (isTokenExpired(token)) {
                setErrorMessage("Токен уже истек. Обратитесь к администратору.");
                return;
            }
            localStorage.setItem("token", token);
            localStorage.setItem("username", response.data.username);
            setIsAuthenticated(true);
            navigate("/");
        } catch (error) {
            setErrorMessage("Неправильные логин или пароль");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
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
                {isAuthenticated ? (
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                            Вы уже вошли в систему
                        </h2>
                        <motion.button
                            onClick={handleLogout}
                            className="mt-4 py-2 px-4 text-white bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 dark:focus:ring-red-500"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Выйти
                        </motion.button>
                    </motion.div>
                ) : (
                    <>
                        <motion.h2
                            className="text-3xl font-bold text-center text-neutral-900 dark:text-white"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Вход в аккаунт
                        </motion.h2>
                        {errorMessage && (
                            <motion.p
                                className="text-red-600 dark:text-red-400 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {errorMessage}
                            </motion.p>
                        )}
                        <motion.form
                            onSubmit={handleLogin}
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
                                    placeholder="Введите имя пользователя"
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
                            <motion.button
                                type="submit"
                                className="w-full py-3 mt-4 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-500"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Войти
                            </motion.button>
                        </motion.form>
                    </>
                )}
                <motion.p
                    className="text-center text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Еще нет аккаунта?{" "}
                    <Link
                        to="/register"
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 transition-all duration-300"
                    >
                        Зарегистрироваться
                    </Link>
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default Login;
