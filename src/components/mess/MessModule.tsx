import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Star,
  Edit2,
  Plus,
  Sparkles,
  MessageSquare,
  Check,
  X,
  Coffee,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { DayMessMenu, MessFeedback, Student } from '../../types';
import {
  getMessMenu,
  updateMessMenu,
  getMessFeedback,
  submitMessFeedback,
  getCurrentUser,
  getStudents,
  subscribeToStorage,
} from '../../services/storage';

export const MessModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [menus, setMenus] = useState<DayMessMenu[]>(getMessMenu());
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>(getMessFeedback());
  const [students, setStudents] = useState<Student[]>(getStudents());

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  const [selectedDay, setSelectedDay] = useState<DayMessMenu['day']>('Monday');

  // Modals
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingDayMenu, setEditingDayMenu] = useState<DayMessMenu | null>(null);

  // Feedback form state
  const currentStudent = students.find((s) => s.id === currentUser.studentId) || students[0];
  const [feedbackForm, setFeedbackForm] = useState<{
    mealType: MessFeedback['mealType'];
    rating: number;
    quality: MessFeedback['quality'];
    comments: string;
  }>({
    mealType: 'Lunch',
    rating: 5,
    quality: 'Excellent',
    comments: '',
  });

  useEffect(() => {
    const refresh = () => {
      setMenus(getMessMenu());
      setFeedbacks(getMessFeedback());
      setStudents(getStudents());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const activeDayMenu = menus.find((m) => m.day === selectedDay) || menus[0];

  const handleOpenEditMenu = (menu: DayMessMenu) => {
    setEditingDayMenu({ ...menu });
    setIsEditMenuModalOpen(true);
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDayMenu) return;
    updateMessMenu(editingDayMenu);
    setIsEditMenuModalOpen(false);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const newFb: MessFeedback = {
      id: `fb-${Date.now()}`,
      studentId: currentStudent?.id || 'stu-1',
      studentName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      mealType: feedbackForm.mealType,
      rating: feedbackForm.rating,
      quality: feedbackForm.quality,
      comments: feedbackForm.comments,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    submitMessFeedback(newFb);
    setIsFeedbackModalOpen(false);
    setFeedbackForm({
      mealType: 'Lunch',
      rating: 5,
      quality: 'Excellent',
      comments: '',
    });
  };

  // Compute average rating
  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : '4.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Mess & Dining Schedule</h1>
          <p className="text-xs text-slate-500">
            Nutritional menu planning, 4-meal daily timing, hygiene standards and student ratings.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Star className="h-4 w-4 text-amber-500" />
            <span>Rate Today's Meal</span>
          </button>
          {currentUser.role !== 'STUDENT' && (
            <button
              onClick={() => handleOpenEditMenu(activeDayMenu)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit {selectedDay} Menu</span>
            </button>
          )}
        </div>
      </div>

      {/* Meal Timing Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Breakfast</div>
            <div className="text-[11px] text-slate-500">07:30 AM – 09:30 AM</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Lunch</div>
            <div className="text-[11px] text-slate-500">12:30 PM – 02:30 PM</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Sunset className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Evening Tea / Snacks</div>
            <div className="text-[11px] text-slate-500">05:00 PM – 06:15 PM</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Dinner</div>
            <div className="text-[11px] text-slate-500">07:30 PM – 09:30 PM</div>
          </div>
        </div>
      </div>

      {/* Weekday Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDay === day
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Active Day Menu Board */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">{selectedDay}'s Standard Dining Menu</h2>
          </div>
          {activeDayMenu.specialDish && (
            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Special: {activeDayMenu.specialDish}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Breakfast */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-600" />
                Breakfast
              </span>
              <span className="text-[11px] font-semibold text-slate-400">07:30 - 09:30 AM</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeDayMenu.breakfast}
            </p>
          </div>

          {/* Lunch */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sun className="h-4 w-4 text-orange-600" />
                Lunch (Grand Thali)
              </span>
              <span className="text-[11px] font-semibold text-slate-400">12:30 - 02:30 PM</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeDayMenu.lunch}
            </p>
          </div>

          {/* Snacks */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sunset className="h-4 w-4 text-blue-600" />
                High Tea & Evening Snacks
              </span>
              <span className="text-[11px] font-semibold text-slate-400">05:00 - 06:15 PM</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeDayMenu.snacks}
            </p>
          </div>

          {/* Dinner */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-600" />
                Dinner
              </span>
              <span className="text-[11px] font-semibold text-slate-400">07:30 - 09:30 PM</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeDayMenu.dinner}
            </p>
          </div>
        </div>
      </div>

      {/* Mess Feedback & Student Reviews */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Student Mess Feedback & Ratings</h3>
            <p className="text-xs text-slate-500">Live quality oversight monitored by Mess Warden</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-amber-400" />
              <span className="ml-1 text-sm font-extrabold text-slate-900">{avgRating}</span>
              <span className="text-xs text-slate-400">/5.0</span>
            </div>
            <span className="text-xs text-slate-400">({feedbacks.length} reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{fb.studentName}</span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {fb.mealType}
                  </span>
                </div>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-600 italic">"{fb.comments}"</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Quality: <strong className="text-slate-700">{fb.quality}</strong></span>
                <span>{fb.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Menu Modal */}
      {isEditMenuModalOpen && editingDayMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Edit Food Menu: {editingDayMenu.day}</h2>
              <button onClick={() => setIsEditMenuModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Breakfast Menu</label>
                <textarea
                  required
                  rows={2}
                  value={editingDayMenu.breakfast}
                  onChange={(e) => setEditingDayMenu({ ...editingDayMenu, breakfast: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lunch Menu</label>
                <textarea
                  required
                  rows={2}
                  value={editingDayMenu.lunch}
                  onChange={(e) => setEditingDayMenu({ ...editingDayMenu, lunch: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evening Snacks</label>
                <textarea
                  required
                  rows={2}
                  value={editingDayMenu.snacks}
                  onChange={(e) => setEditingDayMenu({ ...editingDayMenu, snacks: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dinner Menu</label>
                <textarea
                  required
                  rows={2}
                  value={editingDayMenu.dinner}
                  onChange={(e) => setEditingDayMenu({ ...editingDayMenu, dinner: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Chef Dish (Optional)</label>
                <input
                  type="text"
                  value={editingDayMenu.specialDish || ''}
                  onChange={(e) => setEditingDayMenu({ ...editingDayMenu, specialDish: e.target.value })}
                  placeholder="e.g. Hot Gulab Jamun, Ice Cream, Special Biryani"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditMenuModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Save Weekly Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Submit Mess Food Rating</h2>
              <button onClick={() => setIsFeedbackModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meal Being Rated *</label>
                <select
                  value={feedbackForm.mealType}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, mealType: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Evening Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Star Rating (1 to 5) *</label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= feedbackForm.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-slate-700">{feedbackForm.rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Quality Impression *</label>
                <select
                  value={feedbackForm.quality}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, quality: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks & Taste Comments *</label>
                <textarea
                  required
                  rows={3}
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder="Share feedback on taste, freshness, hygiene, salt/spice balance..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
