
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export function AdminLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Admin Check
    if (!user || !user.profile?.is_admin) {
        return <Navigate to="/" replace />;
    }



    return (
        <div className="min-h-screen bg-background">
            <SEO title="Admin Panel" noIndex={true} description="Co-found.uz Administration" />
            <Sidebar activeTab="admin" onTabChange={() => { }} onOpenSettings={() => { }} onOpenProfile={() => { }} />
            <main className="pl-0 md:pl-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
