import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Функция для проверки истечения токена
    const isTokenExpired = (token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const expiration = payload.exp * 1000; // В миллисекунды
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
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-300 dark:border-neutral-700">
                {isAuthenticated ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                            Вы уже вошли в систему
                        </h2>
                        <button
                            onClick={handleLogout}
                            className="mt-4 py-2 px-4 text-white bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 dark:focus:ring-red-500 transition-all duration-300"
                        >
                            Выйти
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white">
                            Вход в аккаунт
                        </h2>
                        {errorMessage && (
                            <p className="text-red-600 dark:text-red-400 text-center">
                                {errorMessage}
                            </p>
                        )}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-400">
                                    Имя пользователя
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                    className="mt-1 block w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring focus:ring-blue-500 dark:focus:ring-blue-400"
                                    placeholder="Введите пароль"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 mt-4 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300"
                            >
                                Войти
                            </button>
                        </form>
                    </>
                )}
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Еще нет аккаунта?{" "}
                    <Link
                        to="/register"
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 transition-all duration-300"
                    >
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
