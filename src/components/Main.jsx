import { Outlet } from "react-router-dom";

const Main = () => {
    return (
        <main className="w-full flex-1">
            <Outlet />
        </main>
    );
};

export default Main;
