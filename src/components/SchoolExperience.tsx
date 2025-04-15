import { useEffect, useState } from 'react';

export default function SchoolExperience() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">School Experience</h2>
          
          {/* Publicity Department */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Publicity Department, City, CSSA</h3>
              </div>
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-300">Oct 2022 – Sep 2023</p>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Quantitative Results: Optimizing content and visuals led to a 50% increase in XiaoHongshu fans in 3 months, with single note page views exceeding 10,000 and an average interaction rate of 15%</li>
              <li>Content Creation Ability: Successfully planned and produced holiday discount information, enhancing exposure and recognition through engaging covers and visual layouts</li>
            </ul>
          </div>

          {/* Negotiation Training Camp */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Negotiation Training Camp, City, University of London</h3>
              </div>
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-300">Oct 2022 – Sep 2023</p>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Define Responsibilities: 5 individuals work together to analyse company reports and assign tasks to other departments</li>
              <li>Data Analysis: Conduct SWOT and technical analyses to identify other companies' loopholes while prioritising own company's interests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}