import { cn } from "@/lib/utils";
import { MessageSquare, FolderSearch, Search } from "lucide-react";

interface EmptyStateAnimatedProps {
    type: "messages" | "projects" | "generic";
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyStateAnimated({ type, title, description, action }: EmptyStateAnimatedProps) {
    const renderIllustration = () => {
        switch (type) {
            case "messages":
                return (
                    <div className="relative w-32 h-32 mb-6 animate-float">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-glow" />
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-primary relative z-10 drop-shadow-xl">
                            <path d="M21 11.5C21.0039 12.8199 20.637 14.1119 19.9405 15.2294C19.2441 16.3468 18.246 17.2455 17.0614 17.8228C15.8767 18.4001 14.5534 18.6329 13.242 18.4947C11.9306 18.3565 10.6841 17.8529 9.64502 17.041L4.5 18.5L5.95902 13.355C5.14714 12.316 4.64356 11.0694 4.50535 9.75806C4.36714 8.44666 4.6 7.1233 5.17726 5.93867C5.75452 4.75404 6.65324 3.75586 7.77071 3.05943C8.88819 2.36299 10.1802 1.9961 11.5 2H12C14.3869 2.00227 16.6753 2.95159 18.363 4.63921C20.0506 6.32684 20.9989 8.61563 21 11.002V11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 11H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M11 11H11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 11H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {/* Decorative bubbles */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-chart-2/30 rounded-full blur-sm animate-bounce" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-0 -left-4 w-6 h-6 bg-chart-4/30 rounded-full blur-sm animate-bounce" style={{ animationDelay: '2s' }} />
                    </div>
                );
            case "projects":
                return (
                    <div className="relative w-32 h-32 mb-6 animate-float">
                        <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-pulse-glow" />
                        <FolderSearch className="w-full h-full text-accent relative z-10 drop-shadow-xl p-4" />
                        <div className="absolute top-0 right-0 w-10 h-10 bg-primary/20 rounded-lg -rotate-12 backdrop-blur-md border border-white/10" />
                    </div>
                );
            default:
                return (
                    <div className="relative w-32 h-32 mb-6 animate-float">
                        <div className="absolute inset-0 bg-muted/50 blur-2xl rounded-full animate-pulse-glow" />
                        <Search className="w-full h-full text-muted-foreground relative z-10 opacity-50 p-6" />
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in-up">
            {renderIllustration()}
            <h3 className="text-xl font-bold text-foreground mb-2 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
                {title || "No data found"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
                {description || "Try adjusting your filters or checking back later."}
            </p>
            {action && (
                <div className="animate-fade-in-up stagger-1">
                    {action}
                </div>
            )}
        </div>
    );
}
