import React, { useEffect, useState, useCallback, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axios from "axios";
import {useParams, useNavigate, Link} from "react-router-dom";
import Chat from "./Chat";
import toast from "react-hot-toast";
import SettingsModal from "./SettingsModal";
import {AnimatePresence, motion } from "framer-motion";
import VideoPlayer from "./VideoPlayer";

const Room = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [password, setPassword] = useState("");
    const [accessGranted, setAccessGranted] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [videoUrl, setVideoUrl] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);


    const handleVideoControl = useCallback((control) => {
        console.log("Обработка события управления видео:", control);
        switch (control.type) {
            case "UPDATE_URL":
                setVideoUrl(control.videoUrl);
                break;
            case "PLAY":
                setIsPlaying(true);
                break;
            case "PAUSE":
                setIsPlaying(false);
                break;
            case "SEEK":
                if (playerRef.current) {
                    playerRef.current.seekTo(control.timestamp);
                }
                break;
            default:
                console.warn("Неизвестный тип управления видео:", control.type);
                break;
        }
    }, []);

    useEffect(() => {
        const savedParticipants = JSON.parse(localStorage.getItem("participants")) || [];
        setParticipants(savedParticipants);

        if (connected) return;

        connectToRoom();

        return () => disconnectFromRoom();
    }, [id]);

    useEffect(() => {
        const savedAccessGranted = JSON.parse(localStorage.getItem("accessGranted"));
        const savedRoom = JSON.parse(localStorage.getItem("room"));
        const savedVideoUrl = localStorage.getItem("videoUrl") || "";

        const savedParticipants = JSON.parse(localStorage.getItem("participants")) || [];
        setParticipants(savedParticipants);
        setVideoUrl(savedVideoUrl);

        if (savedAccessGranted && savedRoom && savedRoom.id === id) {
            setAccessGranted(true);
            setRoom(savedRoom);
            connectToRoom();
        }
        return () => connected && disconnectFromRoom();
    }, [id, connected]);

    const connectToRoom = async () => {
        if (connected || stompClient) {
            console.warn("Соединение уже активно. Пропуск повторного подключения.");
            return;
        }

        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);

        client.connect(
            { Authorization: `Bearer ${token}` },
            () => {
                setConnected(true);
                client.subscribe(`/topic/participants/${id}`, (message) => {
                    setParticipants(JSON.parse(message.body));
                });
                client.subscribe(`/topic/video/${id}`, (message) => {
                    const videoControl = JSON.parse(message.body);
                    handleVideoControl(videoControl);
                });

                client.send(
                    "/app/join",
                    {},
                    JSON.stringify({ username, roomId: id, type: "JOIN" })
                );
                setStompClient(client);
            },
            (error) => {
                console.error("Ошибка подключения WebSocket:", error);
            }
        );
    };



    useEffect(() => {
        // Очистка доступа при смене комнаты
        setAccessGranted(false);
        setPassword(""); // Сброс введенного пароля
        loadRoomDetails();
    }, [id]);

    const loadRoomDetails = () => {
        axios
            .get(`http://localhost:8080/api/rooms/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                const roomData = response.data;
                setRoom(roomData);

                if (!roomData.hasPassword) {
                    // Если пароль не требуется, предоставляем доступ
                    setAccessGranted(true);
                    connectToRoom();
                }
            })
            .catch((error) => {
                console.error("Ошибка при загрузке комнаты:", error);
                toast.error("Ошибка загрузки комнаты.");
                navigate("/");
            });
    };

    useEffect(() => {
        if (accessGranted) {
            connectToRoom();
        }
    }, [accessGranted]);


    const handleRoomUpdate = (updatedRoom) => {
        setRoom((prevRoom) => ({
            ...prevRoom,
            ...updatedRoom, // Обновляем только измененные поля
        }));
    };


    const checkPassword = () => {
        axios
            .post(
                `http://localhost:8080/api/rooms/${id}/check-password`,
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((response) => {
                if (response.data) {
                    setAccessGranted(true);
                } else {
                    toast.error("Неверный пароль.");
                }
            })
            .catch((error) => {
                console.error("Ошибка при проверке пароля:", error);
                toast.error("Ошибка проверки пароля.");
            });
    };

    const disconnectFromRoom = async () => {
        if (stompClient) {
            try {
                if (connected) {
                    stompClient.send(
                        "/app/leave",
                        {},
                        JSON.stringify({ username, roomId: id, type: "LEAVE" })
                    );
                }
                stompClient.disconnect(() => {
                    console.log("WebSocket соединение завершено.");
                    setConnected(false);
                    setStompClient(null);
                    setParticipants([]); // Сбрасываем участников
                });
            } catch (error) {
                console.error("Ошибка при отключении от комнаты:", error);
            }
        } else {
            console.warn("Нет активного STOMP клиента для отключения.");
        }
    };

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/rooms/${id}/video-state`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                const state = response.data;
                console.log("Состояние видео:", state);
                if (state.videoUrl) {
                    setVideoUrl(state.videoUrl);
                    playerRef.current?.seekTo(state.timestamp);
                    setIsPlaying(state.type === "PLAY");
                } else {
                    console.warn("Видео URL не установлен.");
                }
            })
            .catch((error) => {
                console.error("Ошибка получения состояния видео:", error);
            });
    }, [id]);

    useEffect(() => {
        const switchRoom = async () => {
            console.log(`Переключение комнаты на ID: ${id}`);

            // Завершаем предыдущее соединение
            await disconnectFromRoom();

            // Сброс состояния
            setAccessGranted(false);
            setPassword("");
            setRoom(null);
            setParticipants([]);

            // Подключаемся к новой комнате
            loadRoomDetails();
        };

        switchRoom();
    }, [id]);



    const handleVideoUrlChange = (e) => {
        setVideoUrl(e.target.value);
    };

    const updateVideoUrl = () => {
        if (!stompClient) {
            console.error("WebSocket не подключен");
            return;
        }

        stompClient.send(`/app/video/${id}`, {}, JSON.stringify({
            roomId: id,
            videoUrl,
            type: "UPDATE_URL",
        }));

        setVideoUrl(videoUrl); // Обновление состояния
    };

    const handlePlay = () => {
        setIsPlaying(true);
        if (!stompClient) {
            console.error("WebSocket не подключен");
            return;
        }

        console.log("Отправка события PLAY");
        stompClient.send(`/app/video/${id}`, {}, JSON.stringify({
            roomId: id,
            type: "PLAY",
        }));
    };

    const handlePause = () => {
        setIsPlaying(false);
        if (!stompClient) {
            console.error("WebSocket не подключен");
            return;
        }

        console.log("Отправка события PAUSE");
        stompClient.send(`/app/video/${id}`, {}, JSON.stringify({
            roomId: id,
            type: "PAUSE",
        }));
    };

    const handleSeek = (timestamp) => {
        if (!stompClient) {
            console.error("WebSocket не подключен");
            return;
        }

        console.log("Отправка события SEEK", timestamp);
        stompClient.send(`/app/video/${id}`, {}, JSON.stringify({
            roomId: id,
            timestamp,
            type: "SEEK",
        }));
    };

    const deleteRoom = () => {
        axios.delete(`http://localhost:8080/api/rooms/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(() => {
            toast.success("Комната успешно удалена!");
            navigate("/");
        }).catch((error) => {
            console.error("Ошибка при удалении комнаты:", error);
            toast.error("Не удалось удалить комнату.");
        });
    };

    const toggleDeleteModal = () => {
        setIsConfirmDeleteOpen((prev) => !prev);
    };

    const copyRoomLink = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => toast.success("Ссылка на комнату скопирована!"))
            .catch((err) => toast.error("Ошибка копирования ссылки"));
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleParticipantsModal = () => {
        setIsParticipantsModalOpen(!isParticipantsModalOpen);
    };

    const toggleSettingsModal = () => {
        setIsSettingsModalOpen(!isSettingsModalOpen);
    };

    const removeParticipant = (participant) => {
        if (stompClient && connected) {
            stompClient.send(`/app/remove-participant/${id}`, {}, JSON.stringify({
                username: participant,
            }));
            toast.success(`${participant} удален из комнаты.`);
        } else {
            console.error("Попытка удалить участника без подключения.");
        }
    };

    useEffect(() => {
        if (!stompClient || !connected) return;

        const participantSubscription = stompClient.subscribe(
            `/topic/participants/${id}`,
            (message) => {
                try {
                    const updatedParticipants = JSON.parse(message.body);
                    setParticipants(updatedParticipants);
                } catch (error) {
                    console.error("Ошибка обработки участников:", error);
                }
            }
        );

        // Отправка события о присоединении
        stompClient.send(
            "/app/join",
            {},
            JSON.stringify({ username, roomId: id, type: "JOIN" })
        );

        return () => {
            // Удаление подписки при размонтировании
            if (participantSubscription) participantSubscription.unsubscribe();
        };
    }, [stompClient, connected, id]);


    const handleCancel = () => {
        navigate("/");
    };

    const handleVideoError = () => {
        toast.error("Ошибка воспроизведения видео. Проверьте URL или попробуйте снова.");
    };

    if (!room) {
        return <p>Загрузка комнаты...</p>;
    }

    if (!accessGranted) {
        if (room.hasPassword) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-neutral-200 dark:bg-neutral-800">
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg max-w-md w-full">
                        <div className="flex items-center justify-center mb-6">
                            <img
                                src="/logo.svg"
                                alt="Logo"
                                className="w-32 h-32"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white text-center mb-6">
                            {room.name || "Защищённая комната"}
                        </h2>
                        <p className="text-neutral-600 dark:text-gray-300 text-center mb-6">
                            Для входа в эту комнату требуется пароль
                        </p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mb-4 p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-fuchsia-900 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                            placeholder="Введите пароль"
                        />
                        <div className="flex mb-4">
                            <button
                                onClick={handleCancel}
                                className="w-full py-3 bg-neutral-200 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all duration-200 mr-2"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={checkPassword}
                                className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200"
                            >
                                Войти
                            </button>
                        </div>
                        <button
                            onClick={copyRoomLink}
                            className="w-full py-2 bg-neutral-200 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all duration-200"
                        >
                            Скопировать ссылку на комнату
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div
                className="bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white px-4 py-2 flex justify-between items-center shadow-md">
                <div className="flex items-start gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{room.name}</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Создатель: {room.owner}</p>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                            Участники ({participants.length})
                        </h3>
                        <div className="flex -space-x-3">
                            {participants.slice(0, 3).map((participant, index) => (
                                <div key={index} className="relative group">
                                    <a href={`/profile/${participant}`} className="focus:outline-none">
                                        <img
                                            src={participant.avatar ? `http://localhost:8080${participant.avatar}` : `https://ui-avatars.com/api/?name=${participant}&background=random&rounded=true`}
                                            alt={`${participant} avatar`}
                                            className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900"
                                        />
                                    </a>
                                    <div
                                        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-32 p-2 bg-white dark:bg-neutral-800 text-center rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <span className="text-sm text-neutral-900 dark:text-white">{participant}</span>
                                        {room.owner === username && (
                                            <button
                                                className="block mt-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                                                onClick={() => removeParticipant(participant)}
                                            >
                                                Удалить
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {participants.length > 3 && (
                                <button
                                    className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900 bg-gray-200 dark:bg-neutral-700 text-sm text-neutral-800 dark:text-white ml-2"
                                    onClick={toggleParticipantsModal}
                                >
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {isParticipantsModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg w-80 max-w-full">
                                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                                    Все участники
                                </h3>
                                <div className="flex flex-col gap-2 mt-2">
                                    {participants.map((participant, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md"
                                        >
                                            <Link to={`/profile/${participant}`} className="focus:outline-none">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${participant}&background=random&rounded=true`}
                                                    alt={`${participant} avatar`}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            </Link>
                                            <span className="text-sm text-neutral-900 dark:text-white">{participant}</span>
                                            {room.owner === username && (
                                                <button
                                                    className="ml-auto text-xs text-red-600 dark:text-red-400 hover:underline"
                                                    onClick={() => removeParticipant(participant)}
                                                >
                                                    Удалить
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                                    onClick={toggleParticipantsModal}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    {room.owner === username && (
                        <button
                            onClick={toggleSettingsModal}
                            className="group flex items-center justify-start w-12 hover:w-40 h-12 text-neutral-500 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 rounded-full hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900 transition-all duration-300 overflow-hidden"
                        >
                            <i className="fas fa-cog text-xl ml-4"></i>
                            <span
                                className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                                Настройки
                        </span>
                        </button>
                    )}
                    <button
                        onClick={toggleModal}
                        className="group flex items-center justify-start w-12 hover:w-40 h-12 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 overflow-hidden"
                    >
                        <i className="fas fa-edit text-xl ml-4"></i>
                        <span
                            className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                        Обновить URL
                    </span>
                    </button>
                    <button
                        onClick={copyRoomLink}
                        className="group flex items-center justify-start w-12 hover:w-40 h-12 text-neutral-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-300 overflow-hidden"
                    >
                        <i className="fas fa-link text-xl ml-4"></i>
                        <span
                            className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                        Копировать ссылку
                    </span>
                    </button>
                    {room.owner === username && (
                        <button
                            onClick={toggleDeleteModal}
                            className="group flex items-center justify-start w-12 hover:w-40 h-12 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-all duration-300 overflow-hidden"
                        >
                            <i className="fas fa-trash-alt text-xl ml-4"></i>
                            <span
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                            Удалить комнату
                        </span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center justify-start w-12 hover:w-40 h-12 text-red-500 hover:text-red-500 dark:hover:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-700 transition-all duration-300 overflow-hidden"
                    >
                        <i className="fas fa-sign-out-alt text-xl ml-4"></i>
                        <span
                            className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                        Выйти
                    </span>
                    </button>
                </div>
            </div>

            <div className="flex flex-grow">
                <div className="flex-1 bg-white dark:bg-black">
                    {videoUrl ? (
                        <VideoPlayer
                            ref={playerRef}
                            url={videoUrl}
                            playing={isPlaying}
                            controls
                            width="100%"
                            height="100%"
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onSeek={(time) => handleSeek(time)}
                        />
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center h-full bg-neutral-200 dark:bg-neutral-800 text-center p-6">
                            <motion.div
                                initial={{opacity: 0, y: -20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5}}
                                className="text-center"
                            >
                                <div className="relative inline-block mb-4">
                                    <i className="fas fa-video text-5xl text-neutral-600 dark:text-neutral-300"></i>
                                    <div
                                        className="absolute -bottom-1 -right-2 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                                    <div
                                        className="absolute -bottom-1 -right-2 w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-700 dark:text-neutral-200 mb-3">
                                    Видео не найдено
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    Укажите URL видео, чтобы начать просмотр.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{opacity: 0, scale: 0.8}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{delay: 0.3, duration: 0.5}}
                                className="w-full max-w-sm"
                            >
                                <button
                                    onClick={toggleModal}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
                                >
                                    Обновить URL
                                </button>

                                <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                                    Не знаете, какой URL указать? <Link to="/help"
                                                                     className="text-blue-600 hover:underline focus:underline dark:text-blue-400">
                                    Посмотреть примеры
                                </Link>.
                                </p>
                            </motion.div>
                        </div>

                    )}

                    <AnimatePresence>
                        {isModalOpen && (
                            <motion.div
                                className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                            >
                                <motion.div
                                    className="bg-white dark:bg-neutral-900 text-black dark:text-white p-6 rounded-2xl shadow-2xl max-w-md w-full"
                                    initial={{scale: 0.8}}
                                    animate={{scale: 1}}
                                    exit={{scale: 0.8}}
                                >
                                    <h3 className="text-2xl font-bold mb-6 text-center">Обновить URL видео</h3>
                                    <input
                                        type="text"
                                        value={videoUrl}
                                        onChange={handleVideoUrlChange}
                                        placeholder="Введите URL видео"
                                        className="w-full mb-6 p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-neutral-100 dark:bg-neutral-800"
                                    />
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => {
                                                updateVideoUrl();
                                                toggleModal();
                                            }}
                                            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors duration-300"
                                        >
                                            Обновить
                                        </button>
                                        <button
                                            onClick={toggleModal}
                                            className="w-full text-red-600 dark:text-red-400 py-3 rounded-lg font-medium hover:bg-red-600/10 hover:text-red-600 dark:hover:bg-red-500/10 transition-colors duration-300"
                                        >
                                            Закрыть
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div>
                <div className="w-auto max-w-xl">
                    <Chat stompClient={stompClient} roomId={id} username={username} participants={participants}/>
                </div>
            </div>
            <AnimatePresence>
                {isSettingsModalOpen && (
                    <SettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={toggleSettingsModal}
                        roomId={id}
                        token={token}
                        onRoomUpdate={handleRoomUpdate}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isConfirmDeleteOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl max-w-md w-full"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                        >
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                Вы уверены, что хотите удалить эту комнату?
                            </h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                                Это действие необратимо. Если вы удалите комнату, все связанные данные будут потеряны.
                            </p>
                            <div className="flex items-center gap-4 justify-end">
                                <button
                                    onClick={toggleDeleteModal}
                                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={deleteRoom}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                                >
                                    Удалить
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );

};

export default Room;
