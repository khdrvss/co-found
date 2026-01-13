import { useState, useEffect } from "react";
import { Edit2, X, Loader2, Sparkles, MapPin, Check } from "lucide-react";
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
import { Project } from "@/components/cards/ProjectCard";

interface EditProjectDialogProps {
  project: Project;
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

export function EditProjectDialog({ project, open, onOpenChange, onSuccess }: EditProjectDialogProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [category, setCategory] = useState(project.category);
  const [stage, setStage] = useState(project.stage);
  const [viloyat, setViloyat] = useState(project.viloyat);
  const [workType, setWorkType] = useState<any>(project.workType || "office");
  const [lookingFor, setLookingFor] = useState<string[]>(project.lookingFor || []);

  // Update state when project prop changes
  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description || "");
      setCategory(project.category);
      setStage(project.stage);
      setViloyat(project.viloyat);
      setWorkType(project.workType || "office");
      setLookingFor(project.lookingFor || []);
    }
  }, [project, open]);

  const t = {
    uz: {
      title: "Loyihani tahrirlash",
      subtitle: "Loyiha ma'lumotlarini o'zgartirish",
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
      submit: "Saqlash",
      success: "Loyiha muvaffaqiyatli yangilandi!",
      error: "Xatolik yuz berdi",
      loginRequired: "Loyiha tahrirlash uchun tizimga kiring",
    },
    ru: {
      title: "Редактировать проект",
      subtitle: "Изменить данные проекта",
      name: "Название проекта",
      namePlaceholder: "Например: TechHub Ташкент",
      description: "Описание",
      descriptionPlaceholder: "Кратко о вашем проекте...",
      category: "Категория",
      selectCategory: "Выберите категорию",
      stage: "Этап",
      selectStage: "Выберите этап",
      location: "Локация",
      selectLocation: "Выберите область",
      workType: "Тип работы",
      lookingFor: "Искомые роли",
      selectRoles: "Выберите роли",
      submit: "Сохранить",
      success: "Проект успешно обновлен!",
      error: "Произошла ошибка",
      loginRequired: "Войдите в систему для редактирования",
    }
  };

  const texts = language === 'uz' ? t.uz : t.ru;

  const toggleRole = (role: string) => {
    if (lookingFor.includes(role)) {
      setLookingFor(lookingFor.filter(r => r !== role));
    } else {
      setLookingFor([...lookingFor, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Xatolik",
        description: texts.loginRequired,
        variant: "destructive"
      });
      return;
    }

    if (!name || !category || !stage || !viloyat) {
      toast({
        title: "Xatolik",
        description: language === 'uz' ? "Barcha maydonlarni to'ldiring" : "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        name,
        description,
        category,
        stage,
        viloyat,
        workType, // Changed from work_type to workType because the backend route destructures workType
        lookingFor, // Changed from looking_for to lookingFor because the backend route destructures lookingFor
      };

      const token = localStorage.getItem('token');
      await api.put(`/projects/${project.id}`, projectData, token || undefined);

      toast({
        title: texts.success,
        description: language === 'uz' ? "O'zgarishlar saqlandi" : "Изменения сохранены",
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
      
      // Reload page to reflect changes
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: texts.error,
        description: error.message || (language === 'uz' ? "Loyihani yangilashda xatolik yuz berdi" : "Ошибка при обновлении проекта"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-2 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Edit2 className="w-5 h-5 text-primary" />
              </div>
              {texts.title}
            </DialogTitle>
            <p className="text-muted-foreground">{texts.subtitle}</p>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground/80">
                {texts.name} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={texts.namePlaceholder}
                className="glass h-11 focus:ring-primary/50 transition-all font-medium"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground/80">
                {texts.description}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={texts.descriptionPlaceholder}
                className="glass min-h-[100px] focus:ring-primary/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  {texts.category} <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="glass h-11">
                    <SelectValue placeholder={texts.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stage */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  {texts.stage} <span className="text-red-500">*</span>
                </Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="glass h-11">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  {texts.location} <span className="text-red-500">*</span>
                </Label>
                <Select value={viloyat} onValueChange={setViloyat}>
                  <SelectTrigger className="glass h-11">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder={texts.selectLocation} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {viloyatlar.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Work Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  {texts.workType} <span className="text-red-500">*</span>
                </Label>
                <Select value={workType} onValueChange={setWorkType}>
                  <SelectTrigger className="glass h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {language === 'uz' ? type.labelUz : type.labelRu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Looking For - Tags Input */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {texts.lookingFor}
              </Label>
              <div className="p-4 rounded-xl glass border border-white/5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((role) => {
                    const isSelected = lookingFor.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-glow"
                            : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50"
                        )}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
                {lookingFor.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    {texts.selectRoles}
                  </p>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 border-t border-white/5 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 hover:bg-white/5"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              form="edit-project-form"
              className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-glow hover:shadow-glow-lg transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {texts.submit}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
