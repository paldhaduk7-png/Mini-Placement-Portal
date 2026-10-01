import React, { useState, useEffect } from 'react';
import { Application, Interview } from '@/types/application';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Info,
  X,
  CalendarPlus,
  CalendarCheck
} from 'lucide-react';

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
        const rawDate = existingInterview.interviewDate;
        if (typeof rawDate === 'string' && rawDate.includes('T')) {
          const d = new Date(rawDate);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          setDate(`${year}-${month}-${day}`);
        } else if (typeof rawDate === 'string') {
          setDate(rawDate.substring(0, 10));
        }
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
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs shrink-0">
              {existingInterview ? (
                <CalendarCheck className="h-5 w-5 text-blue-600" />
              ) : (
                <CalendarPlus className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {existingInterview ? 'Edit Interview' : 'Schedule Interview'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{application.student?.fullName || 'Student'}</span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                  {application.drive?.company?.name || 'Company'}
                </span>
                {application.drive?.role && (
                  <span className="text-[11px] text-slate-400">({application.drive.role})</span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                min={existingInterview ? undefined : new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Interview Round */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Interview Round <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">e.g. Technical Round 1</span>
            </label>
            <input
              type="text"
              required
              value={round}
              onChange={(e) => setRound(e.target.value)}
              placeholder="e.g. Technical Round 1, System Design, HR"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          {/* Mode Selector Segmented Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Interview Mode <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('ONLINE')}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'ONLINE'
                    ? 'bg-blue-50/80 border-blue-300 text-blue-700 shadow-xs ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Video className={`h-4 w-4 ${mode === 'ONLINE' ? 'text-blue-600' : 'text-slate-400'}`} />
                Online Meeting
              </button>
              <button
                type="button"
                onClick={() => setMode('OFFLINE')}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'OFFLINE'
                    ? 'bg-blue-50/80 border-blue-300 text-blue-700 shadow-xs ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <MapPin className={`h-4 w-4 ${mode === 'OFFLINE' ? 'text-blue-600' : 'text-slate-400'}`} />
                Offline / On-Campus
              </button>
            </div>
          </div>

          {/* Conditional: Meeting Link or Location */}
          {mode === 'ONLINE' ? (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-blue-600" />
                  Meeting Link <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Google Meet, Zoom, Teams</span>
              </label>
              <input
                type="url"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>
          ) : (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  Interview Location <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Room, block, or address</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Placement Cell - Interview Room 2, Block A"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-500" />
              Additional Instructions <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              placeholder="Provide candidate instructions, prerequisites, documents to bring, or interview panel details..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : existingInterview ? (
                <>
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Update Interview
                </>
              ) : (
                <>
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Schedule Interview
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
