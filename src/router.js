import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Primary/Login";
import Register from "./components/Primary/Register";
import Profile from "./components/Primary/Profile";
import Room from "./components/Room";
import CreateRoom from "./components/Main/CreateRoom";
import RoomList from "./components/RoomList";
import MainLayout from "./components/Main/MainLayout";
import Settings from "./components/Settings";
import UserProfile from "./components/UserProfile";
import Help from "./components/Primary/Help";
import Chat from "./components/Main/Chat";
import Sidebar from "./components/Sidebar";
import VideoPlayer from "./components/VideoPlayer";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Modal from "./components/Main/Modal";
import SettingsModal from "./components/SettingsModal";
import BaseLayout from "./components/Primary/BaseLayout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <RoomList /> },
            { path: "create-room", element: <CreateRoom /> },
            { path: "rooms/:id", element: <Room /> },
            { path: "settings", element: <Settings /> },
            { path: "chat", element: <Chat /> },
            { path: "sidebar", element: <Sidebar /> },
            { path: "video", element: <VideoPlayer /> },
            { path: "theme-switcher", element: <ThemeSwitcher /> },
            { path: "modal", element: <Modal /> },
            { path: "settings-modal", element: <SettingsModal /> },
        ],
    },

    {
        path: "/",
        element: <BaseLayout />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "profile", element: <Profile /> },
            { path: "profile/:username", element: <UserProfile /> },
            { path: "help", element: <Help /> },
        ],

    }

]);

export default router;
