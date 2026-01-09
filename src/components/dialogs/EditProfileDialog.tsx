import { useState, useEffect } from "react";
import { User, MapPin, Briefcase, Loader2, Save, Sparkles, X, Send, Instagram, Linkedin } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { viloyatlar } from "@/data/viloyatlar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/ui/file-upload";

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const roleOptions = [
    "Frontend Dasturchi",
    "Backend Dasturchi",
    "Full-Stack Dasturchi",
    "UI/UX Dizayner",
    "Product Menejeri",
    "Marketing Mutaxassisi",
    "Data Scientist",
    "ML Muhandis",
    "DevOps Muhandis",
    "QA Muhandis",
    "Jamoa Menejeri",
    "Kontent Yaratuvchi",
    "Growth Marketer",
];

export function EditProfileDialog({ open, onOpenChange, onSuccess }: EditProfileDialogProps) {
    const { language } = useLanguage();
    const { user, signIn } = useAuth(); // We'll use signIn to refresh user data if needed, or better, we just rely on profile update
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [bio, setBio] = useState("");
    const [viloyat, setViloyat] = useState("");
    const [roles, setRoles] = useState<string[]>([]);
    const [newRole, setNewRole] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [telegramUrl, setTelegramUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");

    useEffect(() => {
        if (user && user.profile) {
            setFullName(user.profile.full_name || "");
            setAvatarUrl(user.profile.avatar_url || "");
            setBio(user.profile.bio || "");
            setViloyat(user.profile.viloyat || "");
            setRoles(user.profile.role || []);
            setSkills(user.profile.skills || []);
            setTelegramUrl(user.profile.telegram_url || "");
            setInstagramUrl(user.profile.instagram_url || "");
            setLinkedinUrl(user.profile.linkedin_url || "");
        }
    }, [user, open]);

    const t = {
        uz: {
            title: "Profilni tahrirlash",
            fullName: "To'liq ism",
            bio: "Men haqimda",
            location: "Joylashuv",
            role: "Mutaxassislik",
            skills: "Ko'nikmalar",
            addSkill: "Ko'nikma qo'shish",
            addRole: "Mutaxassislik qo'shish",
            telegram: "Telegram",
            instagram: "Instagram",
            linkedin: "LinkedIn",
            socialLinks: "Ijtimoiy tarmoqlar",
            save: "Saqlash",
            success: "Profil muvaffaqiyatli yangilandi!",
            error: "Xatolik yuz berdi",
        },
        ru: {
            title: "Редактировать профиль",
            fullName: "Полное имя",
            bio: "О себе",
            location: "Расположение",
            role: "Специальность",
            skills: "Навыки",
            addSkill: "Добавить навык",
            addRole: "Добавить специальность",
            telegram: "Telegram",
            instagram: "Instagram",
            linkedin: "LinkedIn",
            socialLinks: "Социальные сети",
            save: "Сохранить",
            success: "Профиль успешно обновлен!",
            error: "Произошла ошибка",
        }
    };

    const texts = t[language as keyof typeof t] || t.uz;

    const handleAddRole = () => {
        if (newRole.trim() && !roles.includes(newRole.trim())) {
            setRoles([...roles, newRole.trim()]);
            setNewRole("");
        }
    };

    const removeRole = (roleToRemove: string) => {
        setRoles(roles.filter(r => r !== roleToRemove));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Unauthorized");

            await api.put('/auth/profile', {
                fullName,
                bio,
                viloyat,
                roles,
                skills,
                telegram_url: telegramUrl,
                instagram_url: instagramUrl,
                linkedin_url: linkedinUrl,
                avatar_url: avatarUrl
            }, token);

            toast({
                title: texts.success,
            });

            onSuccess?.();
            onOpenChange(false);
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-border w-full h-full sm:h-auto sm:max-w-md max-h-screen sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-lg sm:text-xl">{texts.title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 py-4">
                    <div className="flex justify-center mb-4">
                        <FileUpload
                            value={avatarUrl}
                            onUploadComplete={setAvatarUrl}
                            className="w-32 h-32 rounded-full overflow-hidden border-2 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-foreground flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            {texts.fullName}
                        </Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-secondary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-foreground">{texts.bio}</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="bg-secondary/50 min-h-[100px] resize-none"
                            maxLength={300}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {texts.location}
                        </Label>
                        <Select value={viloyat} onValueChange={setViloyat}>
                            <SelectTrigger className="bg-secondary/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {viloyatlar.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            {texts.role}
                        </Label>
                        <div className="flex gap-2">
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="bg-secondary/50">
                                    <SelectValue placeholder={texts.addRole || "Mutaxassislik qo'shish"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" size="sm" onClick={handleAddRole}>
                                <Sparkles className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {roles.map((role) => (
                                <span
                                    key={role}
                                    className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs flex items-center gap-1"
                                >
                                    {role}
                                    <button type="button" onClick={() => removeRole(role)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">{texts.skills}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder={texts.addSkill}
                                className="bg-secondary/50"
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                            />
                            <Button type="button" size="sm" onClick={handleAddSkill}>
                                <Sparkles className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs flex items-center gap-1"
                                >
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-3 pt-2 border-t border-border/50">
                        <Label className="text-foreground text-sm font-medium">{texts.socialLinks}</Label>

                        <div className="space-y-2">
                            <Label htmlFor="telegram" className="text-foreground flex items-center gap-2 text-xs">
                                <Send className="w-3.5 h-3.5 text-primary" />
                                {texts.telegram}
                            </Label>
                            <Input
                                id="telegram"
                                value={telegramUrl}
                                onChange={(e) => setTelegramUrl(e.target.value)}
                                placeholder="https://t.me/username"
                                className="bg-secondary/50 text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instagram" className="text-foreground flex items-center gap-2 text-xs">
                                <Instagram className="w-3.5 h-3.5 text-primary" />
                                {texts.instagram}
                            </Label>
                            <Input
                                id="instagram"
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                placeholder="https://instagram.com/username"
                                className="bg-secondary/50 text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkedin" className="text-foreground flex items-center gap-2 text-xs">
                                <Linkedin className="w-3.5 h-3.5 text-primary" />
                                {texts.linkedin}
                            </Label>
                            <Input
                                id="linkedin"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="https://linkedin.com/in/username"
                                className="bg-secondary/50 text-sm"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />{texts.save}</>}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
