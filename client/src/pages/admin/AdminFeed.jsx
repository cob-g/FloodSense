import { useMemo } from 'react';
import { useReports } from '../../hooks/useReports';
import ReportList from '../../components/reports/ReportList';

export const AdminFeed = () => {
  const { data, isLoading, error } = useReports({ limit: 50 });
  const reports = useMemo(() => data?.data?.reports || [], [data]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Feed</h1>
          <p className="text-white/60">Quick view of the latest community reports</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <ReportList reports={reports} loading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default AdminFeed;
