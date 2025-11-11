import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ReportList from '../components/reports/ReportList';
import SensorDashboard from '../components/sensors/SensorDashboard';
import { useReports } from '../hooks/useReports';
import MapView from '../components/map/MapView';
import ReportSubmissionForm from '../components/reports/ReportSubmissionForm';

export const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showReportForm, setShowReportForm] = useState(false);
  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useReports();

   return (
     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
       <header className="bg-white dark:bg-gray-800 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
           <h1 className="text-2xl font-bold text-orange-500">FloodSense</h1>
           <div className="flex items-center space-x-4">
             <span className="text-sm text-gray-600 dark:text-gray-300">
               {user?.email || 'User'}
             </span>
             <button
               onClick={() => {
                 logout();
                 navigate('/');
               }}
               className="px-4 py-2 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
             >
               Logout
             </button>
           </div>
         </div>
       </header>

       <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
         {/* Map Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-semibold">Live Map</h2>
             <button
               onClick={() => setShowReportForm(true)}
               className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
             >
               Submit Report
             </button>
           </div>
           <div className="h-[500px] rounded-lg overflow-hidden">
             <MapView
               reports={reportsData?.data?.reports || []}
               onMarkerClick={(report) => console.log('Clicked report:', report)}
             />
           </div>
         </div>

         {/* Sensor Dashboard */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
           <h2 className="text-xl font-semibold mb-6">Sensor Readings</h2>
           <SensorDashboard />
         </div>

         {/* Reports Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
           <h2 className="text-xl font-semibold mb-6">Recent Reports</h2>
           <ReportList
             reports={reportsData?.data?.reports || []}
             loading={reportsLoading}
             error={reportsError}
           />
         </div>
       </main>

       {/* Report Submission Modal */}
       {showReportForm && (
         <ReportSubmissionForm
           onClose={() => setShowReportForm(false)}
           onSuccess={() => {
             setShowReportForm(false);
             // Reports will automatically refresh due to React Query
           }}
         />
       )}
     </div>
   );
 };

 export default HomePage;