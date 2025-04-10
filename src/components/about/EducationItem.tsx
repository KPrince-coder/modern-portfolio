import { motion } from 'framer-motion';

interface EducationItemProps {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  index: number;
}

const EducationItem = ({
  degree,
  institution,
  location,
  startDate,
  endDate,
  description,
  achievements,
  index,
}: EducationItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{degree}</h3>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">{institution}</p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <p className="text-gray-600 dark:text-gray-300">{location}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {startDate} - {endDate}
          </p>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </p>
      
      {achievements.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Achievements</h4>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
            {achievements.map((achievement, i) => (
              <li key={i}>{achievement}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default EducationItem;
