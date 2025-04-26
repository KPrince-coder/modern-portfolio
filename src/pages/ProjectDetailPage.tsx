import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProjectBySlug } from "../hooks/useSupabase";
import Container from "../components/layout/Container";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ReactMarkdown from "react-markdown";

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error } = useProjectBySlug(slug ?? "");

  if (isLoading) {
    return (
      <Container>
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" text="Loading project..." />
        </div>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container>
        <div className="py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Project Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/projects"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Project header */}
          <div className="mb-12">
            <Link
              to="/projects"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Projects
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              {project.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Project image */}
          <div className="mb-12 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {project.thumbnail_url ? (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <svg
                  className="w-1/6 h-1/6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Project content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                About the Project
              </h2>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                {/* Render project content with markdown */}
                {project.content ? (
                  <ReactMarkdown className="text-gray-600 dark:text-gray-300">
                    {project.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Project images gallery */}
              {project.images && project.images.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Project Gallery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.images.map((image) => (
                      <div
                        key={image.id}
                        className="aspect-video rounded-lg overflow-hidden shadow-md"
                      >
                        <img
                          src={image.image_url}
                          alt={image.alt_text || project.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {image.caption && (
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project sidebar */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Project Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Project Type
                    </h4>
                    <p className="text-gray-800 dark:text-white">
                      {project.category?.name || "Uncategorized"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {project.published_at ? "Published On" : "Created On"}
                    </h4>
                    <p className="text-gray-800 dark:text-white">
                      {project.published_at
                        ? new Date(project.published_at).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : new Date(project.created_at).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      Project Links
                    </h4>

                    <div className="space-y-2">
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Live Demo
                        </a>
                      )}

                      {project.code_url && (
                        <a
                          href={project.code_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                          </svg>
                          View Code
                        </a>
                      )}

                      {project.case_study_url && (
                        <a
                          href={project.case_study_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Case Study
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Container>
  );
};

export default ProjectDetailPage;
