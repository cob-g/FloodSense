import { useState } from 'react';
import { useCreateReport } from '../../hooks/useReports';
import { DEPTH_OPTIONS, PASSABILITY_OPTIONS, MESSAGES } from '../../utils/constants';
import LocationPicker from '../map/LocationPicker';

export const ReportSubmissionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    depth: '',
    passability: '',
    description: '',
    location: null,
    photos: [],
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [error, setError] = useState('');
  const [useMyLocation, setUseMyLocation] = useState(null);
  
  const createReport = useCreateReport();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (5MB max per file)
    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      setError('Some files are too large. Maximum size is 5MB per photo.');
      return;
    }

    // Limit to 3 photos
    if (files.length > 3) {
      setError('Maximum 3 photos allowed');
      return;
    }

    setPhotoFiles(files);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.location) {
      setError(MESSAGES.LOCATION_REQUIRED);
      return;
    }

    if (photoFiles.length === 0) {
      setError(MESSAGES.PHOTO_REQUIRED);
      return;
    }

    // Create FormData for multipart upload
    const submitData = new FormData();
    submitData.append('depth', formData.depth);
    submitData.append('passability', formData.passability);
    submitData.append('description', formData.description);
    submitData.append('latitude', formData.location.lat);
    submitData.append('longitude', formData.location.lng);
    submitData.append('address', formData.location.address);
    submitData.append('barangay', formData.location.barangay);

    // Append photos
    photoFiles.forEach((file) => {
      submitData.append('photos', file);
    });

    try {
      const response = await createReport.mutateAsync(submitData);
      
      if (response.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(response.message || 'Failed to submit report');
      }
    } catch (err) {
      if (err.message?.includes('3 minuto')) {
        setError(MESSAGES.RATE_LIMIT);
      } else {
        setError(err.message || 'An error occurred while submitting the report');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[2000]">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-neutral-900">Submit Flood Report</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <span className="text-xl text-neutral-600">×</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 text-danger-700 text-sm">
              {error}
            </div>
          )}

          {/* Location Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">
                Location <span className="text-danger-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => useMyLocation && useMyLocation()}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <span>📍</span>
                <span>Use My Location</span>
              </button>
            </div>
            <LocationPicker
              onLocationSelect={(location) => setFormData({ ...formData, location })}
              initialLocation={formData.location}
              registerUseMyLocation={(fn) => setUseMyLocation(() => fn)}
              showInMapButton={false}
            />
          </div>

          {/* Water Depth */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Water Depth <span className="text-danger-500">*</span>
            </label>
            <select
              required
              value={formData.depth}
              onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select depth</option>
              {DEPTH_OPTIONS.map((depth) => (
                <option key={depth} value={depth}>
                  {depth}
                </option>
              ))}
            </select>
          </div>

          {/* Road Passability */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Road Passability <span className="text-danger-500">*</span>
            </label>
            <select
              required
              value={formData.passability}
              onChange={(e) => setFormData({ ...formData, passability: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select passability</option>
              {PASSABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Additional details about the flood situation..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Photos <span className="text-danger-500">*</span>
              <span className="text-xs text-neutral-500 ml-2">(Max 3 photos, 5MB each)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {photoFiles.length > 0 && (
              <div className="mt-2 flex gap-2">
                {photoFiles.map((file, index) => (
                  <div key={index} className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReport.isLoading}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createReport.isLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

          {/* Info Message */}
          <p className="text-xs text-neutral-500 text-center">
            {MESSAGES.REPORT_SUCCESS}
          </p>
        </form>
      </div>
    </div>
  );
};

export default ReportSubmissionForm;
