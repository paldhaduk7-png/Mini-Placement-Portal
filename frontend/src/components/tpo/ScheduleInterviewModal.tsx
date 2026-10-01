import React, { useState, useEffect } from 'react';
import { Application, Interview } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Info } from 'lucide-react';

interface ScheduleInterviewModalProps {
  application: Application;
  onClose: () => void;
  onSave: (applicationId: string, data: any) => Promise<void>;
  existingInterview?: Interview;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  application,
  onClose,
  onSave,
  existingInterview,
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [round, setRound] = useState('Technical Round');
  const [mode, setMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingInterview) {
      if (existingInterview.interviewDate) {
        setDate(new Date(existingInterview.interviewDate).toISOString().split('T')[0]);
      }
      setTime(existingInterview.interviewTime || '');
      setRound(existingInterview.round || 'Technical Round');
      setMode(existingInterview.mode || 'ONLINE');
      setMeetingLink(existingInterview.meetingLink || '');
      setLocation(existingInterview.location || '');
      setInstructions(existingInterview.instructions || '');
    }
  }, [existingInterview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(application.id, {
        interviewDate: date,
        interviewTime: time,
        round,
        mode,
        meetingLink: mode === 'ONLINE' ? meetingLink : undefined,
        location: mode === 'OFFLINE' ? location : undefined,
        instructions,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              {existingInterview ? 'Edit Interview' : 'Schedule Interview'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              For {application.student?.fullName} ({application.drive?.company?.name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Date *
              </label>
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Time *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Interview Round *</label>
            <input
              type="text"
              required
              value={round}
              onChange={(e) => setRound(e.target.value)}
              placeholder="e.g. Technical Round 1, HR Round"
              className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Mode *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="ONLINE"
                  checked={mode === 'ONLINE'}
                  onChange={() => setMode('ONLINE')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Online</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="OFFLINE"
                  checked={mode === 'OFFLINE'}
                  onChange={() => setMode('OFFLINE')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Offline</span>
              </label>
            </div>
          </div>

          {mode === 'ONLINE' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" /> Meeting Link *
              </label>
              <input
                type="url"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Office Address / Cabin Room"
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Additional Instructions (Optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              placeholder="Any specific documents to bring or prerequisites..."
              className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white"
            >
              {isSubmitting ? 'Saving...' : existingInterview ? 'Update Interview' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
