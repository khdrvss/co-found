import { Moon, Sun, Bell, Globe, Shield, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languages: { id: Language; label: string; flag: string }[] = [
  { id: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { id: "ru", label: "Русский", flag: "🇷🇺" },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("settings.title")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {t("settings.appearance")}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{t("settings.darkMode")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.darkMode.desc")}</p>
              </div>
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>

          {/* Language */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t("settings.language")}
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("settings.language.desc")}</p>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                      language === lang.id
                        ? "bg-primary text-primary-foreground shadow-glow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.id && <Check className="w-4 h-4 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t("settings.notifications")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{t("settings.email")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.email.desc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{t("settings.push")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.push.desc")}</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t("settings.privacy")}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{t("settings.profile.show")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.profile.desc")}</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
