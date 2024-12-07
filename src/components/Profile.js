import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Settings from "./Settings";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [newLink, setNewLink] = useState({ name: "", url: "" });
    const [links, setLinks] = useState([]);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [currentPage, setCurrentPage] = useState("profile");
    const [isLinkSectionOpen, setIsLinkSectionOpen] = useState(false);

    const fetchProfile = () => {
        axios
            .get("http://localhost:8080/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setUser(response.data);
                setAvatarPreview(response.data.avatarUrl ? `http://localhost:8080${response.data.avatarUrl}` : "");
                setLinks(response.data.socialLinks || []);
            })
            .catch((error) => {
                console.error("Ошибка при получении информации о пользователе:", error);
                toast.error("Не удалось загрузить данные профиля");
            });
    };

    const fetchLinks = () => {
        if (!user) return; // Avoid fetching if user is null
        axios
            .get(`http://localhost:8080/api/users/${user.id}/social-links`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setLinks(response.data);
            })
            .catch((error) => {
                console.error("Ошибка при получении ссылок:", error);
                toast.error("Не удалось загрузить ссылки");
            });
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    useEffect(() => {
        fetchLinks();
    }, [user]); // Fetch links only when the user object is updated

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const uploadAvatar = () => {
        if (!avatar) {
            toast.error("Выберите файл для загрузки");
            return;
        }

        const formData = new FormData();
        formData.append("file", avatar);

        axios
            .post(`http://localhost:8080/api/users/${user.id}/upload-avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                toast.success("Аватар успешно загружен!");
                setAvatarPreview(`http://localhost:8080${response.data}`);
                setAvatar(null);
            })
            .catch((error) => {
                console.error("Ошибка при загрузке аватара:", error);
                toast.error("Не удалось загрузить аватар");
            });
    };

    const deleteAvatar = () => {
        axios
            .delete(`http://localhost:8080/api/users/${user.id}/avatar`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                toast.success("Аватар успешно удалён!");
                setAvatarPreview("");
            })
            .catch((error) => {
                console.error("Ошибка при удалении аватара:", error);
                toast.error("Не удалось удалить аватар");
            });
    };

    const handleAddLink = () => {
        if (!newLink.name || !newLink.url) {
            toast.error("Название и URL не могут быть пустыми");
            return;
        }

        const urlPattern = /^(http|https):\/\/[^ "]+$/;
        if (!urlPattern.test(newLink.url)) {
            toast.error("Введите корректный URL");
            return;
        }

        axios
            .post(`http://localhost:8080/api/users/${user.id}/social-links`, newLink, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                toast.success("Ссылка добавлена!");
                fetchProfile();
                setNewLink({ name: "", url: "" });
            })
            .catch((error) => {
                console.error("Ошибка при добавлении ссылки:", error);
                toast.error("Не удалось добавить ссылку");
            });
    };

    const handleDeleteLink = (linkId) => {
        axios
            .delete(`http://localhost:8080/api/users/${user.id}/social-links/${linkId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                toast.success("Ссылка удалена");
                fetchProfile();
            })
            .catch((error) => {
                console.error("Ошибка при удалении ссылки:", error);
                toast.error("Не удалось удалить ссылку");
            });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem('username');
        navigate("/login");
        toast.success("Вы вышли из системы");
    };


    if (!user) return <p>Загрузка...</p>;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
            <Toaster position="top-right"/>
            <Link
                to="/"
                className="absolute top-4 left-4 text-neutral-900 dark:text-white hover:text-blue-500 dark:hover:text-[#7289DA]"
            >
                <i className="fas fa-chevron-left text-xl"></i>
            </Link>
            <motion.div
                className="w-full lg:w-1/5 bg-neutral-100 dark:bg-neutral-900 p-4 space-y-4"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3}}
            >
                <img
                    src={avatarPreview || "/logo.svg"}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                />
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{user.username}</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">{user.email}</p>
                </div>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => setCurrentPage("profile")}
                            className={`w-full py-2 px-4 text-left rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:outline-none ${
                                currentPage === "profile" ? "bg-neutral-200 dark:bg-neutral-800" : ""
                            }`}
                        >
                            Профиль
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentPage("settings")}
                            className={`w-full py-2 px-4 text-left rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:outline-none ${
                                currentPage === "settings" ? "bg-neutral-200 dark:bg-neutral-800" : ""
                            }`}
                        >
                            Настройки
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setIsLogoutModalVisible(true)}
                            className="w-full py-2 px-4 text-left rounded text-red-500 hover:bg-red-500/10 dark:hover:bg-red-600/10 mt-4 focus:outline-none"
                        >
                            Выход
                        </button>
                    </li>
                </ul>
            </motion.div>

            <AnimatePresence>
                {isLogoutModalVisible && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <motion.div
                            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div className="bg-red-500 p-6 text-center dark:bg-red-600">
                                <i className="fas fa-sign-out-alt text-4xl text-white"></i>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">
                                    Подтвердите выход
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mt-3">
                                    Вы уверены, что хотите завершить сеанс? Все несохраненные изменения будут потеряны.
                                </p>
                            </div>
                            <div className="flex justify-between items-center p-6 bg-neutral-100 dark:bg-neutral-800">
                                <button
                                    onClick={() => setIsLogoutModalVisible(false)}
                                    className="px-4 py-2 rounded-lg font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                    Выйти
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-full lg:w-4/5 shadow-lg">
                {currentPage === "profile" && (
                    <div className="dark:bg-neutral-900 p-4 rounded-lg">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Профиль</h2>
                        <div className="flex items-center gap-4 mb-6">
                            {avatarPreview && (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover"
                                />
                            )}
                            <div>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Имя пользователя: <strong
                                    className="text-neutral-900 dark:text-white">{user.username}</strong>
                                </p>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Email: <strong className="text-neutral-900 dark:text-white">{user.email}</strong>
                                </p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <input
                                type="file"
                                onChange={handleAvatarChange}
                                className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-neutral-200 dark:file:bg-neutral-700 file:text-neutral-700 dark:file:text-neutral-200
                            hover:file:bg-neutral-300 dark:hover:file:bg-neutral-600"
                            />
                            <div className="flex mt-4 gap-2">
                                <button
                                    onClick={uploadAvatar}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Загрузить аватар
                                </button>
                                <button
                                    onClick={deleteAvatar}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                >
                                    Удалить аватар
                                </button>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Ваши социальные
                                сети</h3>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li
                                        key={link.id}
                                        className="flex items-center justify-between p-4 bg-neutral-200 dark:bg-neutral-700 rounded-lg shadow-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <i className="fa-solid fa-share-nodes text-blue-500 dark:text-blue-400 text-lg"></i>
                                            <div>
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg text-blue-500 dark:text-blue-400 font-semibold hover:underline"
                                                >
                                                    {link.name}
                                                </a>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{link.url}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleDeleteLink(link.id)}
                                                className="text-xl text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 focus:outline-none"
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6">
                                <h3
                                    onClick={() => setIsLinkSectionOpen(!isLinkSectionOpen)}
                                    className="cursor-pointer text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex justify-between"
                                >
                                    Добавить новую ссылку
                                    <span>
                                        {isLinkSectionOpen ? '-' : '+'}
                                    </span>
                                </h3>
                                {isLinkSectionOpen && (
                                    <motion.div
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Название ссылки"
                                            value={newLink.name}
                                            onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                                            className="block w-full text-sm text-neutral-900 dark:text-neutral-200 mb-2 p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600"
                                        />
                                        <input
                                            type="url"
                                            placeholder="URL"
                                            value={newLink.url}
                                            onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                                            className="block w-full text-sm text-neutral-900 dark:text-neutral-200 mb-4 p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600"
                                        />
                                        <button
                                            onClick={handleAddLink}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
                                        >
                                            Добавить ссылку
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {currentPage === "settings" && <Settings/>}
            </div>
        </div>

    );
};

export default Profile;
