import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import SectionDivider from "../components/ui/SectionDivider";
import SkillCard from "../components/ui/SkillCard";
import ProjectCard from "../components/ui/ProjectCard";
import FeaturedBlogPosts from "../components/home/FeaturedBlogPosts";
import HeroSection from "../components/home/HeroSection";
import ProjectCardSkeleton from "../components/ui/ProjectCardSkeleton";
import { usePersonalData, useProjects, useSkills } from "../hooks/useSupabase";

const HomePage = () => {
  // Fetch personal data for profile image
  const { data: personalData, isLoading: isLoadingPersonal } =
    usePersonalData();

  // Fetch featured projects
  const {
    data: featuredProjectsData,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useProjects({ featured: true, limit: 2 });

  // Fetch featured skills
  const {
    data: skillsData,
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useSkills();

  // Extract featured projects and skills from data
  const featuredProjects = featuredProjectsData ?? [];
  // Get all skills and sort them by display_order
  const featuredSkills =
    skillsData?.sort((a, b) => a.display_order - b.display_order) ?? [];

  // Use personal data or fallback
  const personalInfo = {
    name: personalData?.name ?? "John Doe",
    title: personalData?.title ?? "Creative Developer & Designer",
    bio:
      personalData?.bio ??
      "I build exceptional digital experiences that are fast, accessible, and visually appealing.",
    profile_image_url: personalData?.profile_image_url ?? "",
  };

  return (
    <Container>
      <div className="pt-20">
        {/* Hero Section */}
        <HeroSection
          personalInfo={personalInfo}
          isLoadingPersonal={isLoadingPersonal}
        />

        <SectionDivider />

        {/* Skills Section */}
        <section className="mb-32 pt-8" id="skills">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              My Skills
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              I've worked with a variety of technologies to create exceptional
              digital experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading state */}
            {isLoadingSkills && (
              <div className="col-span-3 text-center py-8">
                <div className="inline-block">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading skills...
                </p>
              </div>
            )}

            {/* Error state */}
            {skillsError && (
              <div className="col-span-3 text-center py-8">
                <p className="text-red-500 dark:text-red-400 mb-2">
                  Failed to load skills
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Please try again later
                </p>
              </div>
            )}

            {/* No skills found */}
            {!isLoadingSkills &&
              !skillsError &&
              featuredSkills.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No featured skills found
                  </p>
                </div>
              )}

            {/* Skills display */}
            {!isLoadingSkills &&
              !skillsError &&
              featuredSkills.map((skill, index) => (
                <SkillCard
                  key={skill.id}
                  icon={
                    <div
                      dangerouslySetInnerHTML={{ __html: skill.icon ?? "" }}
                    />
                  }
                  title={skill.name}
                  description={skill.description}
                  level={skill.level ?? 3}
                  delay={index * 0.1}
                />
              ))}
          </div>
        </section>

        <SectionDivider />

        {/* Featured Projects Section */}
        <section className="mb-32 pt-8" id="projects">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Here are some of my recent projects. Check out the Projects page
              for more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Loading state with skeletons */}
            {isLoadingProjects && (
              <>
                <ProjectCardSkeleton delay={0} />
                <ProjectCardSkeleton delay={0.1} />
              </>
            )}

            {/* Error state */}
            {projectsError && (
              <div className="col-span-2 text-center py-8">
                <p className="text-red-500 dark:text-red-400 mb-2">
                  Failed to load projects
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Please try again later
                </p>
              </div>
            )}

            {/* Projects display */}
            {!isLoadingProjects &&
              !projectsError &&
              featuredProjects?.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No featured projects found
                  </p>
                </div>
              )}

            {!isLoadingProjects &&
              !projectsError &&
              featuredProjects?.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  id={project.slug}
                  title={project.title}
                  description={project.description}
                  imageUrl={
                    project.thumbnail_url ??
                    "https://via.placeholder.com/800x450?text=Project+Image"
                  }
                  tags={project.technologies}
                  delay={index * 0.2}
                />
              ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/projects"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              View All Projects
            </a>
          </div>
        </section>

        <SectionDivider />

        {/* Featured Blog Posts Section */}
        <section className="mb-32 pt-8" id="blog">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Featured Blog Posts
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Check out my latest thoughts and insights on technology, design,
              and development.
            </p>
          </motion.div>

          <FeaturedBlogPosts />

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </section>

        <SectionDivider />

        {/* Contact CTA Section */}
        <section
          id="contact"
          className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-8 md:p-12 mt-16"
        >
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
            >
              Let's Work Together
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Have a project in mind? I'd love to hear about it. Let's discuss
              how we can work together.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <a
                href="/contact"
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-block"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </Container>
  );
};

export default HomePage;
