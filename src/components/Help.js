import React from 'react';
import { FaYoutube, FaVk, FaRegFileVideo, FaYandex, FaVideo } from 'react-icons/fa';
import {useNavigate} from "react-router-dom";


const Help = () => {
    const navigate = useNavigate();

    return (
        <div
            className="max-w-6xl container mx-auto mt-12 p-10 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 text-white rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-lg text-neutral-200 hover:text-blue-300 dark:hover:text-blue-400 transition-colors"
                >
                    <i className="fas fa-chevron-left mr-2"></i>Назад
                </button>
            </div>
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-white mb-4">Поддерживаемые типы видео URL</h1>
                <p className="text-lg text-neutral-200">Ознакомьтесь с типами видео URL, которые мы поддерживаем для
                    удобства просмотра.</p>
            </div>

            {/* Карточки с сервисами */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    {
                        icon: <FaYoutube className="text-4xl text-red-500"/>,
                        title: "YouTube",
                        urlText: "youtube.com или youtu.be",
                        example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    },
                    {
                        icon: <FaVideo className="text-4xl text-indigo-600"/>,
                        title: "RuTube",
                        urlText: "rutube.ru",
                        example: "https://rutube.ru/video/abcd1234efgh5678/"
                    },
                    {
                        icon: <FaVk className="text-4xl text-blue-500"/>,
                        title: "VK Video",
                        urlText: "vkvideo.ru или vk.com/video",
                        example: "https://vk.com/video123456_12345678"
                    },
                    {
                        icon: <FaRegFileVideo className="text-4xl text-orange-500"/>,
                        title: "OK.ru Video",
                        urlText: "ok.ru/video",
                        example: "https://ok.ru/video/abcd1234efgh5678"
                    },
                    {
                        icon: <FaYandex className="text-4xl text-yellow-500"/>,
                        title: "Yandex Video",
                        urlText: "yandex.ru/video",
                        example: "https://yandex.ru/video/search?text=example"
                    },
                    {
                        icon: <FaRegFileVideo className="text-4xl text-green-500"/>,
                        title: "Файлы",
                        urlText: "mp4, webm или ogg",
                        example: "https://example.com/video.mp4"
                    }
                ].map(({icon, title, urlText, example}, index) => (
                    <div key={index}
                         className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-2xl transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out">
                        <div className="flex items-center space-x-5 mb-4">
                            {icon}
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            Вставьте URL с {urlText}.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Пример: <code
                            className="text-indigo-600 dark:text-indigo-300 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded-md">{example}</code>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Help;
