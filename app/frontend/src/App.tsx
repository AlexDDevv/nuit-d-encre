import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Sidebar from "@/components/sections/sidebar/Sidebar";
import SiteBannerHost from "@/components/sections/banner/SiteBannerHost";

function App() {
    return (
        <>
            <Toaster richColors position="bottom-center" closeButton />
            <div className="flex min-h-dvh">
                <Sidebar />
                <main className="pt-18 flex min-w-0 flex-1 flex-col gap-20 px-4 pb-10 md:p-10">
                    <SiteBannerHost />
                    <Outlet />
                </main>
            </div>
        </>
    );
}

export default App;
