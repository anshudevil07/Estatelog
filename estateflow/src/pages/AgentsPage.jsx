import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiMail, HiPhone, HiStar, HiLocationMarker,
  HiBriefcase, HiPlus, HiTrash, HiShieldCheck,
  HiUserCircle, HiDotsVertical, HiPencil, HiBan,
} from "react-icons/hi";
import { userService } from "../firebase/firestoreService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createNotification, NOTIF_TYPES } from "../firebase/notificationService";
import { formatCurrency, getInitials, getRoleColor } from "../utils/formatters";
import SearchBar from "../components/common/SearchBar";
import { AgentCardSkeleton } from "../components/common/SkeletonLoader";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import { ConfirmModal } from "../components/common/Modal";

export default function AgentsPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Confirm modal state
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    try {
      const data = await userService.getAll();
      // Sort: admins first, then managers, then agents
      const order = { admin: 0, manager: 1, agent: 2 };
      data.sort((a, b) => (order[a.role] ?? 3) - (order[b.role] ?? 3));
      setMembers(data);
    } catch (err) {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }

  // Filter by search + role
  const filtered = members.filter((m) => {
    const matchSearch = !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Deactivate (soft remove) — keeps the account but marks inactive
  async function handleDeactivate() {
    if (!removeTarget) return;
    setRemoveLoading(true);
    try {
      await userService.deactivate(removeTarget.id);
      createNotification({
        type: NOTIF_TYPES.LEAD_UPDATED,
        message: `Team member "${removeTarget.name}" was deactivated by ${currentUser.name}`,
        triggeredBy: currentUser.name,
      });
      toast.success(`${removeTarget.name} has been deactivated`);
      setRemoveTarget(null);
      loadMembers();
    } catch {
      toast.error("Failed to deactivate member");
    } finally {
      setRemoveLoading(false);
    }
  }

  // Change role
  async function handleRoleChange(member, newRole) {
    if (member.id === currentUser.uid) {
      toast.error("You cannot change your own role");
      return;
    }
    try {
      await userService.update(member.id, { role: newRole });
      toast.success(`${member.name}'s role changed to ${newRole}`);
      createNotification({
        type: NOTIF_TYPES.LEAD_UPDATED,
        message: `${member.name}'s role was changed to ${newRole} by ${currentUser.name}`,
        triggeredBy: currentUser.name,
      });
      loadMembers();
    } catch {
      toast.error("Failed to update role");
    }
  }

  // Reactivate a deactivated member
  async function handleReactivate(member) {
    try {
      await userService.update(member.id, { active: true });
      toast.success(`${member.name} has been reactivated`);
      loadMembers();
    } catch {
      toast.error("Failed to reactivate member");
    }
  }

  const counts = {
    all: members.length,
    admin: members.filter((m) => m.role === "admin").length,
    manager: members.filter((m) => m.role === "manager").length,
    agent: members.filter((m) => m.role === "agent").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {members.length} members in your organisation
          </p>
        </div>
        {isAdmin && (
          <Button
            icon={<HiPlus className="w-4 h-4" />}
            onClick={() => navigate("/admin/agents/add")}
          >
            Add Member
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
          className="flex-1"
        />
        {/* Role filter tabs */}
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
          {["all", "admin", "manager", "agent"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
                roleFilter === r
                  ? "bg-violet-600 text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {r === "all" ? "All" : r} ({counts[r]})
            </button>
          ))}
        </div>
      </div>

      {/* Team summary stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Members", value: counts.all, color: "text-slate-900 dark:text-white" },
            { label: "Admins", value: counts.admin, color: "text-red-600 dark:text-red-400" },
            { label: "Managers", value: counts.manager, color: "text-violet-600 dark:text-violet-400" },
            { label: "Agents", value: counts.agent, color: "text-blue-600 dark:text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Member cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <AgentCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No members found"
          description="Try a different search or filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              isSelf={member.id === currentUser?.uid}
              onRemove={() => setRemoveTarget(member)}
              onRoleChange={handleRoleChange}
              onReactivate={() => handleReactivate(member)}
            />
          ))}
        </div>
      )}

      {/* Confirm deactivate modal */}
      <ConfirmModal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleDeactivate}
        loading={removeLoading}
        title="Deactivate Member"
        message={`Are you sure you want to deactivate "${removeTarget?.name}"? They will lose access to the dashboard. You can reactivate them later.`}
      />
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ member, isAdmin, isSelf, onRemove, onRoleChange, onReactivate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isInactive = member.active === false;

  const roleIconMap = {
    admin: <HiShieldCheck className="w-3.5 h-3.5" />,
    manager: <HiBriefcase className="w-3.5 h-3.5" />,
    agent: <HiUserCircle className="w-3.5 h-3.5" />,
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border transition-shadow hover:shadow-lg relative ${
      isInactive
        ? "border-slate-200 dark:border-slate-700 opacity-60"
        : "border-slate-200 dark:border-slate-700"
    }`}>
      {/* Inactive badge */}
      {isInactive && (
        <div className="absolute top-3 left-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <HiBan className="w-3 h-3" /> Deactivated
        </div>
      )}

      {/* Admin action menu — top right */}
      {isAdmin && !isSelf && (
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Actions"
          >
            <HiDotsVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Change Role
                </p>
                {["admin", "manager", "agent"].map((r) => (
                  <button
                    key={r}
                    onClick={() => { onRoleChange(member, r); setMenuOpen(false); }}
                    disabled={member.role === r}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      member.role === r
                        ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {roleIconMap[r]}
                    <span className="capitalize">{r}</span>
                    {member.role === r && (
                      <span className="ml-auto text-xs text-slate-400">current</span>
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-100 dark:border-slate-800">
                  {isInactive ? (
                    <button
                      onClick={() => { onReactivate(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <HiUserCircle className="w-4 h-4" />
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => { onRemove(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* "You" badge for self */}
      {isSelf && (
        <div className="absolute top-3 right-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          You
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-700">
              <span className="text-white text-xl font-bold">{getInitials(member.name)}</span>
            </div>
          )}
          {/* Active/inactive dot */}
          <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
            isInactive ? "bg-slate-400" : "bg-emerald-500"
          }`} />
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-full px-2">{member.email}</p>

        {/* Role badge */}
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 ${getRoleColor(member.role)}`}>
          {roleIconMap[member.role]}
          <span className="capitalize">{member.role}</span>
        </span>
      </div>

      {/* Phone */}
      {member.phone && (
        <p className="text-xs text-slate-400 text-center mb-4">{member.phone}</p>
      )}

      {/* Contact buttons */}
      <div className="flex gap-2">
        <a
          href={`mailto:${member.email}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <HiMail className="w-3.5 h-3.5" /> Email
        </a>
        {member.phone && (
          <a
            href={`tel:${member.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <HiPhone className="w-3.5 h-3.5" /> Call
          </a>
        )}
      </div>
    </div>
  );
}
