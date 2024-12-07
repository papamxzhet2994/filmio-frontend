import React from "react";
import { useTheme } from "next-themes";

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center">
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={`relative inline-flex items-center justify-center p-4 w-16 h-16 rounded-full border-2 border-transparent text-white text-sm font-bold transition-all duration-300 ease-in-out ${
                    theme === "light"
                        ? "bg-white hover:bg-neutral-200 focus:ring-2 focus:ring-neutral-400"
                        : "bg-neutral-800 hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-600"
                }`}
            >
                <div
                    className={`absolute w-10 h-10 bg-white rounded-full transition-all duration-300 ease-in-out transform ${
                        theme === "light" ? "translate-x-0" : "translate-x-16"
                    }`}
                />
                <div
                    className={`absolute w-10 h-10 bg-neutral-800 rounded-full transition-all duration-300 ease-in-out transform ${
                        theme === "light" ? "translate-x-16" : "translate-x-0"
                    }`}
                />
                <span
                    className={`absolute text-neutral-800 text-sm font-bold transition-all duration-300 ease-in-out transform ${
                        theme === "light" ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <i className="fas fa-sun text-xl"></i>
                </span>
                <span
                    className={`absolute text-white text-sm font-bold transition-all duration-300 ease-in-out transform ${
                        theme === "light" ? "opacity-0" : "opacity-100"
                    }`}
                >
                    <i className="fas fa-moon text-xl"></i>
                </span>
            </button>
        </div>
    );
};

export default ThemeSwitcher;
