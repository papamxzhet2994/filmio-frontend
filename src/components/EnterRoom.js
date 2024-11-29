import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EnterRoom = () => {
    const { id } = useParams();
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const handleEnterRoom = () => {
        axios.post(
            `http://localhost:8080/api/rooms/${id}/enter`,
            { password: password },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        )
            .then(() => {
                navigate(`/rooms/${id}`);
            })
            .catch(error => {
                setError("Неверный пароль");
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4">Введите пароль для входа в комнату</h2>
                <input
                    type="password"
                    className="border p-2 mb-4 w-full"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    onClick={handleEnterRoom}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                    Войти
                </button>
            </div>
        </div>
    );
};

export default EnterRoom;
