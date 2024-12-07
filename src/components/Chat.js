import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { motion, AnimatePresence } from "framer-motion";
import Linkify from "react-linkify";

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
    const textareaRef = useRef(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed((prev) => !prev);

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
            const textarea = textareaRef.current;
            textarea.style.height = "auto";
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleMessageChange = (e) => {
        setChatMessage(e.target.value);

        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 150;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
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

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    return (
        <div
            ref={chatContainerRef}
            className={`flex flex-col h-[calc(100vh-80px)] ${
                isCollapsed ? "w-20 fixed right-0 bottom-0" : "w-[400px]"
            } bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-white relative transition-all duration-300`}
            onClick={() => setContextMenu({visible: false, x: 0, y: 0, messageId: null})}
        >
            <div
                className="flex items-center justify-between p-2 bg-neutral-200 dark:bg-neutral-700">
                <div
                    className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-2"}`}>
                    <h2 className={`text-lg font-bold ${isCollapsed ? "hidden" : "block"} transition-opacity duration-300`}>Чат</h2>
                    {isCollapsed && (
                        <h2 className="text-lg font-bold">Чат</h2>
                    )}
                </div>
                <button
                    onClick={toggleCollapse}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 text-indigo-500 hover:text-purple-500 shadow-lg hover:shadow-xl transition-transform transform hover:scale-110 duration-300"
                    aria-label="Toggle Collapse"
                >
                    {isCollapsed ? (
                        <i className="fas fa-chevron-left text-xs"></i>
                    ) : (
                        <i className="fas fa-chevron-right text-xs"></i>
                    )}
                </button>
            </div>
            {!isCollapsed ? (
                <div className="flex-1 overflow-y-auto p-4 bg-neutral-100 dark:bg-neutral-800 rounded-t-lg shadow-inner relative">
                    {chatMessages.map((msg, index) => {
                        const isSameSenderAsPrevious =
                            index > 0 && chatMessages[index - 1]?.username === msg.username;

                        return (
                            <React.Fragment key={msg.id}>
                                {isNewDay(msg.timestamp, chatMessages[index - 1]?.timestamp) && (
                                    <div className="text-center text-neutral-500 dark:text-neutral-400 text-xs my-2">
                                        {new Date(msg.timestamp).toLocaleDateString()}
                                    </div>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`mb-2 flex items-start ${
                                        msg.username === username ? "justify-end" : "justify-start"
                                    }`}
                                    onContextMenu={(e) => handleContextMenu(e, msg.id)}
                                >
                                    {!isSameSenderAsPrevious && msg.username !== username && (
                                        <motion.img
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            src={`https://ui-avatars.com/api/?name=${msg.username}&background=random&rounded=true`}
                                            alt={`${msg.username} avatar`}
                                            className="w-8 h-8 mr-2 rounded-full border-2 border-neutral-300 dark:border-neutral-600 shadow-lg"
                                            title={msg.username}
                                        />
                                    )}

                                    <div
                                        className={`flex flex-col max-w-[75%] ${
                                            isSameSenderAsPrevious && msg.username !== username ? "ml-10" : ""
                                        }`}
                                    >
                                        {!isSameSenderAsPrevious && msg.username !== username && (
                                            <span className="text-xs font-semibold">
                                                {msg.username}
                                            </span>
                                        )}
                                        <div
                                            className={`relative p-2 rounded-xl shadow-md text-sm min-w-32 ${
                                                msg.username === username
                                                    ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-tr-none"
                                                    : "bg-white text-neutral-800 rounded-tl-none dark:bg-neutral-700 dark:text-neutral-200"
                                            }`}
                                        >
                                            {msg.parentMessage && (
                                                <blockquote
                                                    className="mb-2 pl-3 border-l-4 border-purple-400 dark:text-white text-xs">
                                                    Ответ на: {msg.parentMessage.encryptedContent}
                                                </blockquote>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <Linkify>
                                                    <p className="break-words whitespace-pre-wrap">{msg.encryptedContent}</p>
                                                </Linkify>
                                                <span className="flex text-xs dark:text-neutral-400 justify-end mt-auto ml-auto">
                                                    {formatDate(msg.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                    {showScrollButton && (
                        <button
                            onClick={scrollToBottom}
                            className="absolute bottom-20 right-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
                        >
                            <i className="fas fa-arrow-down"></i>
                        </button>
                    )}
                    <div ref={messagesEndRef}/>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <i className="fas fa-comments text-gray-400 text-3xl cursor-pointer" onClick={toggleCollapse}></i>
                </div>
            )}
            <AnimatePresence>
                {contextMenu.visible && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.9}}
                        className="absolute bg-neutral-200 dark:bg-neutral-700 rounded-lg shadow-lg p-2 text-white w-52"
                        style={{top: contextMenu.y, left: contextMenu.x}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="block w-full text-left px-3 py-2 text-gray-800 dark:text-neutral-200 hover:bg-neutral-300 hover:rounded-lg dark:hover:bg-neutral-600 transition-all duration-300"
                            onClick={() => handleReply(contextMenu.messageId)}
                        >
                            <i className="fas fa-reply mr-2"></i> Ответить
                        </button>
                        {chatMessages.find((msg) => msg.id === contextMenu.messageId)?.username ===
                            username && (
                                <button
                                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-600/10 hover:rounded-lg transition-all duration-300"
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white p-6 rounded-2xl shadow-lg max-w-[350px] w-full"
                        >
                            <h3 className="text-2xl font-semibold mb-4">Удалить сообщение?</h3>
                            <p className="text-sm mb-6">
                                Вы уверены, что хотите удалить это сообщение? Это действие необратимо.
                            </p>
                            <div className="flex justify-end items-center space-x-4">
                                <button
                                    className="bg-gray-300 hover:bg-neutral-400 text-neutral-800  py-2 px-6 rounded-md text-sm transition-all duration-200 ease-in-out"
                                    onClick={() => setDeleteModal({ visible: false, messageId: null })}
                                >
                                    Отмена
                                </button>
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md text-sm transition-all duration-200 ease-in-out"
                                    onClick={handleDelete}
                                >
                                    Удалить
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {replyTo && (
                <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    className="flex w-full max-w-lg items-center bg-white dark:bg-neutral-700 border-l-4 border-purple-500 px-4 py-3 rounded-md shadow-lg"
                >
                    <div className="flex-1 overflow-hidden">
                    <span className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                        Ответ на:
                    </span>
                        <span className="block text-sm text-neutral-600 dark:text-neutral-300 truncate">
                        {replyTo.encryptedContent}
                    </span>
                    </div>
                    <button
                        onClick={() => setReplyTo(null)}
                        className="ml-3 flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 hover:text-neutral-800 dark:hover:text-neutral-100 transition duration-200"
                        aria-label="Удалить ответ"
                    >
                        <i className="fas fa-times text-base"></i>
                    </button>
                </motion.div>
            )}

            {!isCollapsed && (
                <div className="bg-neutral-200 dark:bg-neutral-900 p-2 rounded-b-lg shadow-inner flex items-end space-x-2">
                <textarea
                    ref={textareaRef}
                    className="flex-grow bg-neutral-100 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 text-neutral-800 dark:text-white p-3 rounded-xl shadow focus:outline-none resize-none overflow-y-auto"
                    placeholder="Введите сообщение"
                    value={chatMessage}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{maxHeight: "150px"}}
                ></textarea>
                    <button
                        className="relative bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-11 h-11 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-indigo-600 active:scale-95"
                        onClick={sendMessage}
                    >
                    <span
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-75 rounded-full blur-lg"
                    ></span>
                        <span className="relative flex items-center justify-center">
                        <i className="fas fa-arrow-up text-xl"></i>
                    </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Chat;
