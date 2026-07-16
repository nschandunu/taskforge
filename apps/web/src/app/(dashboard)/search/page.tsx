"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/services/projects.service";
import { getAllTasks } from "@/services/tasks.service";
import { FolderKanban, CheckSquare, Search as SearchIcon } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
  });

  const isLoading = isProjectsLoading || isTasksLoading;

  const filteredProjects = projectsData?.items.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  ) || [];

  const filteredTasks = tasksData?.items.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
  ) || [];

  const hasResults = filteredProjects.length > 0 || filteredTasks.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Search Results
        </h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <SearchIcon className="size-4" />
          Showing results for <span className="font-bold text-foreground">"{query}"</span>
        </p>
      </div>

      {!hasResults ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border/60 bg-secondary/30"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4 ring-4 ring-background shadow-sm">
            <SearchIcon className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No results found</h3>
          <p className="text-sm font-medium text-muted-foreground/80 mt-1 max-w-sm text-center">
            We couldn't find any projects or tasks matching your query.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {filteredProjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <FolderKanban className="size-5 text-primary" />
                Projects
                <Badge variant="secondary" className="ml-2 bg-secondary/50 font-bold">{filteredProjects.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map(project => (
                  <motion.div variants={itemVariants} key={project.id}>
                    <Link href="/projects">
                      <Card className="flex flex-col rounded-2xl border-border/40 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 h-full">
                        <CardHeader className="p-5 pb-2">
                          <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                            {project.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 mt-auto">
                          <p className="text-sm font-medium text-muted-foreground line-clamp-2 mb-4">
                            {project.description || "No description provided."}
                          </p>
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {project.status.replace("_", " ")}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <CheckSquare className="size-5 text-primary" />
                Tasks
                <Badge variant="secondary" className="ml-2 bg-secondary/50 font-bold">{filteredTasks.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <motion.div variants={itemVariants} key={task.id}>
                    <Link href="/tasks">
                      <Card className="flex flex-col rounded-2xl border-border/40 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 h-full">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold text-foreground line-clamp-2">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 mt-auto flex flex-col gap-3">
                          <p className="text-xs font-medium text-muted-foreground line-clamp-2">
                            {task.description || "No description."}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <Badge variant="outline" className="text-[9px] font-bold">
                              {task.status.replace("_", " ")}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded-md truncate max-w-[100px]">
                              {task.project?.name || "Project"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Skeleton className="w-full max-w-4xl h-96 rounded-3xl" /></div>}>
      <SearchResults />
    </Suspense>
  );
}
