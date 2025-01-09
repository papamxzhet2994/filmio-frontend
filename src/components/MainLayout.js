import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import LightRope from "./LightRope";

const MainLayout = () => {
    return (
        <div className="flex h-screen">
            <LightRope />
            <Sidebar />

            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
