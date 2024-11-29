import React, { useEffect, useState, useCallback, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import ReactPlayer from "react-player";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Chat from "./Chat";
import toast from "react-hot-toast";

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


    const handleVideoControl = useCallback((control) => {
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

    const connectToRoom = () => {
        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);

        client.connect({ Authorization: `Bearer ${token}` }, () => {
            setConnected(true);
            client.subscribe(`/topic/participants/${id}`, (message) => {
                setParticipants(JSON.parse(message.body));
            });

            client.subscribe(`/topic/video/${id}`, (message) => {
                const videoControl = JSON.parse(message.body);
                handleVideoControl(videoControl);
            });

            client.send("/app/join", {}, JSON.stringify({ username, roomId: id, type: "JOIN" }));
            setStompClient(client);
        }, (error) => {
            console.error("WebSocket connection error:", error);
        });
    };

    const loadRoomDetails = () => {
        axios.get(`http://localhost:8080/api/rooms/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(response => {
            const roomData = response.data;
            setRoom(roomData);
            if (!roomData.hasPassword) {
                setAccessGranted(true);
                connectToRoom();
                localStorage.setItem("accessGranted", true);
            }
        }).catch(error => {
            console.error("Ошибка при получении информации о комнате:", error);
        });
    };

    const checkPassword = () => {
        axios.post(`http://localhost:8080/api/rooms/${id}/check-password`, { password }, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(response => {
            if (response.data) {
                setAccessGranted(true);
                loadRoomDetails();
                connectToRoom();
                localStorage.setItem("accessGranted", true);
            } else {
                alert("Неверный пароль");
            }
        }).catch(error => {
            console.error("Ошибка при проверке пароля:", error);
        });
    };

    const disconnectFromRoom = () => {
        if (stompClient && connected) {
            stompClient.send("/app/leave", {}, JSON.stringify({ username, roomId: id, type: "LEAVE" }));
            stompClient.disconnect(() => {
                setConnected(false);
                console.log("Disconnected from WebSocket");
            });
        }
    };

    const handleVideoUrlChange = (e) => setVideoUrl(e.target.value);

    const updateVideoUrl = () => {
        stompClient.send(`/app/video/${id}`, {}, JSON.stringify({
            roomId: id,
            videoUrl,
            type: "UPDATE_URL"
        }));
    };

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
        stompClient.send(`/app/video/${id}`, {}, JSON.stringify({
            roomId: id,
            type: "PLAY"
        }));
    }, [id, stompClient]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
        stompClient.send(`/app/video/${id}`, {}, JSON.stringify({
            roomId: id,
            type: "PAUSE"
        }));
    }, [id, stompClient]);

    const deleteRoom = () => {
        axios.delete(`http://localhost:8080/api/rooms/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(() => {
            alert("Комната удалена");
            navigate("/");
        }).catch(error => {
            console.error("Ошибка при удалении комнаты:", error);
        });
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

    const removeParticipant = (participant) => {
        stompClient.send(`/app/remove-participant/${id}`, {}, JSON.stringify({
            username: participant,
        }));
        toast.success(`${participant} удален из комнаты.`);
    };


    const handleCancel = () => {
        navigate("/");
    };

    const handleVideoError = () => {
        toast.error("Ошибка воспроизведения видео. Проверьте URL или попробуйте снова.");
    };

    if (!accessGranted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Введите пароль для входа в комнату</h2>
                    <h3 className="text-lg mb-4"></h3>
                    <input
                        type="password"
                        className="w-full mb-4 p-2 rounded focus:outline-none focus:border-blue-500 bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        onClick={checkPassword}
                        className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
                    >
                        Войти
                    </button>
                    <button
                        onClick={handleCancel}
                        className="bg-red-600 dark:bg-red-500 text-white py-2 px-4 ml-2 rounded-md hover:bg-red-700 dark:hover:bg-red-400 transition-colors"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        );
    }

    if (!room) return <p className="text-gray-500 dark:text-gray-300">Загрузка...</p>;

    const isOwner = username === room.owner;

    return (
        <div className="flex flex-col min-h-screen">
            <div
                className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-start gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{room.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Создатель: {room.owner}</p>
                    </div>

                    {/* Участники */}
                    <div className="flex flex-col">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Участники ({participants.length})
                        </h3>
                        <div className="flex -space-x-3">
                            {participants.slice(0, 3).map((participant, index) => (
                                <div key={index} className="relative group">
                                    {/* Аватар */}
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${participant}&background=random&rounded=true`}
                                        alt={`${participant} avatar`}
                                        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900"
                                    />
                                    {/* Информация при наведении */}
                                    <div
                                        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-32 p-2 bg-white dark:bg-gray-800 text-center rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <span className="text-sm text-gray-900 dark:text-white">{participant}</span>
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
                            {/* Кнопка "Еще" */}
                            {participants.length > 3 && (
                                <button
                                    className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-white ml-2"
                                    onClick={toggleParticipantsModal}
                                >
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Модальное окно */}
                    {isParticipantsModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-80 max-w-full">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Все участники
                                </h3>
                                <div className="flex flex-col gap-2 mt-2">
                                    {participants.map((participant, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                                        >
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${participant}&background=random&rounded=true`}
                                                alt={`${participant} avatar`}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="text-sm text-gray-900 dark:text-white">{participant}</span>
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
                    <button
                        onClick={toggleModal}
                        className="group flex items-center justify-start w-12 hover:w-40 h-12 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 overflow-hidden"
                    >
                        <i className="fas fa-edit text-xl ml-4"></i>
                        <span
                            className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                        Обновить URL
                    </span>
                    </button>
                    <button
                        onClick={copyRoomLink}
                        className="group flex items-center justify-start w-12 hover:w-40 h-12 text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-300 overflow-hidden"
                    >
                        <i className="fas fa-link text-xl ml-4"></i>
                        <span
                            className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                        Копировать ссылку
                    </span>
                    </button>
                    {room.owner === username && (
                        <button
                            onClick={deleteRoom}
                            className="group flex items-center justify-start w-12 hover:w-40 h-12 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-all duration-300 overflow-hidden"
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
                        className="group flex items-center justify-start w-12 hover:w-40 h-12 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 overflow-hidden"
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
                        <ReactPlayer
                            ref={playerRef}
                            url={videoUrl}
                            playing={isPlaying}
                            controls
                            width="100%"
                            height="100%"
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onError={handleVideoError}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                            <i className="fas fa-video text-4xl text-gray-600 dark:text-gray-300"></i>
                            <p className="text-gray-600 dark:text-gray-300">Видео не найдено. Укажите URL.</p>
                            <button
                                onClick={toggleModal}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
                                Обновить URL
                            </button>
                        </div>
                    )}
                    {isOwner && isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div
                                className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                                <h3 className="text-xl font-semibold mb-4">Обновить URL видео</h3>
                                <input
                                    type="text"
                                    value={videoUrl}
                                    onChange={handleVideoUrlChange}
                                    placeholder="Введите URL видео"
                                    className="w-full mb-4 p-2 rounded focus:outline-none focus:border-blue-500 bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                                />
                                <button
                                    onClick={() => {
                                        updateVideoUrl();
                                        toggleModal();
                                    }}
                                    className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
                                >
                                    Обновить
                                </button>
                                <button
                                    onClick={toggleModal}
                                    className="mt-4 w-full text-center text-red-600 dark:text-red-400"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-1/4">
                    <Chat stompClient={stompClient} roomId={id} username={username} participants={participants}/>
                </div>
            </div>
        </div>
    );

};

export default Room;
