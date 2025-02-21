import React from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import router from "./router"; // Импортируем маршрутизатор

const App = () => {
    return (
        <ThemeProvider attribute="class">
            <Toaster position="top-right" reverseOrder={false} />
            <RouterProvider router={router} />
        </ThemeProvider>
    );
};

export default App;
