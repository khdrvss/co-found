import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, Loader2, X } from "lucide-react";
import { z } from "zod";
import { GoogleLogin } from "@react-oauth/google";

const authSchema = z.object({
    email: z.string().email("Email noto'g'ri formatda"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    fullName: z.string().optional(),
});

interface AuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultMode?: "login" | "signup";
}

export function AuthDialog({ open, onOpenChange, defaultMode = "login" }: AuthDialogProps) {
    const [isLogin, setIsLogin] = useState(defaultMode === "login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { signIn, signUp, signInWithGoogle } = useAuth();
    const { language } = useLanguage();

    const t = {
        uz: {
            title: isLogin ? "Tizimga kirish" : "Ro'yxatdan o'tish",
            subtitle: isLogin ? "Hisobingizga kiring" : "Yangi hisob yarating",
            email: "Email",
            password: "Parol",
            fullName: "To'liq ism",
            submit: isLogin ? "Kirish" : "Ro'yxatdan o'tish",
            toggle: isLogin ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Tizimga kiring",
            success: isLogin ? "Muvaffaqiyatli kirdingiz!" : "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
            error: "Xatolik yuz berdi",
        },
        ru: {
            title: isLogin ? "Вход в систему" : "Регистрация",
            subtitle: isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт",
            email: "Эл. почта",
            password: "Пароль",
            fullName: "Полное имя",
            submit: isLogin ? "Войти" : "Зарегистрироваться",
            toggle: isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Есть аккаунт? Войдите",
            success: isLogin ? "Успешный вход!" : "Успешная регистрация!",
            error: "Произошла ошибка",
        },
    };

    const texts = t[language];

    // Reset form when mode changes
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
    };

    // Reset form when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setEmail("");
            setPassword("");
            setFullName("");
            setErrors({});
            setIsLogin(defaultMode === "login");
        }
        onOpenChange(newOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate
        const result = authSchema.safeParse({ email, password, fullName: isLogin ? undefined : fullName });
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as string] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email, password, fullName);
                if (error) throw error;
            }

            toast({
                title: texts.success,
            });
            handleOpenChange(false);
        } catch (error: any) {
            toast({
                title: texts.error,
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        console.log("🎉 Google Sign-In Success:", credentialResponse);
        setLoading(true);
        try {
            if (!credentialResponse.credential) {
                throw new Error("No credential received from Google");
            }

            const { error } = await signInWithGoogle(credentialResponse.credential);
            if (error) throw error;

            toast({
                title: "Successfully signed in with Google!",
            });
            handleOpenChange(false);
        } catch (error: any) {
            console.error("❌ Google Sign-In Error:", error);
            toast({
                title: texts.error,
                description: error.message || "Google sign-in failed",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error("❌ Google Sign-In Failed");
        toast({
            title: texts.error,
            description: "Google sign-in failed. Please try again.",
            variant: "destructive",
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="glass border-border sm:max-w-md p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{texts.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{texts.subtitle}</p>
                    </div>
                    <button
                        onClick={() => handleOpenChange(false)}
                        className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!isLogin && (
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-foreground">{texts.fullName}</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10 glass"
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">{texts.email}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 glass"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">{texts.password}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 glass"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 gap-2 shadow-glow hover:shadow-glow-lg transition-shadow"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {texts.submit}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {language === "ru" ? "Или через" : "Yoki"}
                            </span>
                        </div>
                    </div>

                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                        />
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-sm text-primary hover:underline"
                        >
                            {texts.toggle}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
