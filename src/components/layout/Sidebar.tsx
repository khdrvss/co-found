import { Home, FolderKanban, Users, Bookmark, Settings, LogOut, User, MessageCircle, Briefcase, X, Menu, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export type SidebarTab = "home" | "projects" | "people" | "myProjects" | "saved" | "messages" | "admin";

interface SidebarProps {
  activeTab?: SidebarTab;
  onTabChange?: (tab: SidebarTab) => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export function Sidebar({ activeTab = "home", onTabChange, onOpenSettings, onOpenProfile }: SidebarProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home" as SidebarTab, icon: Home, label: t("nav.home") },
    { id: "projects" as SidebarTab, icon: FolderKanban, label: t("nav.projects") },
    { id: "people" as SidebarTab, icon: Users, label: t("nav.people") },
    { id: "myProjects" as SidebarTab, icon: Briefcase, label: t("nav.myProjects") },
    { id: "messages" as SidebarTab, icon: MessageCircle, label: "Xabarlar" },
    { id: "saved" as SidebarTab, icon: Bookmark, label: t("nav.saved") },
    ...(user?.is_admin ? [{ id: "admin" as SidebarTab, icon: Database, label: "Admin" }] : []),
  ];

  const avatarUrl = user?.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'default'}`;

  const handleTabChange = (tab: SidebarTab) => {
    onTabChange?.(tab);
    setMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 sidebar-gradient backdrop-blur-xl border-r border-border/50 z-50 transition-transform duration-300",
        // Mobile: slide in from left
        "md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center glow-primary animate-float">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavButton
              key={item.id}
              {...item}
              active={activeTab === item.id}
              onClick={() => handleTabChange(item.id)}
              index={index}
            />
          ))}
        </nav>

        {/* Settings */}
        <div className="mt-auto mb-4">
          <button
            onClick={() => {
              onOpenSettings?.();
              setMobileMenuOpen(false);
            }}
            className="group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-secondary/80 icon-glow"
            title={t("profile.settings")}
          >
            <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-popover/95 backdrop-blur-sm text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-border/50 shadow-lg hidden md:block">
              {t("profile.settings")}
            </span>
          </button>
        </div>

        {/* User Avatar with Dropdown */}
        <div className="pt-4 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-11 h-11 rounded-full bg-gradient-to-br from-primary via-chart-2 to-accent overflow-hidden ring-2 ring-transparent hover:ring-primary/50 transition-all duration-300 hover:scale-105">
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56 backdrop-blur-xl">
              <DropdownMenuLabel>{t("profile.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onOpenProfile?.();
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>{t("profile.title")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/auth';
                }}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("profile.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}

interface NavButtonProps {
  id: SidebarTab;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  index?: number;
}

function NavButton({ icon: Icon, label, active, onClick, index = 0 }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 0.05 + 0.1}s` }}
      className={cn(
        "group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 opacity-0 animate-fade-in-up",
        active
          ? "bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-glow-purple scale-105"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
      )}
      title={label}
    >
      <Icon className={cn(
        "w-5 h-5 transition-all duration-300",
        active ? "scale-110 drop-shadow-md" : "group-hover:scale-110"
      )} />
      <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-popover/95 backdrop-blur-sm text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap border border-border/50 shadow-lg hidden md:block">
        {label}
      </span>
      {active && (
        <span className="absolute -right-[1.15rem] w-1 h-6 bg-gradient-to-b from-primary to-chart-2 rounded-full" />
      )}
    </button>
  );
}
