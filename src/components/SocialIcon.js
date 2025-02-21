import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaLink, FaVk, FaTelegram, FaDiscord } from "react-icons/fa";

const SocialIcon = ({ service }) => {
    switch (service.toLowerCase()) {
        case "facebook":
            return <FaFacebook className="text-blue-600" />; // Синий для Facebook
        case "twitter":
            return <FaTwitter className="text-blue-400" />; // Голубой для Twitter
        case "instagram":
            return <FaInstagram className="text-gradient bg-gradient-to-r from-pink-500 to-orange-400" />; // Градиент для Instagram
        case "github":
            return <FaGithub className="text-gray-800 dark:text-white" />; // Тёмный серый для GitHub
        case "vk":
            return <FaVk className="text-blue-500" />; // Синий для VK
        case "telegram":
            return <FaTelegram className="text-blue-400" />; // Голубой для Telegram
        case "discord":
            return <FaDiscord className="text-purple-500" />; // Фиолетовый для Discord
        default:
            return <FaLink className="text-gray-600" />; // Серый для остальных ссылок
    }
};


export default SocialIcon;
