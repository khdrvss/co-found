import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { SEO } from "@/components/SEO";
import { GoogleLogin } from "@react-oauth/google";

const authSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  fullName: z.string().optional(),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

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
      or: "yoki"
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
      or: "или"
    },
  };

  const texts = t[language];

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      console.log("🎉 Google Sign-In Success:", credentialResponse);
      
      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }

      const { error } = await signInWithGoogle(credentialResponse.credential);
      if (error) throw error;

      toast({
        title: "Successfully signed in with Google!",
      });
      navigate("/");
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
      navigate("/");
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



  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO
        title={isLogin ? t.uz.title : t.uz.subtitle} // fallback to uz title for simplicity or use texts.title
        description="Login or Sign up to Co-found.uz"
      />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center glow-primary">
            <span className="text-primary-foreground font-bold text-2xl">C</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 gradient-border animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">{texts.title}</h1>
            <p className="text-muted-foreground text-sm">{texts.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="pl-10 bg-secondary/50 border-border"
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
                  className="pl-10 bg-secondary/50 border-border"
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
                  className="pl-10 bg-secondary/50 border-border"
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gap-2 shadow-glow hover:shadow-glow-lg transition-shadow"
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
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-muted-foreground text-sm">{texts.or}</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error('❌ Google Login Failed');
                toast({
                  title: texts.error,
                  description: "Google Login Failed",
                  variant: "destructive",
                });
              }}
            />
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {texts.toggle}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
