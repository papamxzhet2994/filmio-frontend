import React from "react";
import {Link} from "react-router-dom";

const Home = () => {
    return (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold">Главная страница</h1>
            <Link to="/create-room" className="ml-4 text-blue-500 underline hover:text-blue-700 focus:text-blue-900">Создать комнату</Link>
            <Link to="/rooms" className="ml-4 text-blue-500 underline hover:text-blue-700 focus:text-blue-900">Список комнат</Link>
        </div>
    );
};

export default Home;