import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { ClipLoader } from "react-spinners";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const RoomsList = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socketStatus, setSocketStatus] = useState(false);
    const token = localStorage.getItem("token");

    const fetchRooms = () => {
        if (!token) return;

        setLoading(true);
        axios
            .get("http://localhost:8080/api/rooms", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setRooms(response.data);
                setFilteredRooms(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при получении списка комнат:", error);
                setError("Не удалось загрузить комнаты. Попробуйте снова позже.");
                setLoading(false);
            });
    };

    const debouncedSearch = debounce((query) => {
        setFilteredRooms(
            rooms.filter((room) =>
                room.name.toLowerCase().includes(query.toLowerCase())
            )
        );
    }, 300);

    useEffect(() => {
        if (!token) return;

        fetchRooms();

        const wsClient = new Client({
            brokerURL: "ws://localhost:8080/ws",
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            onConnect: () => {
                setSocketStatus(true);
                wsClient.subscribe("/topic/participants", (message) => {
                    const updatedRooms = JSON.parse(message.body);
                    setRooms(updatedRooms);
                    setFilteredRooms(updatedRooms);
                });
            },
            onDisconnect: () => {
                setSocketStatus(false);
            },
        });

        wsClient.activate();

        return () => {
            wsClient.deactivate();
        };
    }, [token]);

    useEffect(() => {
        if (searchQuery.trim()) {
            debouncedSearch(searchQuery);
        } else {
            setFilteredRooms(rooms);
        }
        return debouncedSearch.cancel;
    }, [searchQuery, rooms]);

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-700 text-white flex-col">
                <img src="/logo.svg" alt="Logo" className="w-32 mb-8" />
                <h2 className="text-3xl font-bold mb-4">Доступ запрещен</h2>
                <p className="mb-6 text-center max-w-lg">
                    У вас нет доступа к списку комнат. Войдите в систему, чтобы продолжить.
                </p>
                <Link
                    to="/login"
                    className="px-6 py-3 bg-white text-blue-600 rounded-full shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
                >
                    Войти
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                <ClipLoader size={50} color="#3b82f6" />
                <p className="mt-4 text-xl">Загрузка комнат...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                <p className="text-xl text-red-600 dark:text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white p-6">
            <h2 className="text-3xl font-bold mb-6 text-neutral-700 dark:text-neutral-300">
                Доступные комнаты
            </h2>

            <div className="flex flex-col items-center w-full max-w-3xl">
                <input
                    type="text"
                    placeholder="Поиск комнат..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all mb-4"
                />
            </div>

            <Swiper
                slidesPerView={1}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                modules={[Autoplay, EffectFade, Pagination]}
                pagination={{
                    clickable: true,
                    renderBullet: (index, className) => {
                        return `
                            <span class="${className} custom-bullet"></span>`;
                    },
                }}
                className="w-full max-w-3xl mt-6"
            >
                {filteredRooms && filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                        <SwiperSlide key={room.id}>
                            <motion.div
                                className="block bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-transform"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Link to={`/rooms/${room.id}`}>
                                    <div className="flex items-center mb-4">
                                        <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden  text-white flex items-center justify-center text-xl font-bold">
                                            {room.avatarUrl ? (
                                                <img
                                                    src={`http://localhost:8080/${room.avatarUrl}`}
                                                    alt="Room Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img src={`https://ui-avatars.com/api/?name=${room.name}&background=random&rounded=true`} alt="Room Avatar" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-2xl font-bold">{room.name}</h3>
                                            <p className="text-sm text-gray-200">
                                                Участников: {room.participants || 0}
                                            </p>
                                            <span className="text-xs bg-white text-indigo-600 px-2 py-1 rounded-full mt-1 inline-block">
                                                {room.topic || "Без темы"}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-200 mb-4">
                                        {room.description || "Описание отсутствует."}
                                    </p>
                                    <div className="flex justify-between text-xs text-gray-300">
                                        <span>
                                            Последняя активность:{" "}
                                            {new Date(room.updated_at).toLocaleString()}
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        </SwiperSlide>
                    ))
                ) : (
                    <SwiperSlide>
                        <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 p-6">
                            <DotLottieReact
                                src="https://lottie.host/cf9e7a77-0088-4124-a1b6-ea835545a420/6ssarEsffc.lottie"
                                loop
                                autoplay
                                className="w-full h-40 mb-6"
                            />
                            <p className="text-2xl font-bold mb-4">Комнаты не найдены</p>
                            <p className="text-center max-w-lg mb-6">
                                К сожалению, мы не смогли найти комнаты по вашему запросу.
                                Попробуйте изменить критерии поиска или создать новую комнату.
                            </p>
                            <Link
                                to="/create-room"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition-transform transform hover:scale-105"
                            >
                                Создать новую комнату
                            </Link>
                            <button
                                onClick={fetchRooms}
                                className="mt-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-full shadow hover:bg-gray-300 transition-transform transform hover:scale-105"
                            >
                                Обновить список
                            </button>
                        </div>
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    );
};

export default RoomsList;
