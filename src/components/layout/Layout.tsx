import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-8 max-w-[88rem] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
