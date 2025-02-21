import React from 'react';
import { Outlet } from "react-router-dom";

const BaseLayout = () => {
    return (
        <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 flex justify-center items-center">
            {/* Анимированная подложка по центру */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 animate-gradient-background z-0"></div>

            {/* Форма по центру страницы без теней */}
            <div className="relative z-10 w-full max-w-6xl p-6 rounded-xl bg-transparent flex justify-center items-center">
                <Outlet />
            </div>

            <style jsx="true">{`
              @keyframes gradientBackground {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }

              .animate-gradient-background {
                background: linear-gradient(45deg, #6bd3ff, #3073f0, #824f9c);
                background-size: 300% 300%;
                animation: gradientBackground 5s ease infinite;
              }
            `}</style>
        </div>
    );
};

export default BaseLayout;
