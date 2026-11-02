import React from 'react';
import {
  AlertTriangle,
  Phone,
  Shield,
  HeartPulse,
  Flame,
  FileText,
  X,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const contacts = [
    { title: 'Chief Warden Emergency Hotline', name: 'Dr. Rajesh Sharma', phone: '+91 98401 22345', available: '24x7 Immediate' },
    { title: 'Aryabhatta Hostel Block A Warden', name: 'Prof. Anita Desai', phone: '+91 98402 33456', available: '24x7 On-Campus' },
    { title: 'Girls Hostel Block B Warden', name: 'Dr. Meenakshi Sundaram', phone: '+91 98405 66789', available: '24x7 On-Campus' },
    { title: 'Campus Health Center & Ambulance', name: 'Dr. V. Ramanathan (CMO)', phone: '+91 98400 10800', available: '24x7 Emergency ICU Van' },
    { title: 'Main Security Gate & Control Room', name: 'Chief Security Officer', phone: '+91 98400 11999', available: '24x7 Main Gate' },
    { title: 'Nearest City Police Station', name: 'Sub-Inspector Desk', phone: '112 / +91 44 2233 4455', available: 'Local Police Dispatch' },
    { title: 'Fire & Rescue Command', name: 'Fire Control Room', phone: '101 / +91 44 2233 1101', available: 'Station 4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-red-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-red-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700/80">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Hostel Emergency SOS & Crisis Contacts</h2>
              <p className="text-xs text-red-100">Immediate response directory for students and staff</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-red-200 hover:text-white hover:bg-red-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <p className="font-semibold flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-red-600" />
              In case of severe medical illness or security distress:
            </p>
            <p className="mt-1 text-red-700">
              Notify your floor warden immediately or call the Campus Ambulance directly. The security gate will clear the fast-track emergency barrier automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contacts.map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 hover:border-red-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="text-xs font-bold text-slate-800">{c.title}</div>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                    {c.available}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600">{c.name}</div>
                <a
                  href={`tel:${c.phone}`}
                  className="mt-2.5 inline-flex items-center gap-2 font-mono text-xs font-bold text-red-700 bg-red-100/60 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {c.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
};

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    { title: 'Night Curfew & Roll Call', desc: 'Hostel gates close strictly at 9:00 PM on weekdays and 9:30 PM on weekends. Biometric or manual attendance is compulsory every night.' },
    { title: 'Leave & Outstation Protocol', desc: 'Students must apply for digital leave at least 24 hours in advance with verified parent mobile contact. Exiting without approval is deemed unauthorized absence.' },
    { title: 'Room Cleanliness & Asset Care', desc: 'Rooms must be kept clean. Defacing walls, tampering with electrical fixtures, or damaging furniture attracts maintenance penalties.' },
    { title: 'Visitor Regulations', desc: 'Parents and authorized guardians may visit designated visitor lounges between 9:00 AM and 6:00 PM. No unauthorized persons are permitted inside hostel rooms.' },
    { title: 'Anti-Ragging Zero Tolerance', desc: 'Strict zero-tolerance policy in compliance with Supreme Court of India guidelines. Violations result in immediate expulsion and police reporting.' },
    { title: 'Electrical Appliance Policy', desc: 'High-wattage appliances (immersion heaters, induction stoves, electric kettles) are prohibited inside rooms to prevent electrical hazards.' },
    { title: 'Quiet Hours for Study', desc: 'Quiet hours are observed between 10:30 PM and 6:00 AM daily to facilitate academic research and rest.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Hostel Code of Conduct & Policies</h2>
              <p className="text-xs text-slate-300">Standing institutional guidelines for hostel residents</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-3">
          {rules.map((rule, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {idx + 1}
                </span>
                {rule.title}
              </div>
              <p className="mt-1.5 pl-7 text-xs text-slate-600 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
          >
            I Acknowledge Policies
          </button>
        </div>
      </div>
    </div>
  );
};
