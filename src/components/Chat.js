import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { motion, AnimatePresence } from "framer-motion";

const Chat = ({ roomId, username }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [chatMessage, setChatMessage] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        messageId: null,
    });
    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        messageId: null,
    });
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const client = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/chat/${roomId}`);
            setChatMessages(
                response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            );
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        client.current = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            onConnect: () => {
                client.current.subscribe(`/topic/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setChatMessages((prev) => {
                        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
                        return [...prev, newMessage].sort(
                            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                        );
                    });
                });

                client.current.subscribe(`/topic/${roomId}/typing`, (message) => {
                    setIsTyping(JSON.parse(message.body).isTyping);
                });

                client.current.subscribe(`/topic/${roomId}/notifications`, (message) => {
                    setChatMessages((prev) => [
                        ...prev,
                        {
                            id: `notification-${Date.now()}`,
                            username: null,
                            encryptedContent: message.body,
                            timestamp: new Date().toISOString(),
                        },
                    ]);
                });
            },
            onStompError: (frame) => console.error("WebSocket error:", frame.headers["message"]),
        });

        client.current.activate();
        return () => client.current && client.current.deactivate();
    }, [roomId]);


    const sendMessage = async () => {
        if (!chatMessage.trim()) return;
        try {
            await axios.post(`http://localhost:8080/api/chat/${roomId}`, {
                username,
                encryptedContent: chatMessage,
                parentMessage: replyTo ? { id: replyTo.id } : null,
            });
            setChatMessage("");
            setReplyTo(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleTyping = (e) => {
        setChatMessage(e.target.value);
        if (client.current) {
            client.current.publish({
                destination: `/app/${roomId}/typing`,
                body: JSON.stringify({ username, isTyping: !!e.target.value }),
            });
        }
    };

    const handleContextMenu = (e, messageId) => {
        e.preventDefault();
        const chatRect = chatContainerRef.current.getBoundingClientRect();
        let x = e.clientX - chatRect.left;
        let y = e.clientY - chatRect.top;

        const menuWidth = 150;
        const menuHeight = 80;

        if (x + menuWidth > chatRect.width) x = chatRect.width - menuWidth;
        if (y + menuHeight > chatRect.height) y = chatRect.height - menuHeight;

        setContextMenu({ visible: true, x, y, messageId });
    };

    const handleReply = (messageId) => {
        const message = chatMessages.find((msg) => msg.id === messageId);
        setReplyTo(message);
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };

    const confirmDelete = (messageId) => {
        setDeleteModal({ visible: true, messageId });
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/chat/${deleteModal.messageId}`);
            setChatMessages((prev) =>
                prev.filter((msg) => msg.id !== deleteModal.messageId)
            );
        } catch (error) {
            console.error("Error deleting message:", error);
        }
        setDeleteModal({ visible: false, messageId: null });
    };

    const formatDate = (date) => {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(date).toLocaleTimeString([], options);
    };


    const isNewDay = (current, previous) => {
        return (
            !previous ||
            new Date(current).toDateString() !== new Date(previous).toDateString()
        );
    };

    useEffect(() => {
        fetchMessages();
    }, [roomId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;

        const handleScroll = () => {
            if (chatContainer) {
                const { scrollTop, scrollHeight, clientHeight } = chatContainer;
                const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 20;
                setShowScrollButton(!isAtBottom);
            }
        };


        if (chatContainer) {
            chatContainer.addEventListener("scroll", handleScroll);
            handleScroll(); // Установка начального состояния
            return () => chatContainer.removeEventListener("scroll", handleScroll);
        }
    }, []);



    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);
    return (
        <div
            ref={chatContainerRef}
            className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-white relative"
            onClick={() => setContextMenu({visible: false, x: 0, y: 0, messageId: null})}
        >
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-t-lg shadow-inner relative">
                {chatMessages.map((msg, index) => (
                    <React.Fragment key={msg.id}>
                        {isNewDay(msg.timestamp, chatMessages[index - 1]?.timestamp) && (
                            <div className="text-center text-gray-500 dark:text-gray-400 text-xs my-4">
                                {new Date(msg.timestamp).toLocaleDateString()}
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-4 flex ${
                                msg.username === username ? "justify-end" : "justify-start"
                            }`}
                            onContextMenu={(e) => handleContextMenu(e, msg.id)}
                        >
                            {msg.username !== username && (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${msg.username}&background=random&rounded=true`}
                                    alt={`${msg.username} avatar`}
                                    className="w-8 h-8 mr-2 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-lg"
                                    title={msg.username}
                                />
                            )}

                            <div
                                className={`p-3 rounded-xl max-w-lg text-sm shadow-lg transition-all duration-300 ${
                                    msg.username === username
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">{msg.username}</span>
                                    <p className="text-xs ml-8 text-gray-400 dark:text-gray-200">
                                        {formatDate(msg.timestamp)}
                                    </p>
                                </div>

                                {msg.parentMessage && (
                                    <blockquote
                                        className="text-gray-500 dark:text-gray-400 text-xs border-l-2 border-gray-300 dark:border-gray-500 pl-2 mb-2"
                                    >
                                        Ответ на: {msg.parentMessage.encryptedContent}
                                    </blockquote>
                                )}

                                <p className="mt-1 break-words">{msg.encryptedContent}</p>
                            </div>
                        </motion.div>
                    </React.Fragment>
                ))}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-20 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                    >
                        <i className="fas fa-arrow-down"></i>
                    </button>
                )}
                <div ref={messagesEndRef}/>
                {isTyping && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic"
                    >
                        Кто-то печатает...
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {contextMenu.visible && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.9}}
                        className="absolute bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg p-2 text-white w-36"
                        style={{top: contextMenu.y, left: contextMenu.x}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                            onClick={() => handleReply(contextMenu.messageId)}
                        >
                            <i className="fas fa-reply mr-2"></i> Ответить
                        </button>
                        {chatMessages.find((msg) => msg.id === contextMenu.messageId)?.username ===
                            username && (
                                <button
                                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-600/10 transition-all duration-300"
                                    onClick={() => confirmDelete(contextMenu.messageId)}
                                >
                                    <i className="fas fa-trash-alt mr-2"></i> Удалить
                                </button>
                            )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteModal.visible && (
                    <motion.div
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    >
                        <div className="bg-gray-200 dark:bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Подтвердите удаление</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Вы уверены, что хотите удалить это сообщение? Это действие
                                необратимо.
                            </p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                    onClick={() => setDeleteModal({visible: false, messageId: null})}
                                >
                                    Отмена
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                    onClick={handleDelete}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {replyTo && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-lg shadow-inner"
                >
                    <span className="text-sm mr-2">Ответ на: {replyTo.encryptedContent}</span>
                    <button onClick={() => setReplyTo(null)}>
                        <i className="fas fa-times"/>
                    </button>
                </motion.div>
            )}
            <div className="bg-gray-200 dark:bg-gray-900 p-2 rounded-b-lg shadow-inner flex items-center space-x-2">

                <input
                    type="text"
                    className="flex-grow bg-gray-200 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-lg shadow focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Введите сообщение"
                    value={chatMessage}
                    onChange={handleTyping}
                />
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-lg shadow"
                    onClick={sendMessage}
                >
                    <i className="fas fa-arrow-up"></i>
                </button>
            </div>
        </div>
    );
};

export default Chat;
