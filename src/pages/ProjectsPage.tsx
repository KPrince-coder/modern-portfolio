import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Container from "../components/layout/Container";
import ProjectCardList from "../components/ui/ProjectCardList";
import { useProjects, useProjectCategories } from "../hooks/useSupabase";

const ProjectsPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Fetch all projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useProjects({
    category: selectedCategoryId || undefined,
  });

  // Fetch project categories
  const { data: categories, isLoading: isLoadingCategories } =
    useProjectCategories();

  // Update the selected category ID when the filter changes
  useEffect(() => {
    if (categoryFilter === "all") {
      setSelectedCategoryId(null);
    } else if (categories) {
      const category = categories.find((cat) => cat.slug === categoryFilter);
      setSelectedCategoryId(category?.id || null);
    }
  }, [categoryFilter, categories]);

  return (
    <Container>
      <div className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            My Projects
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A collection of my work across various domains and technologies.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <FilterButton
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          >
            All Projects
          </FilterButton>

          {/* Dynamic category filters */}
          {isLoadingCategories ? (
            // Skeleton loaders for category buttons
            <>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </>
          ) : (
            // Actual category buttons
            categories?.map((category) => (
              <FilterButton
                key={category.id}
                active={categoryFilter === category.slug}
                onClick={() => setCategoryFilter(category.slug)}
              >
                {category.name}
              </FilterButton>
            ))
          )}
        </div>

        {/* Projects list with loading and error states */}
        <ProjectCardList
          projects={projects || []}
          isLoading={isLoadingProjects}
          error={projectsError}
          categoryFilter={categoryFilter}
        />
      </div>
    </Container>
  );
};

// Helper components
const FilterButton = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={`px-4 py-2 rounded-lg transition-colors ${
      active
        ? "bg-indigo-600 text-white"
        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default ProjectsPage;
