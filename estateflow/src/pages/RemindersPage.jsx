import { useState, useEffect } from "react";
import { HiPlus, HiTrash, HiCheck, HiBell, HiClock, HiExclamation } from "react-icons/hi";
import { reminderService } from "../firebase/reminderService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/formatters";
import Button from "../components/common/Button";
import { ConfirmModal } from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import ReminderModal from "../components/reminders/ReminderModal";

export default function RemindersPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending | completed | all
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { if (user?.uid) loadReminders(); }, [user]);

  async function loadReminders() {
    setLoading(true);
    try {
      const data = await reminderService.getAll(user.uid);
      setReminders(data);
    } catch { toast.error("Failed to load reminders"); }
    finally { setLoading(false); }
  }

  async function handleSave(data, isEdit) {
    try {
      if (isEdit) {
        await reminderService.update(editReminder.id, data);
        toast.success("Reminder updated");
      } else {
        await reminderService.create(data, user.uid);
        toast.success("Reminder set");
      }
      setAddModalOpen(false);
      setEditReminder(null);
      loadReminders();
    } catch { toast.error("Failed to save reminder"); }
  }

  async function handleToggle(reminder) {
    try {
      if (reminder.completed) {
        await reminderService.markIncomplete(reminder.id);
      } else {
        await reminderService.markComplete(reminder.id);
        toast.success("Marked as done ✓");
      }
      loadReminders();
    } catch { toast.error("Failed to update reminder"); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await reminderService.delete(deleteTarget.id);
      toast.success("Reminder deleted");
      setDeleteTarget(null);
      loadReminders();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleteLoading(false); }
  }

  // Check if reminder is overdue
  function isOverdue(reminder) {
    if (reminder.completed || !reminder.dueDate) return false;
    const due = reminder.dueDate?.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
    return due < new Date();
  }

  const filtered = reminders.filter(r => {
    if (filter === "pending") return !r.completed;
    if (filter === "completed") return r.completed;
    return true;
  });

  const overdueCount = reminders.filter(r => isOverdue(r)).length;
  const pendingCount = reminders.filter(r => !r.completed).length;

  const priorityColors = {
    High: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    Medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    Low: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Follow-up Reminders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {pendingCount} pending · {overdueCount > 0 && <span className="text-red-500 font-medium">{overdueCount} overdue</span>}
          </p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Add Reminder
        </Button>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <HiExclamation className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            You have {overdueCount} overdue {overdueCount === 1 ? "reminder" : "reminders"}. Take action now!
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "pending", label: `Pending (${pendingCount})` },
          { key: "completed", label: `Completed (${reminders.filter(r => r.completed).length})` },
          { key: "all", label: `All (${reminders.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-violet-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === "pending" ? "No pending reminders" : "No reminders found"}
          description="Add a reminder to follow up with a lead or client."
          action={<Button icon={<HiPlus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>Add Reminder</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(reminder => {
            const overdue = isOverdue(reminder);
            const dueDate = reminder.dueDate?.toDate ? reminder.dueDate.toDate() : reminder.dueDate ? new Date(reminder.dueDate) : null;

            return (
              <div key={reminder.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all ${
                  reminder.completed
                    ? "border-slate-100 dark:border-slate-700 opacity-60"
                    : overdue
                    ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10"
                    : "border-slate-200 dark:border-slate-700 hover:shadow-sm"
                }`}>
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button onClick={() => handleToggle(reminder)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      reminder.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : overdue
                        ? "border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-violet-400"
                    }`}>
                    {reminder.completed && <HiCheck className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${reminder.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-white"}`}>
                        {reminder.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {reminder.priority && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[reminder.priority] || priorityColors.Low}`}>
                            {reminder.priority}
                          </span>
                        )}
                        <button onClick={() => setEditReminder(reminder)}
                          className="p-1 rounded text-slate-400 hover:text-blue-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(reminder)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors">
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {reminder.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{reminder.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {dueDate && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          overdue ? "text-red-500" : "text-slate-400"
                        }`}>
                          {overdue ? <HiExclamation className="w-3.5 h-3.5" /> : <HiClock className="w-3.5 h-3.5" />}
                          <span>{overdue ? "Overdue · " : ""}{dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      )}
                      {reminder.relatedTo && (
                        <span className="text-xs text-slate-400">re: {reminder.relatedTo}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ReminderModal
        isOpen={addModalOpen || !!editReminder}
        onClose={() => { setAddModalOpen(false); setEditReminder(null); }}
        onSave={handleSave}
        reminder={editReminder}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Reminder"
        message={`Delete reminder "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
