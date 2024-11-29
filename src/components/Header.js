import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";

const Header = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleLogout = () => {
        setIsModalOpen(true); // Открываем модальное окно
    };

    const confirmLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
        setIsModalOpen(false);
    };

    const token = localStorage.getItem("token");

    return (
        <header className="bg-gray-800 text-white">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">filmio</Link>
                <nav>
                    <ul className="flex space-x-4">
                        {token ? (
                            <>
                                <li>
                                    <Link to="/profile" className="mx-2 hover:underline text-white text-3xl hover:text-violet-300 transition-all duration-300">
                                        <i className="fa-solid fa-user"></i>
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all duration-300"
                                    >
                                        Выйти
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login" className="hover:underline">
                                        Войти
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="hover:underline">
                                        Регистрация
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmLogout}
                message="Вы действительно хотите выйти из аккаунта?"
            />
        </header>
    );
};

export default Header;
