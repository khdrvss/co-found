import { ProjectCard } from "@/components/cards/ProjectCard";
import { mockProjects } from "@/data/mockProjects";

interface ProjectsSectionProps {
  showAll?: boolean;
}

export function ProjectsSection({ showAll = false }: ProjectsSectionProps) {
  const projects = showAll
    ? mockProjects
    : mockProjects.filter((p) => p.recommended);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
}
