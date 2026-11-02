import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle,
  Clock,
  Package,
  AlertTriangle,
  History,
  Plus,
  Edit2,
  X,
  Check,
  User,
  Shield,
} from 'lucide-react';
import { MaintenanceTask, InventoryItem } from '../../types';
import {
  getMaintenanceTasks,
  updateMaintenanceTaskStatus,
  getInventory,
  saveInventoryItem,
  getCurrentUser,
  subscribeToStorage,
} from '../../services/storage';

export const StaffDashboard: React.FC = () => {
  const currentUser = getCurrentUser();
  const [tasks, setTasks] = useState<MaintenanceTask[]>(getMaintenanceTasks());
  const [inventory, setInventory] = useState<InventoryItem[]>(getInventory());

  const [activeTab, setActiveTab] = useState<'tasks' | 'inventory' | 'history'>('tasks');

  // Complete Task Modal
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Restock Item Modal
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);

  useEffect(() => {
    const refresh = () => {
      setTasks(getMaintenanceTasks());
      setInventory(getInventory());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  const handleStartTask = (taskId: string) => {
    updateMaintenanceTaskStatus(taskId, 'In Progress', 'Work commenced on site.');
  };

  const handleOpenComplete = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setCompletionNotes('');
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    updateMaintenanceTaskStatus(selectedTask.id, 'Completed', completionNotes || 'Work finished and tested.');
    setIsCompleteModalOpen(false);
  };

  const handleOpenRestock = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewStockQty(item.quantity);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    saveInventoryItem({
      ...selectedItem,
      quantity: Number(newStockQty),
      lastRestocked: new Date().toISOString().split('T')[0],
    });
    setIsRestockModalOpen(false);
  };

  const lowStockItems = inventory.filter((i) => i.quantity <= i.minStockLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hostel Maintenance Staff Operations
          </h1>
          <p className="text-xs text-slate-500">
            Work orders queue, on-site task completion, spare parts inventory, and material logging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            Active Staff: {currentUser.name}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Assigned Work Orders</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{tasks.length}</div>
          <div className="text-[11px] text-slate-500">Total assigned tickets</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-amber-700 uppercase">Pending & Active</span>
          <div className="mt-1 text-2xl font-bold text-amber-800">{pendingTasks.length}</div>
          <div className="text-[11px] text-amber-600">Requires immediate attention</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-emerald-700 uppercase">Resolved Tasks</span>
          <div className="mt-1 text-2xl font-bold text-emerald-800">{completedTasks.length}</div>
          <div className="text-[11px] text-emerald-600">Verified by residents</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-red-700 uppercase">Low Stock Alerts</span>
          <div className="mt-1 text-2xl font-bold text-red-800">{lowStockItems.length}</div>
          <div className="text-[11px] text-red-600">Items below minimum safety stock</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'tasks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Work Orders Queue ({pendingTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tools & Spare Parts Inventory ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Task History ({completedTasks.length})
        </button>
      </div>

      {/* Tab 1: Tasks Queue */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              No pending tasks in work orders queue. All hostel rooms operational!
            </div>
          ) : (
            pendingTasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        t.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        t.priority === 'High' || t.priority === 'Emergency'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority} Priority
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {t.category}
                    </span>
                    <span className="text-xs text-slate-400">• Scheduled: {t.scheduledDate}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Location: <strong className="text-slate-900">{t.roomNumber}</strong> ({t.hostelName})
                  </p>
                  {t.remarks && <p className="text-xs text-slate-500 italic">Notes: {t.remarks}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {t.status === 'Pending' && (
                    <button
                      onClick={() => handleStartTask(t.id)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                    >
                      Start Work
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenComplete(t)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete Order</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Current Stock</th>
                    <th className="py-3 px-3">Min Safety Stock</th>
                    <th className="py-3 px-3">Storage Location</th>
                    <th className="py-3 px-3">Last Restocked</th>
                    <th className="py-3 px-4 text-right">Update Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.itemName}</td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.quantity <= item.minStockLevel ? 'text-red-600' : 'text-slate-900'
                          }`}
                        >
                          {item.quantity} {item.unit}
                        </span>
                        {item.quantity <= item.minStockLevel && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {item.minStockLevel} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{item.location}</td>
                      <td className="py-3 px-3 text-slate-400">{item.lastRestocked}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenRestock(item)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {completedTasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              No completed work orders history.
            </div>
          ) : (
            completedTasks.map((t) => (
              <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{t.title}</div>
                  <span className="text-[11px] text-emerald-700 font-semibold">Completed: {t.completedAt}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Location: <strong>{t.roomNumber}</strong> • Category: {t.category}
                </div>
                {t.remarks && <p className="text-xs text-slate-500 italic mt-1">Resolution: {t.remarks}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Complete Order Modal */}
      {isCompleteModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Complete Work Order</h2>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="p-6 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div className="font-bold text-slate-900">{selectedTask.title}</div>
                <div className="text-slate-500">Room {selectedTask.roomNumber}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technician Action Summary / Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Replaced switch with new unit from stock. Voltage tested and verified safe."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Inventory Modal */}
      {isRestockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Update Stock: {selectedItem.itemName}</h2>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Available Stock Quantity ({selectedItem.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Update Inventory Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
