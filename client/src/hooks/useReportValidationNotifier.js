import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import { useToast } from '../contexts/ToastContext';

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const raw = value.id || value._id || null;
    return raw == null ? null : String(raw);
  }
  return null;
};

const getReportFromPayload = (payload) => {
  if (!payload) return null;
  if (payload.report && typeof payload.report === 'object') return payload.report;
  if (typeof payload === 'object') return payload;
  return null;
};

const getReporterId = (report) => {
  if (!report) return null;
  return normalizeId(report.reporter) || normalizeId(report.user);
};

const getReportLocation = (report) => {
  if (report?.location?.address) return report.location.address;
  if (report?.barangay) return `Brgy. ${report.barangay}`;
  return 'your area';
};

export const useReportValidationNotifier = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { success, warning } = useToast();
  const seenEventsRef = useRef(new Set());

  useEffect(() => {
    seenEventsRef.current.clear();
  }, [user?.id, user?._id]);

  useEffect(() => {
    const userId = normalizeId(user);
    if (!socket || !userId) return;

    const notifyIfReporter = (action, payload) => {
      const report = getReportFromPayload(payload);
      if (!report) return;

      const reporterId = getReporterId(report);
      if (!reporterId || reporterId !== userId) return;

      const reportId = normalizeId(report) || `${report.createdAt || 'unknown'}`;
      const dedupeKey = `${action}:${reportId}`;
      if (seenEventsRef.current.has(dedupeKey)) return;
      seenEventsRef.current.add(dedupeKey);

      const location = getReportLocation(report);

      if (action === 'validated') {
        success('Report validated', `Your flood report in ${location} was validated by admin.`);
        return;
      }

      if (action !== 'rejected') return;

      const notes = report.validationNotes?.trim();
      const details = notes
        ? `Your flood report in ${location} was rejected. Reason: ${notes}`
        : `Your flood report in ${location} was rejected by admin.`;

      warning('Report rejected', details);
    };

    const onValidated = (payload) => notifyIfReporter('validated', payload);
    const onRejected = (payload) => notifyIfReporter('rejected', payload);
    const onReportUpdate = (payload) => {
      const action = payload?.type;
      if (action !== 'validated' && action !== 'rejected') return;
      notifyIfReporter(action, payload);
    };

    socket.on('report-validated', onValidated);
    socket.on('report-rejected', onRejected);
    socket.on('report-update', onReportUpdate);

    return () => {
      socket.off('report-validated', onValidated);
      socket.off('report-rejected', onRejected);
      socket.off('report-update', onReportUpdate);
    };
  }, [socket, user, success, warning]);
};

export default useReportValidationNotifier;
