import React, { useState } from "react";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";

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
            setError("Некорректная формат почты.");
            return false;
        }
        if (password.length < 6) {
            setError("Пароль должен содержать не менее 6-ти символов.");
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
            .then((response) => {
                alert("Регистрация прошла успешно!");
                navigate("/login");
            })
            .catch((error) => {
                setError(error.response?.data || "Произошла ошибка при регистрации.");
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Регистрация</h2>
                {error && <p className="text-red-600 dark:text-red-400 text-center">{error}</p>}
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Имя пользователя</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring focus:ring-blue-500 dark:focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring focus:ring-blue-500 dark:focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring focus:ring-blue-500 dark:focus:ring-blue-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Повторите пароль</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring focus:ring-blue-500 dark:focus:ring-blue-400"
                            required
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRegister}
                        className="w-full py-3 mt-4 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300"
                    >
                        Зарегистрироваться
                    </button>
                </form>
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Уже есть аккаунт?{" "}
                    <Link
                        to="/login"
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 transition-all duration-300"
                    >
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );

};

export default Register;
