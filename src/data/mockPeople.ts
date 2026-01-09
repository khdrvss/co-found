export interface Person {
  id: string;
  name?: string;
  full_name?: string; // Database property
  role?: string;
  roles?: string[]; // Database property equivalent
  bio?: string;
  skills?: string[];
  lookingFor?: string;
  looking_for?: string; // Database property
  available?: boolean;
  avatar?: string;
  avatar_url?: string; // Database property
  viloyat?: string;
  user_id?: string; // Database property
  email?: string; // Database property
  telegram_url?: string; // Social media links
  instagram_url?: string;
  linkedin_url?: string;
}


export const mockPeople: Person[] = [
  {
    id: "1",
    name: "Aziz Karimov",
    role: "Full-Stack Dasturchi",
    bio: "React, Node.js va PostgreSQL bilan 5+ yillik tajriba. Texnik hammuassis sifatida erta bosqich startapga qo'shilmoqchiman.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    lookingFor: "Hammuassis imkoniyati",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aziz",
    viloyat: "toshkent-sh",
  },
  {
    id: "2",
    name: "Dilnoza Rahimova",
    role: "Mahsulot Dizayneri",
    bio: "Foydalanuvchi markazli mahsulotlar yaratishga ishtiyoqli UI/UX dizayner. Startap tajribasiga ega Figma eksperti.",
    skills: ["Figma", "UI/UX", "Prototiplash", "Tadqiqot"],
    lookingFor: "Dizayn lideri roli",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dilnoza",
    viloyat: "toshkent-sh",
  },
  {
    id: "3",
    name: "Sardor Toshev",
    role: "ML Muhandis",
    bio: "NLP va kompyuter ko'rish sohasida ixtisoslashgan mashinali o'rganish muhandisi. 100k+ foydalanuvchi ishlatadigan AI mahsulotlar yaratgan.",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps"],
    lookingFor: "AI startap",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sardor",
    viloyat: "samarqand",
  },
  {
    id: "4",
    name: "Nodira Yusupova",
    role: "O'sish Marketoligi",
    bio: "Startaplarni 0 dan 100k foydalanuvchigacha kengaytirish tajribasiga ega raqamli marketing eksperti. SEO va kontent strategiyasi mutaxassisi.",
    skills: ["SEO", "Kontent Marketing", "Analitika", "Growth Hacking"],
    lookingFor: "Marketing hammuassisi",
    available: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nodira",
    viloyat: "buxoro",
  },
  {
    id: "5",
    name: "Jamshid Alimov",
    role: "Backend Dasturchi",
    bio: "Taqsimlangan tizimlar va mikroservislar bo'yicha ekspertizaga ega katta backend muhandis. AWS sertifikatli.",
    skills: ["Go", "Kubernetes", "AWS", "Mikroservislar"],
    lookingFor: "Texnik rol",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamshid",
    viloyat: "toshkent-v",
  },
  {
    id: "6",
    name: "Malika Usmanova",
    role: "Mobil Dasturchi",
    bio: "4+ yillik tajribaga ega React Native va Flutter dasturchisi. App Store va Play Store'da 10+ ilova nashr qilgan.",
    skills: ["React Native", "Flutter", "iOS", "Android"],
    lookingFor: "Mobil lider",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=malika",
    viloyat: "fargona",
  },
  {
    id: "7",
    name: "Bekzod Nurmatov",
    role: "Startap Asoschisi",
    bio: "2 ta muvaffaqiyatli chiqish bilan serial tadbirkor. EdTech sohasidagi keyingi tashabbusim uchun texnik hammuassislar qidirmoqdaman.",
    skills: ["Biznes Strategiya", "Moliyalashtirish", "Mahsulot", "Liderlik"],
    lookingFor: "Texnik hammuassis",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bekzod",
    viloyat: "namangan",
  },
  {
    id: "8",
    name: "Gulnora Rashidova",
    role: "DevOps Muhandis",
    bio: "CI/CD, bulutli platformalar va konteyner orkestratsiyasi tajribasiga ega infratuzilma mutaxassisi.",
    skills: ["Docker", "Terraform", "CI/CD", "Linux"],
    lookingFor: "DevOps roli",
    available: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gulnora",
    viloyat: "andijon",
  },
  {
    id: "9",
    name: "Otabek Sodiqov",
    role: "Blockchain Dasturchi",
    bio: "DeFi va NFT loyihalarida tajribaga ega smart kontrakt dasturchisi. Solidity va Rust eksperti.",
    skills: ["Solidity", "Rust", "Web3.js", "Smart Kontraktlar"],
    lookingFor: "Web3 startap",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=otabek",
    viloyat: "xorazm",
  },
  {
    id: "10",
    name: "Sevara Mirzaeva",
    role: "Ma'lumotlar Olimi",
    bio: "Fintech tajribasiga ega ma'lumotlar olimi. Bashoratli modellashtirish va biznes razvedkasi ekspertizasi.",
    skills: ["Python", "SQL", "Tableau", "Mashinali O'rganish"],
    lookingFor: "Data lider roli",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sevara",
    viloyat: "jizzax",
  },
  {
    id: "11",
    name: "Rustam Ergashev",
    role: "Frontend Dasturchi",
    bio: "Samarali va qulaylikka ega veb-ilovalar yaratishga ixtisoslashgan React mutaxassisi. Ochiq kodga hissa qo'shuvchi.",
    skills: ["React", "Next.js", "Tailwind", "TypeScript"],
    lookingFor: "Frontend lider",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rustam",
    viloyat: "navoiy",
  },
  {
    id: "12",
    name: "Zarina Hasanova",
    role: "Mahsulot Menejeri",
    bio: "Texnologiya startaplarida 6 yillik tajribaga ega PM. Agile metodologiyalari va foydalanuvchi markazli mahsulot ishlab chiqish.",
    skills: ["Agile", "Yo'l Xaritasi", "Foydalanuvchi Hikoyalari", "Analitika"],
    lookingFor: "Mahsulot Boshlig'i",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zarina",
    viloyat: "qashqadaryo",
  },
  {
    id: "13",
    name: "Shoxrux Qodirov",
    role: "Backend Dasturchi",
    bio: "Node.js va Python bilan 6+ yil tajriba. API dizayn va ma'lumotlar bazasi optimallashtirish bo'yicha mutaxassis.",
    skills: ["Node.js", "Python", "MongoDB", "Redis"],
    lookingFor: "Texnik rol",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=shoxrux",
    viloyat: "sirdaryo",
  },
  {
    id: "14",
    name: "Kamola Tursunova",
    role: "UX Tadqiqotchisi",
    bio: "Foydalanuvchi tadqiqotlari va qulaylik testlari bo'yicha 4 yillik tajriba. Mahsulotlarni yaxshilash uchun ma'lumotlarga asoslangan yondashuv.",
    skills: ["Foydalanuvchi Tadqiqoti", "Testlar", "Analitika", "Prototiplashtirish"],
    lookingFor: "UX lider",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kamola",
    viloyat: "surxondaryo",
  },
  {
    id: "15",
    name: "Bobur Xolmatov",
    role: "Kiberxavfsizlik Mutaxassisi",
    bio: "Xavfsizlik auditi va penetratsion testlar bo'yicha 5 yillik tajriba. CISSP sertifikatli.",
    skills: ["Xavfsizlik Audit", "Penetratsion Test", "SIEM", "Xavfsizlik"],
    lookingFor: "Xavfsizlik roli",
    available: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bobur",
    viloyat: "qoraqalpogiston",
  },
];
