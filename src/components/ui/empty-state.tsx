import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-fade-in-up",
            "glass rounded-3xl border border-white/5 dark:border-white/5",
            "bg-gradient-to-b from-white/5 to-transparent",
            className
        )}>
            {Icon && (
                <div className="p-4 rounded-2xl bg-primary/5 mb-4 ring-1 ring-primary/20 shadow-glow-secondary">
                    <Icon className="w-8 h-8 text-primary/80" />
                </div>
            )}

            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                    {description}
                </p>
            )}

            {action && (
                <Button
                    onClick={action.onClick}
                    className="shadow-glow-sm hover:shadow-glow transition-all duration-300"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
