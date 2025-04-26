import { motion } from "framer-motion";
import {
  usePersonalData,
  useSkills,
  useWorkExperience,
  useEducation,
  useInterests,
  useSoftSkills,
} from "../hooks/useSupabase";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import SectionDivider from "../components/ui/SectionDivider";
import SkillCard from "../components/about/SkillCard";
import ExperienceItem from "../components/about/ExperienceItem";
import EducationItem from "../components/about/EducationItem";
import InterestItem from "../components/about/InterestItem";
import ProfileImage from "../components/ui/ProfileImage";

const AboutPage = () => {
  const { data: personalData, isLoading: isLoadingPersonal } =
    usePersonalData();
  const { data: skills, isLoading: isLoadingSkills } = useSkills();
  const { data: softSkills, isLoading: isLoadingSoftSkills } = useSoftSkills();
  const { data: workExperience, isLoading: isLoadingWork } =
    useWorkExperience();
  const { data: education, isLoading: isLoadingEducation } = useEducation();
  const { data: interests, isLoading: isLoadingInterests } = useInterests();

  const isLoading =
    isLoadingPersonal ??
    isLoadingSkills ??
    isLoadingSoftSkills ??
    isLoadingWork ??
    isLoadingEducation ??
    isLoadingInterests;

  // Use personal data from backend
  const personalInfo = personalData ?? {
    name: "",
    title: "",
    bio: "",
    profile_image_url: "",
    resume_url: "",
  };

  return (
    <Container>
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" text="Loading about information..." />
        </div>
      )}
      <div className={`py-20 ${isLoading ? "hidden" : ""}`}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
                About Me
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {personalInfo.bio}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  href={personalInfo.resume_url ?? "#"}
                  variant="primary"
                  isExternal
                  isDisabled={!personalInfo.resume_url}
                  rightIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  }
                >
                  {personalInfo.resume_url
                    ? "Download CV"
                    : "Resume Not Available"}
                </Button>
                <Button href="/contact" variant="outline">
                  Contact Me
                </Button>
              </div>
            </div>
            {/* Profile Image Component */}
            <ProfileImage
              imageUrl={personalInfo.profile_image_url}
              name={personalInfo.name}
              isLoading={isLoadingPersonal}
              size="sm"
            />
          </div>
        </motion.div>

        <SectionDivider />

        {/* Technical Skills Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-24 pt-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Technical Skills
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mb-8">
            My expertise in various technologies and tools that I use to build
            exceptional digital experiences.
          </p>
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
            {!isLoadingSkills && !skills && (
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
            {!isLoadingSkills && skills && skills.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No technical skills found
                </p>
              </div>
            )}

            {/* Skills display */}
            {!isLoadingSkills &&
              skills?.map((skill, index) => (
                <SkillCard
                  key={skill.id}
                  name={skill.name}
                  description={skill.description}
                  icon={
                    <div
                      dangerouslySetInnerHTML={{ __html: skill.icon ?? "" }}
                    />
                  }
                  index={index}
                  level={skill.level ?? 3}
                  type="technical"
                />
              ))}
          </div>
        </motion.section>

        {/* Soft Skills Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-24 pt-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Soft Skills
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mb-8">
            Beyond technical abilities, these interpersonal skills help me
            collaborate effectively and deliver successful projects.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading state */}
            {isLoadingSoftSkills && (
              <div className="col-span-3 text-center py-8">
                <div className="inline-block">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading soft skills...
                </p>
              </div>
            )}

            {/* Error state */}
            {!isLoadingSoftSkills && !softSkills && (
              <div className="col-span-3 text-center py-8">
                <p className="text-red-500 dark:text-red-400 mb-2">
                  Failed to load soft skills
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Please try again later
                </p>
              </div>
            )}

            {/* No skills found */}
            {!isLoadingSoftSkills && softSkills && softSkills.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No soft skills found
                </p>
              </div>
            )}

            {/* Skills display */}
            {!isLoadingSoftSkills &&
              softSkills?.map((skill, index) => (
                <SkillCard
                  key={skill.id}
                  name={skill.name}
                  description={skill.description}
                  icon={
                    <div
                      dangerouslySetInnerHTML={{ __html: skill.icon ?? "" }}
                    />
                  }
                  index={index}
                  type="soft"
                />
              ))}
          </div>
        </motion.section>

        <SectionDivider />

        {/* Experience Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-24 pt-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Work Experience
          </h2>
          <div className="space-y-8">
            {/* Loading state */}
            {isLoadingWork && (
              <div className="text-center py-8">
                <div className="inline-block">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading work experience...
                </p>
              </div>
            )}

            {/* Error state */}
            {!isLoadingWork && !workExperience && (
              <div className="text-center py-8">
                <p className="text-red-500 dark:text-red-400 mb-2">
                  Failed to load work experience
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Please try again later
                </p>
              </div>
            )}

            {/* No experience found */}
            {!isLoadingWork &&
              workExperience &&
              workExperience.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No work experience found
                  </p>
                </div>
              )}

            {/* Experience display */}
            {!isLoadingWork &&
              workExperience?.map((experience, index) => (
                <ExperienceItem
                  key={experience.id}
                  title={experience.title}
                  company={experience.company}
                  location={experience.location}
                  startDate={experience.start_date}
                  endDate={experience.end_date}
                  description={experience.description}
                  achievements={experience.achievements}
                  technologies={experience.technologies}
                  index={index}
                />
              ))}
          </div>
        </motion.section>

        <SectionDivider />

        {/* Education Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-24 pt-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Education
          </h2>
          <div className="space-y-8">
            {/* Loading state */}
            {isLoadingEducation && (
              <div className="text-center py-8">
                <div className="inline-block">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading education...
                </p>
              </div>
            )}

            {/* Error state */}
            {!isLoadingEducation && !education && (
              <div className="text-center py-8">
                <p className="text-red-500 dark:text-red-400 mb-2">
                  Failed to load education
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Please try again later
                </p>
              </div>
            )}

            {/* No education found */}
            {!isLoadingEducation && education && education.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No education found
                </p>
              </div>
            )}

            {/* Education display */}
            {!isLoadingEducation &&
              education?.map((edu, index) => (
                <EducationItem
                  key={edu.id}
                  degree={edu.degree}
                  institution={edu.institution}
                  location={edu.location}
                  startDate={edu.start_date}
                  endDate={edu.end_date}
                  description={edu.description}
                  achievements={edu.achievements}
                  index={index}
                />
              ))}
          </div>
        </motion.section>

        <SectionDivider />

        {/* Interests Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="pt-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Interests
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Loading state */}
            {isLoadingInterests && (
              <div className="col-span-full text-center py-8">
                <div className="inline-block">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading interests...
                </p>
              </div>
            )}

            {/* Error state */}
            {!isLoadingInterests && !interests && (
              <div className="col-span-full text-center py-8">
                <p className="text-red-500 dark:text-red-400 mb-2">
                  Failed to load interests
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Please try again later
                </p>
              </div>
            )}

            {/* No interests found */}
            {!isLoadingInterests && interests && interests.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No interests found
                </p>
              </div>
            )}

            {/* Interests display */}
            {!isLoadingInterests &&
              interests?.map((interest, index) => (
                <InterestItem
                  key={interest.id}
                  name={interest.name}
                  icon={
                    <div
                      dangerouslySetInnerHTML={{ __html: interest.icon ?? "" }}
                    />
                  }
                  index={index}
                />
              ))}
          </div>
        </motion.section>
      </div>
    </Container>
  );
};

export default AboutPage;
