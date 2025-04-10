import { motion } from 'framer-motion';
import { usePersonalData, useSkills, useWorkExperience, useEducation, useInterests, useSoftSkills } from '../hooks/useSupabase';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SectionDivider from '../components/ui/SectionDivider';
import SkillCard from '../components/about/SkillCard';
import ExperienceItem from '../components/about/ExperienceItem';
import EducationItem from '../components/about/EducationItem';
import InterestItem from '../components/about/InterestItem';

const AboutPage = () => {
  const { data: personalData, isLoading: isLoadingPersonal, error: personalError } = usePersonalData();
  const { data: skills, isLoading: isLoadingSkills } = useSkills();
  const { data: softSkills, isLoading: isLoadingSoftSkills } = useSoftSkills();
  const { data: workExperience, isLoading: isLoadingWork } = useWorkExperience();
  const { data: education, isLoading: isLoadingEducation } = useEducation();
  const { data: interests, isLoading: isLoadingInterests } = useInterests();

  const isLoading = isLoadingPersonal || isLoadingSkills || isLoadingSoftSkills || isLoadingWork || isLoadingEducation || isLoadingInterests;
  const error = personalError;

  // Always render the component, but use sample data if the real data is not available
  // This ensures the component doesn't crash if Supabase is not set up
  const personalInfo = personalData || {
    name: 'John Doe',
    title: 'Creative Developer & Designer',
    bio: 'I build exceptional digital experiences that are fast, accessible, and visually appealing.',
    profile_image_url: '',
    resume_url: '#',
  };

  return (
    <Container>
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" text="Loading about information..." />
        </div>
      )}
      <div className={`py-20 ${isLoading ? 'hidden' : ''}`}>
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
                  href={personalInfo.resume_url}
                  variant="primary"
                  isExternal
                  rightIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                >
                  Download CV
                </Button>
                <Button
                  href="/contact"
                  variant="outline"
                >
                  Contact Me
                </Button>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* Container with max width to make image more professional */}
              <div className="max-w-xs md:max-w-sm relative mx-auto">
                {/* Gradient border */}
                <div className="aspect-square rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                    {personalInfo.profile_image_url ? (
                      <img
                        src={personalInfo.profile_image_url}
                        alt={personalInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <svg className="w-1/3 h-1/3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-900 animate-spin-slow"></div>

                {/* Additional decorative elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] rounded-full border border-indigo-100 dark:border-indigo-800 opacity-70"></div>
                <div className="absolute -z-20 -bottom-6 -right-6 w-24 h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-xl"></div>
                <div className="absolute -z-20 -top-6 -left-6 w-20 h-20 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-xl"></div>
              </div>
            </motion.div>
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
            My expertise in various technologies and tools that I use to build exceptional digital experiences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(skills || sampleTechnicalSkills).map((skill, index) => (
              <SkillCard
                key={skill.name || skill.id}
                name={skill.name}
                description={skill.description}
                icon={typeof skill.icon === 'string' ? <div dangerouslySetInnerHTML={{ __html: skill.icon }} /> : skill.icon}
                index={index}
                level={skill.level || 3}
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
            Beyond technical abilities, these interpersonal skills help me collaborate effectively and deliver successful projects.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(softSkills || sampleSoftSkills).map((skill, index) => (
              <SkillCard
                key={skill.name || skill.id}
                name={skill.name}
                description={skill.description}
                icon={typeof skill.icon === 'string' ? <div dangerouslySetInnerHTML={{ __html: skill.icon }} /> : skill.icon}
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
            {(workExperience || sampleWorkExperience).map((experience, index) => (
              <ExperienceItem
                key={experience.id || `${experience.company}-${index}`}
                title={experience.title}
                company={experience.company}
                location={experience.location}
                startDate={experience.start_date || experience.startDate}
                endDate={experience.end_date || experience.endDate}
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
            {(education || sampleEducation).map((edu, index) => (
              <EducationItem
                key={edu.id || `${edu.institution}-${index}`}
                degree={edu.degree}
                institution={edu.institution}
                location={edu.location}
                startDate={edu.start_date || edu.startDate}
                endDate={edu.end_date || edu.endDate}
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
            {(interests || sampleInterests).map((interest, index) => (
              <InterestItem
                key={interest.id || interest.name}
                name={interest.name}
                icon={typeof interest.icon === 'string' ? <div dangerouslySetInnerHTML={{ __html: interest.icon }} /> : interest.icon}
                index={index}
              />
            ))}
          </div>
        </motion.section>
      </div>
    </Container>
  );
};

// Sample data (in a real app, this would come from the CMS/Supabase)
const sampleTechnicalSkills = [
  {
    name: 'Frontend Development',
    description: 'Creating responsive and interactive user interfaces with modern frameworks.',
    level: 5,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Backend Development',
    description: 'Building robust server-side applications and APIs.',
    level: 4,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'UI/UX Design',
    description: 'Designing intuitive and visually appealing user experiences.',
    level: 4,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
      </svg>
    ),
  },
  {
    name: 'Database Design',
    description: 'Designing and optimizing database schemas for performance.',
    level: 3,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
      </svg>
    ),
  },
  {
    name: 'AI Integration',
    description: 'Implementing AI solutions to enhance user experiences.',
    level: 3,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Performance Optimization',
    description: 'Optimizing applications for speed and efficiency.',
    level: 4,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Responsive Design',
    description: 'Creating websites that work on all devices and screen sizes.',
    level: 5,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    name: 'Accessibility',
    description: 'Ensuring websites are usable by people of all abilities.',
    level: 4,
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const sampleSoftSkills = [
  {
    name: 'Communication',
    description: 'Effectively conveying ideas and information to team members, stakeholders, and clients.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
      </svg>
    ),
  },
  {
    name: 'Problem Solving',
    description: 'Analyzing complex issues and developing innovative solutions to technical challenges.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
      </svg>
    ),
  },
  {
    name: 'Teamwork',
    description: 'Collaborating effectively with cross-functional teams to achieve project goals.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  {
    name: 'Time Management',
    description: 'Prioritizing tasks and managing deadlines to deliver projects efficiently.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Adaptability',
    description: 'Quickly learning new technologies and adjusting to changing project requirements.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    name: 'Leadership',
    description: 'Guiding and motivating team members to achieve their best work and meet project objectives.',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const sampleWorkExperience = [
  {
    title: 'Senior Frontend Developer',
    company: 'Tech Innovations Inc.',
    location: 'San Francisco, CA',
    startDate: 'January 2020',
    endDate: 'Present',
    description: 'Leading the frontend development team in building modern, responsive web applications using React, TypeScript, and Tailwind CSS.',
    achievements: [
      'Redesigned the company\'s flagship product, resulting in a 40% increase in user engagement',
      'Implemented a component library that reduced development time by 30%',
      'Mentored junior developers and conducted code reviews',
      'Optimized application performance, reducing load times by 50%'
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'GraphQL']
  },
  {
    title: 'Frontend Developer',
    company: 'Digital Solutions LLC',
    location: 'Austin, TX',
    startDate: 'June 2017',
    endDate: 'December 2019',
    description: 'Developed and maintained web applications for clients in various industries, focusing on responsive design and cross-browser compatibility.',
    achievements: [
      'Built 15+ client websites using modern JavaScript frameworks',
      'Implemented responsive designs that improved mobile user experience',
      'Collaborated with designers to ensure pixel-perfect implementation',
      'Integrated third-party APIs and services'
    ],
    technologies: ['JavaScript', 'Vue.js', 'SCSS', 'Webpack', 'REST APIs']
  },
  {
    title: 'Web Developer Intern',
    company: 'StartUp Ventures',
    location: 'Remote',
    startDate: 'January 2017',
    endDate: 'May 2017',
    description: 'Assisted in the development of web applications and gained hands-on experience with modern web technologies.',
    achievements: [
      'Contributed to the development of a social media dashboard',
      'Fixed bugs and implemented minor features',
      'Participated in daily stand-up meetings and sprint planning'
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'jQuery', 'Bootstrap']
  }
];

const sampleEducation = [
  {
    degree: 'Master of Science in Computer Science',
    institution: 'Stanford University',
    location: 'Stanford, CA',
    startDate: 'September 2015',
    endDate: 'June 2017',
    description: 'Specialized in Human-Computer Interaction and Web Technologies.',
    achievements: [
      'GPA: 3.9/4.0',
      'Published a paper on "Optimizing User Experience in Web Applications"',
      'Teaching Assistant for "Introduction to Web Development" course',
      'Recipient of the Outstanding Graduate Student Award'
    ]
  },
  {
    degree: 'Bachelor of Science in Computer Science',
    institution: 'University of Texas',
    location: 'Austin, TX',
    startDate: 'September 2011',
    endDate: 'May 2015',
    description: 'Focused on Software Engineering and Database Systems.',
    achievements: [
      'GPA: 3.8/4.0',
      'Dean\'s List for all semesters',
      'President of the Computer Science Student Association',
      'Completed a capstone project on "Building Scalable Web Applications"'
    ]
  }
];

const sampleInterests = [
  {
    name: 'Photography',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: 'Hiking',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: 'Reading',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    )
  },
  {
    name: 'Cooking',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: 'Travel',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    )
  },
  {
    name: 'Music',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
      </svg>
    )
  },
  {
    name: 'Gaming',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
      </svg>
    )
  },
  {
    name: 'Fitness',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }
];

export default AboutPage;
