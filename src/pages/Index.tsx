import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, UserPlus, FolderSearch, LogIn } from "lucide-react";
import { Sidebar, SidebarTab } from "@/components/layout/Sidebar";
import { SearchBar } from "@/components/layout/SearchBar";
import { ProjectFilters } from "@/components/layout/ProjectFilters";
import { FilterTabs, TabType } from "@/components/layout/FilterTabs";
import { ProjectCardSkeleton, PersonCardSkeleton } from "@/components/ui/skeleton-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard, Project } from "@/components/cards/ProjectCard";
import { PersonCard } from "@/components/cards/PersonCard";
import { SavedSection } from "@/components/sections/SavedSection";
import { MessagesSection } from "@/components/sections/MessagesSection";
import { MyProjectsSection } from "@/components/sections/MyProjectsSection";
import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { ProjectChatDialog } from "@/components/dialogs/ProjectChatDialog";
import { ProfileDialog } from "@/components/dialogs/ProfileDialog";
import { ProjectDetailDialog } from "@/components/dialogs/ProjectDetailDialog";
import { PersonDetailDialog } from "@/components/dialogs/PersonDetailDialog";
import { AddProjectDialog } from "@/components/dialogs/AddProjectDialog";
import { AuthDialog } from "@/components/dialogs/AuthDialog";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const ITEMS_PER_PAGE = 8;

