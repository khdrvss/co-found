import { useState } from "react";
import { Plus, X, Loader2, Sparkles, MapPin } from "lucide-react";
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
// Supabase import removed. Use Prisma or other DB logic instead.
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = ["Startup", "SaaS", "AI", "Web3", "Fintech", "EdTech"];
const stages = ["G'oya", "MVP", "Qurilmoqda", "Kengaymoqda"];
const workTypes = [
  { id: "remote", labelUz: "Masofaviy", labelRu: "Удалённо" },
  { id: "hybrid", labelUz: "Aralash", labelRu: "Гибрид" },
  { id: "office", labelUz: "Ofisda", labelRu: "В офисе" },
];
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

export function AddProjectDialog({ open, onOpenChange, onSuccess }: AddProjectDialogProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stage, setStage] = useState("");
  const [viloyat, setViloyat] = useState("");
  const [workType, setWorkType] = useState("office");
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  const t = {
    uz: {
      title: "Yangi loyiha qo'shish",
      subtitle: "Loyihangiz haqida ma'lumot kiriting",
      name: "Loyiha nomi",
      namePlaceholder: "Masalan: TechHub Toshkent",
      description: "Tavsif",
      descriptionPlaceholder: "Loyihangiz haqida qisqacha...",
      category: "Kategoriya",
      selectCategory: "Kategoriyani tanlang",
      stage: "Bosqich",
      selectStage: "Bosqichni tanlang",
      location: "Joylashuv",
      selectLocation: "Viloyatni tanlang",
      workType: "Ish turi",
      lookingFor: "Qidirilayotgan rollar",
      selectRoles: "Rollarni tanlang",
      submit: "Loyihani yaratish",
      success: "Loyiha muvaffaqiyatli yaratildi!",
      error: "Xatolik yuz berdi",
      loginRequired: "Loyiha qo'shish uchun tizimga kiring",
    },
    ru: {
      title: "Добавить проект",
      subtitle: "Введите информацию о вашем проекте",
      name: "Название проекта",
      namePlaceholder: "Например: TechHub Ташкент",
      description: "Описание",
      descriptionPlaceholder: "Кратко о вашем проекте...",
      category: "Категория",
      selectCategory: "Выберите категорию",
      stage: "Этап",
      selectStage: "Выберите этап",
      location: "Расположение",
      selectLocation: "Выберите регион",
      workType: "Тип работы",
      lookingFor: "Ищем роли",
      selectRoles: "Выберите роли",
      submit: "Создать проект",
      success: "Проект успешно создан!",
      error: "Произошла ошибка",
      loginRequired: "Войдите, чтобы добавить проект",
    },
  };

  const texts = t[language];

  const toggleRole = (role: string) => {
    setLookingFor(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setStage("");
    setWorkType("office");
    setViloyat("");
    setLookingFor([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: texts.loginRequired,
        variant: "destructive",
      });
      return;
    }

    if (!name || !description || !category || !stage || !viloyat || lookingFor.length === 0) {
      toast({
        title: texts.error,
        description: "Barcha maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          stage,
          viloyat,
          work_type: workType,
          looking_for: lookingFor,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const project = await response.json();

      toast({
        title: texts.success,
      });
      
      resetForm();
      onOpenChange(false);
      onSuccess?.();
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
      <DialogContent className="glass border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-foreground">{texts.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{texts.subtitle}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {texts.name}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={texts.namePlaceholder}
              className="bg-secondary/50"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">{texts.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={texts.descriptionPlaceholder}
              className="bg-secondary/50 min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
          </div>

          {/* Category & Stage Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">{texts.category}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={texts.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">{texts.stage}</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={texts.selectStage} />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {texts.location}
            </Label>
            <Select value={viloyat} onValueChange={setViloyat}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder={texts.selectLocation} />
              </SelectTrigger>
              <SelectContent>
                {viloyatlar.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Type */}
          <div className="space-y-3">
            <Label className="text-foreground">{texts.workType}</Label>
            <div className="flex flex-wrap gap-2">
              {workTypes.map((wt) => (
                <button
                  key={wt.id}
                  type="button"
                  onClick={() => setWorkType(wt.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    workType === wt.id
                      ? "bg-primary text-primary-foreground shadow-glow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {language === "ru" ? wt.labelRu : wt.labelUz}
                </button>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div className="space-y-3">
            <Label className="text-foreground">{texts.lookingFor}</Label>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    lookingFor.includes(role)
                      ? "bg-primary text-primary-foreground shadow-glow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {role}
                  {lookingFor.includes(role) && (
                    <X className="w-3 h-3 ml-1.5 inline" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base gap-2 shadow-glow hover:shadow-glow-lg transition-shadow"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {texts.submit}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
