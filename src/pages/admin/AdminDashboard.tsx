
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, FolderKanban, MessageCircle, Database, TrendingUp, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function AdminDashboard() {
    const { t } = useLanguage();

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            return api.get('/admin/stats', token);
        }
    });

    if (isLoading) return <div className="p-8">Yuklanmoqda...</div>;
    if (error) return (
        <div className="p-8 flex flex-col items-center justify-center text-destructive">
            <AlertCircle className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-bold">Xatolik yuz berdi</h2>
            <p>{error.message}</p>
        </div>
    );

    const statsCards = [
        {
            title: "Jami Foydalanuvchilar",
            value: stats.users,
            icon: Users,
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Jami Loyihalar",
            value: stats.projects,
            icon: FolderKanban,
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Xabarlar",
            value: stats.messages,
            icon: MessageCircle,
            color: "from-orange-500 to-red-500"
        },
        {
            title: "Ma'lumotlar Bazasi",
            value: stats.dbSize,
            icon: Database,
            color: "from-emerald-500 to-green-500"
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platforma statistikasi va boshqaruv paneli</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => {
                    const handleClick = () => {
                        if (card.title === "Jami Foydalanuvchilar") window.location.href = "/admin/users";
                        if (card.title === "Jami Loyihalar") window.location.href = "/admin/projects";
                        if (card.title === "Xabarlar") window.location.href = "/?tab=messages";
                    };

                    const isClickable = card.title !== "Ma'lumotlar Bazasi";

                    return (
                        <div
                            key={index}
                            onClick={handleClick}
                            className={`glass p-6 rounded-2xl border border-border/50 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${isClickable ? 'cursor-pointer hover:shadow-glow' : ''}`}
                        >
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${card.color} blur-2xl w-32 h-32 rounded-full -mr-10 -mt-10`} />

                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                {isClickable && <TrendingUp className="w-4 h-4 text-green-500" />}
                            </div>

                            <h3 className="text-3xl font-bold mb-1">
                                <AnimatedCounter value={typeof card.value === 'number' ? card.value : 0} duration={2000} />
                                {typeof card.value !== 'number' && <span className="text-2xl">{card.value}</span>}
                            </h3>
                            <p className="text-sm text-muted-foreground">{card.title}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions or Recent Activity could go here */}
        </div>
    );
}
