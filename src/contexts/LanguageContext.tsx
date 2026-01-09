import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "uz" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  uz: {
    // Navigation
    "nav.home": "Bosh sahifa",
    "nav.projects": "Loyihalar",
    "nav.people": "Odamlar",
    "nav.myProjects": "Mening loyihalarim",
    "nav.saved": "Saqlangan",

    // Header titles
    "title.discover": "Loyihalarni kashf eting",
    "title.discover.sub": "Keyingi hamkorlik imkoniyatingizni toping",
    "title.all": "Barcha loyihalar",
    "title.all.sub": "Mavjud barcha loyihalarni ko'ring",
    "title.people": "Odamlarni toping",
    "title.people.sub": "Asoschilarga va quriluvchilarga bog'laning",
    "title.myProjects": "Mening loyihalarim",
    "title.myProjects.sub": "Siz yaratgan loyihalarni boshqaring",
    "title.saved": "Saqlangan",
    "title.saved.sub": "Sizning saqlangan loyihalar va odamlaringiz",
    "title.messages": "Xabarlar",
    "title.messages.sub": "Loyihalar guruh chatlari",

    // Filter tabs
    "filter.recommended": "Siz uchun loyihalar",
    "filter.all": "Barcha loyihalar",
    "filter.people": "Odamlar",

    // Search
    "search.placeholder": "AI Qidiruv (min 3 belgi) — masalan: Frontend dasturchi kerak startaplar",
    "search.region": "Viloyat",
    "search.allRegions": "Barcha viloyatlar",

    // Cards
    "card.recommended": "Siz uchun tavsiya etilgan",
    "card.lookingFor": "Qidirilmoqda:",
    "card.apply": "Ariza berish / Qo'shilish",
    "card.contact": "Bog'lanish",

    // Settings
    "settings.title": "Sozlamalar",
    "settings.appearance": "Ko'rinish",
    "settings.darkMode": "Qorong'u rejim",
    "settings.darkMode.desc": "Qorong'u mavzu ishlatish",
    "settings.notifications": "Bildirishnomalar",
    "settings.email": "Email bildirishnomalar",
    "settings.email.desc": "Yangi loyihalar haqida xabar olish",
    "settings.push": "Push bildirishnomalar",
    "settings.push.desc": "Brauzer orqali xabar olish",
    "settings.language": "Til",
    "settings.language.title": "Interfeys tili",
    "settings.language.desc": "Ilovaning asosiy tili",
    "settings.privacy": "Maxfiylik",
    "settings.profile.show": "Profilni ko'rsatish",
    "settings.profile.desc": "Boshqalar sizni topa oladi",

    // Profile
    "profile.title": "Profil",
    "profile.myAccount": "Mening hisobim",
    "profile.settings": "Sozlamalar",
    "profile.logout": "Chiqish",

    // Actions
    "action.loadMore": "Ko'proq yuklash",
    "action.loadMoreProjects": "Ko'proq loyihalar yuklash",
    "action.loadMorePeople": "Ko'proq odamlar yuklash",
    "action.edit": "Tahrirlash",
    "action.delete": "O'chirish",
    "action.manageRequests": "So'rovlarni boshqarish",
    "action.viewMembers": "A'zolarni ko'rish",
    "action.openChat": "Chatni ochish",

    // Empty states
    "empty.saved": "Hali hech narsa saqlanmagan",
    "empty.saved.desc": "Loyihalar va odamlarni saqlang",

    // Languages
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
  },
  ru: {
    // Navigation
    "nav.home": "Главная",
    "nav.projects": "Проекты",
    "nav.people": "Люди",
    "nav.myProjects": "Мои проекты",
    "nav.saved": "Сохранённые",

    // Header titles
    "title.discover": "Откройте проекты",
    "title.discover.sub": "Найдите следующую возможность для сотрудничества",
    "title.all": "Все проекты",
    "title.all.sub": "Просмотрите все доступные проекты",
    "title.people": "Найдите людей",
    "title.people.sub": "Свяжитесь с основателями и разработчиками",
    "title.myProjects": "Мои проекты",
    "title.myProjects.sub": "Управляйте созданными вами проектами",
    "title.saved": "Сохранённые",

    "title.saved.sub": "Ваши сохранённые проекты и люди",
    "title.messages": "Сообщения",
    "title.messages.sub": "Групповые чаты проектов",

    // Filter tabs
    "filter.recommended": "Для вас",
    "filter.all": "Все проекты",
    "filter.people": "Люди",

    // Search
    "search.placeholder": "AI Поиск (мин 3 символа) — например: нужен Frontend разработчик для стартапа",
    "search.region": "Регион",
    "search.allRegions": "Все регионы",

    // Cards
    "card.recommended": "Рекомендовано для вас",
    "card.lookingFor": "Ищем:",
    "card.apply": "Подать заявку / Присоединиться",
    "card.contact": "Связаться",

    // Settings
    "settings.title": "Настройки",
    "settings.appearance": "Внешний вид",
    "settings.darkMode": "Тёмный режим",
    "settings.darkMode.desc": "Использовать тёмную тему",
    "settings.notifications": "Уведомления",
    "settings.email": "Email уведомления",
    "settings.email.desc": "Получать уведомления о новых проектах",
    "settings.push": "Push уведомления",
    "settings.push.desc": "Получать уведомления через браузер",
    "settings.language": "Язык",
    "settings.language.title": "Язык интерфейса",
    "settings.language.desc": "Основной язык приложения",
    "settings.privacy": "Конфиденциальность",
    "settings.profile.show": "Показывать профиль",
    "settings.profile.desc": "Другие смогут вас найти",

    // Profile
    "profile.title": "Профиль",
    "profile.myAccount": "Мой аккаунт",
    "profile.settings": "Настройки",
    "profile.logout": "Выйти",

    // Actions
    "action.loadMore": "Загрузить ещё",
    "action.loadMoreProjects": "Загрузить ещё проекты",
    "action.loadMorePeople": "Загрузить ещё людей",
    "action.edit": "Редактировать",
    "action.delete": "Удалить",
    "action.manageRequests": "Управлять запросами",
    "action.viewMembers": "Просмотр участников",
    "action.openChat": "Открыть чат",

    // Empty states
    "empty.saved": "Пока ничего не сохранено",
    "empty.saved.desc": "Сохраняйте проекты и людей",

    // Languages
    "lang.uz": "O'zbekcha",
    "lang.ru": "Русский",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "uz";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
