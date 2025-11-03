import { useAuth } from '../../hooks/useAuth';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Profile</h1>

      <div className="bg-white rounded-2xl shadow-material p-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Name
            </label>
            <p className="text-lg text-neutral-900">{user?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <p className="text-lg text-neutral-900">{user?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Barangay
            </label>
            <p className="text-lg text-neutral-900">{user?.barangay}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Role
            </label>
            <p className="text-lg text-neutral-900 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
