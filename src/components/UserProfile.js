import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SocialIcon from "./SocialIcon";

const UserProfile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/users/${username}`);
                if (!response.ok) {
                    throw new Error("Не удалось загрузить данные профиля");
                }
                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchProfile();
    }, [username]);

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    if (!profile) {
        return <p className="text-gray-500 text-center">Загрузка...</p>;
    }

    const socialLinks = JSON.parse(profile.socialLinks);

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white flex flex-col items-center py-12">
            <div className="w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-lg text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <i className="fas fa-chevron-left mr-2"></i>Назад
                    </button>
                </div>

                <div className="flex flex-col items-center gap-6 mb-8">
                    <img
                        src={
                            profile.avatarUrl
                                ? `http://localhost:8080${profile.avatarUrl}`
                                : `https://ui-avatars.com/api/?name=${profile.username}&background=random&rounded=true`
                        }
                        alt={`${profile.username}'s avatar`}
                        className="w-40 h-40 rounded-full border-4 border-neutral-200 dark:border-neutral-800 shadow-xl"
                    />
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">{profile.username}</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Дата регистрации: {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">О пользователе</h3>
                    <p className="text-neutral-700 dark:text-neutral-300">
                        {profile.bio || "Описание профиля не доступно."}
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Ссылки на ресурсы</h3>
                    {socialLinks.length > 0 ? (
                        <ul className="flex flex-wrap gap-4">
                            {socialLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full shadow-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all text-sm text-neutral-800 dark:text-neutral-300"
                                    >
                                        <SocialIcon service={link.name}/>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>

                    ) : (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            У пользователя нет социальных ссылок.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