const Index = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as SidebarTab) || "home";
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>(initialTab);
  const [filterTab, setFilterTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Advanced Filters State
  const [filters, setFilters] = useState({
    aiRating: false,
    myProjects: false,
    category: null as string | null,
    location: null as string | null,
    stage: null as string | null,
    workType: null as string | null,
  });

  const [projectsToShow, setProjectsToShow] = useState(ITEMS_PER_PAGE);
  const [peopleToShow, setPeopleToShow] = useState(ITEMS_PER_PAGE);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chatOpenProject, setChatOpenProject] = useState<Project | null>(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "signup">("login");
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: projects = [], isLoading: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
  });

  const { data: people = [], isLoading: loadingPeople } = useQuery({
    queryKey: ['people'],
    queryFn: () => api.get('/people'),
  });

  const handleSidebarChange = (tab: SidebarTab) => {
    if (tab === "admin") {
      navigate("/admin");
      return;
    }
    setSidebarTab(tab);
    if (tab === "projects") setFilterTab("all");
    else if (tab === "people") setFilterTab("people");
    else if (tab === "home") setFilterTab("all");
  };

  const handleFilterChange = (tab: TabType) => {
    setFilterTab(tab);
    if (tab === "people") setSidebarTab("people");
    else setSidebarTab(tab === "projects" ? "home" : "projects");
  };

  // Handle Filter Change
  const handleAdvancedFilterChange = (key: string, value: any) => {
    if (key === "reset") {
      setFilters({
        aiRating: false,
        myProjects: false,
        category: null,
        location: null,
        stage: null,
        workType: null,
      });
      setSearchQuery("");
      return;
    }
    setFilters(prev => ({ ...prev, [key]: value }));
  };


  const filteredProjects = useMemo(() => {
    let projs = filterTab === "projects"
      ? projects.filter((p: any) => p.recommended)
      : projects;

    // Search Query (Keyword)
    if (searchQuery.length >= 3) {
      const query = searchQuery.toLowerCase();
      projs = projs.filter((p: any) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.looking_for.some((r: string) => r.toLowerCase().includes(query))
      );
    }

    // AI Rating matches Recommended projects
    if (filters.aiRating) {
      projs = projs.filter((p: any) => p.recommended);
    }

    // My Projects / Bookmarks
    if (filters.myProjects) {
      // Mock logic: showing random subset or simple logic if user not logged in.
      // In real app, check bookmark IDs or user ID.
      if (user) {
        projs = projs.filter((p: any) => p.user_id === user.id); // Show my projects for now
      }
    }

    // Category
    if (filters.category) {
      projs = projs.filter((p: any) => p.category === filters.category);
    }

    // Location (Viloyat)
    if (filters.location) {
      projs = projs.filter((p: any) => p.viloyat === filters.location);
    }

    // Stage
    if (filters.stage) {
      projs = projs.filter((p: any) => p.stage === filters.stage);
    }

    // Work Type
    if (filters.workType) {
      projs = projs.filter((p: any) => (p.workType || 'office') === filters.workType);
    }

    return projs;
  }, [filterTab, searchQuery, filters, projects, user]);

  const filteredPeople = useMemo(() => {
    let peps = people;

    if (searchQuery.length >= 3) {
      const query = searchQuery.toLowerCase();
      peps = peps.filter((p: any) =>
        (p.full_name || "").toLowerCase().includes(query) ||
        (p.role || "").toLowerCase().includes(query) ||
        p.skills.some((s: string) => s.toLowerCase().includes(query))
      );
    }
    // Note: People filtering by advanced filters could be added later if requested

    return peps;
  }, [searchQuery, people]);

  const getTitle = () => {
    if (sidebarTab === "saved") return { title: t("title.saved"), subtitle: t("title.saved.sub") };
    if (sidebarTab === "myProjects") return { title: t("title.myProjects"), subtitle: t("title.myProjects.sub") };
    if (sidebarTab === "messages") return { title: t("title.messages"), subtitle: t("title.messages.sub") };
    switch (filterTab) {
      case "projects": return { title: t("title.discover"), subtitle: t("title.discover.sub") };
      case "all": return { title: t("title.all"), subtitle: t("title.all.sub") };
      case "people": return { title: t("title.people"), subtitle: t("title.people.sub") };
      default: return { title: "", subtitle: "" };
    }
  };

  const { title, subtitle } = getTitle();

  const handleLoadMore = () => {
    if (filterTab === "people") {
      setPeopleToShow(prev => prev + ITEMS_PER_PAGE);
    } else {
      setProjectsToShow(prev => prev + ITEMS_PER_PAGE);
    }
  };

  const handleAddProject = () => {
    if (!user) {
      navigate("/auth");
    } else {
      setAddProjectOpen(true);
    }
  };

  const renderContent = () => {
    if (sidebarTab === "saved") return <SavedSection onProjectClick={setSelectedProject} onPersonClick={setSelectedPerson} />;
    if (sidebarTab === "messages") return <MessagesSection />;
    if (sidebarTab === "myProjects") {
      return (
        <MyProjectsSection
          onProjectClick={setSelectedProject}
          onEditProject={(project) => {
            // Feature: Create EditProjectDialog component for project modification
            // This would allow users to edit project details, update looking_for roles, etc.
            toast({
              title: "Tahrirlash",
              description: "Loyihani tahrirlash funksiyasi tez orada qo'shiladi",
            });
          }}
        />
      );
    }

    if (loadingProjects || loadingPeople) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            filterTab === "people" ? (
              <PersonCardSkeleton key={i} />
            ) : (
              <ProjectCardSkeleton key={i} />
            )
          ))}
        </div>
      );
    }

    if (filterTab === "people") {
      const displayedPeople = filteredPeople.slice(0, peopleToShow);
      if (displayedPeople.length === 0) {
        return (
          <EmptyState
            icon={UserPlus}
            title={t("no_results")}
            description={t("no_results.desc") || "Hozircha hech kim topilmadi. Qidiruv so'zini o'zgartirib ko'ring."}
            action={{
              label: t("action.clearFilters") || "Filtrlarni tozalash",
              onClick: () => setSearchQuery("")
            }}
          />
        );
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {displayedPeople.map((person, index) => (
            <PersonCard
              key={person.id}
              person={{
                ...person,
                name: person.full_name || 'Anonymous'
              }}
              index={index}
              onClick={() => setSelectedPerson(person)}
            />
          ))}
        </div>
      );
    }

    const displayedProjects = filteredProjects.slice(0, projectsToShow);
    if (displayedProjects.length === 0) {
      if (projects.length === 0) {
        return (
          <EmptyState
            icon={FolderSearch}
            title={t("empty_system") || "Startup sarguzashtini boshlang! 🚀"}
            description={t("empty_system.desc") || "Hozircha loyihalar yo'q. Birinchi bo'lib o'z inqilobiy g'oyangizni ulashing va jamoa yig'ing."}
          />
        );
      }

      return (
        <EmptyState
          icon={FolderSearch}
          title={t("no_results")}
          description={t("no_results.desc") || "Sizning so'rovingiz bo'yicha loyihalar topilmadi. Filtrlarni o'zgartirib ko'ring."}
          action={{
            label: t("action.clearFilters") || "Filtrlarni tozalash",
            onClick: () => handleAdvancedFilterChange("reset", null)
          }}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {displayedProjects.map((project, index) => {
          const mappedProject = {
            ...project,
            lookingFor: project.looking_for,
            workType: project.work_type
          };
          return (
            <ProjectCard
              key={project.id}
              project={mappedProject}
              index={index}
              onClick={() => setSelectedProject(mappedProject)}
            />
          );
        })}
      </div>
    );


  };

  const hasMore = filterTab === "people"
    ? peopleToShow < filteredPeople.length
    : projectsToShow < filteredProjects.length;

  const addButtonText = language === "ru" ? "Добавить проект" : "Loyiha qo'shish";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Find Co-Founders & Projects"
        description="Connect with ambitious co-founders, join innovative startups, and find the perfect team for your next big idea in Uzbekistan."
      />
      <Sidebar
        activeTab={sidebarTab}
        onTabChange={handleSidebarChange}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="pl-0 md:pl-20">
        <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 md:px-6 lg:px-8 py-4 md:py-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Auth Buttons or User Profile */}
            {!user ? (
              <>
                <Button
                  onClick={() => {
                    setAuthDialogMode("login");
                    setAuthDialogOpen(true);
                  }}
                  variant="outline"
                  className="gap-2 glass-hover shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === "ru" ? "Войти" : "Kirish"}</span>
                </Button>
                <Button
                  onClick={() => {
                    setAuthDialogMode("signup");
                    setAuthDialogOpen(true);
                  }}
                  className="gap-2 shadow-glow hover:shadow-glow-lg transition-shadow shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === "ru" ? "Регистрация" : "Ro'yxatdan o'tish"}</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NotificationCenter />
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass-hover transition-all shrink-0"
                >
                  <img
                    src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.profile?.full_name || user.email}
                    className="w-8 h-8 rounded-lg"
                  />
                  <span className="hidden md:inline text-sm font-medium text-foreground">
                    {user.profile?.full_name || user.email}
                  </span>
                </button>
              </div>
            )}

            <Button
              onClick={handleAddProject}
              className="gap-2 shadow-glow hover:shadow-glow-lg transition-shadow shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{addButtonText}</span>
            </Button>
          </div>
        </header>

        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            </div>
            {sidebarTab !== "saved" && sidebarTab !== "myProjects" && sidebarTab !== "messages" && (
              <FilterTabs
                activeTab={filterTab}
                onTabChange={handleFilterChange}
                recommendedCount={projects.filter((p: any) => p.recommended).length}
                allProjectsCount={projects.length}
                peopleCount={people.length}
              />
            )}
          </div>

          {/* Advanced Filters */}
          {sidebarTab === "home" && filterTab !== "people" && (
            <div className="mb-6 -mt-4">
              <ProjectFilters
                filters={filters}
                onFilterChange={handleAdvancedFilterChange}
                counts={{
                  total: projects.length,
                  filtered: filteredProjects.length
                }}
              />
            </div>
          )}

          <div key={sidebarTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-backwards">
            {renderContent()}
          </div>

          {sidebarTab !== "saved" && sidebarTab !== "myProjects" && sidebarTab !== "messages" && hasMore && (
            <div className="flex justify-center mt-10 opacity-0 animate-fade-in-up stagger-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 glass rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground glass-hover gradient-border transition-all duration-300 hover:shadow-glow-sm"
              >
                {filterTab === "people" ? t("action.loadMorePeople") : t("action.loadMoreProjects")}
              </button>
            </div>
          )}
        </div>
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ProjectDetailDialog
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
        onOpenChat={() => {
          if (selectedProject) {
            setChatOpenProject(selectedProject);
          }
        }}
      />
      <PersonDetailDialog
        person={selectedPerson}
        open={!!selectedPerson}
        onOpenChange={(open) => !open && setSelectedPerson(null)}
      />
      <AddProjectDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
        onSuccess={(newProject: any, openChat: boolean) => {
          refetchProjects();
          if (openChat && newProject) {
            setChatOpenProject(newProject);
          }
        }}
      />

      {chatOpenProject && (
        <ProjectChatDialog
          projectId={chatOpenProject.id}
          projectName={chatOpenProject.name}
          open={!!chatOpenProject}
          onOpenChange={(open) => !open && setChatOpenProject(null)}
        />
      )}

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultMode={authDialogMode}
      />
    </div>
  );
};

export default Index;
