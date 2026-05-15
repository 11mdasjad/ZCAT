'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Users, Eye, Mail, MapPin, GraduationCap,
  Calendar, Globe, FileText, Phone, ExternalLink, Download,
  X, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, Inbox,
  Shield, Code2, Briefcase, Clock,
} from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  candidateProfile?: {
    university: string | null;
    graduationYear: number | null;
    resumeUrl: string | null;
    skills: string[];
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
  } | null;
  recruiterProfile?: {
    companyName: string | null;
    jobTitle: string | null;
    verified: boolean;
  } | null;
  profile?: {
    bio: string | null;
    phone: string | null;
    location: string | null;
    timezone: string | null;
  } | null;
}

export default function CandidatesPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const limit = 15;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const response = await fetch(`/api/v1/admin/users?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchUserDetail = async (userId: string) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch user detail');

      const data = await response.json();
      setSelectedUser(data.data);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      // Use the already loaded basic data
      const basicUser = users.find(u => u.id === userId);
      if (basicUser) setSelectedUser(basicUser);
      toast.error('Could not load full details');
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const roleColor = (role: string) => {
    switch (role) {
      case 'CANDIDATE': return 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20';
      case 'RECRUITER': return 'bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20';
      case 'ADMIN': return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
      case 'SUPER_ADMIN': return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20';
      default: return 'bg-[#484f58]/10 text-[#8b949e] border-[#484f58]/20';
    }
  };

  if (loading && users.length === 0) {
    return <ZCATLoader message="Loading users..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-[#8b949e] mt-1">
            {total > 0 ? `${total} total users registered` : 'View and manage all registered users.'}
          </p>
        </div>
        <button onClick={fetchUsers} className="btn-neon btn-neon-secondary !py-2 !px-4 text-sm flex items-center gap-2 self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="input-neon w-full !pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-neon !w-auto min-w-[140px]"
        >
          <option value="">All Roles</option>
          <option value="CANDIDATE">Candidate</option>
          <option value="RECRUITER">Recruiter</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase hidden md:table-cell">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase hidden lg:table-cell">Details</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase hidden sm:table-cell">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#21262d]/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.name?.charAt(0).toUpperCase() || '?'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user.name || 'Unknown'}</p>
                          <p className="text-xs text-[#484f58] truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <div className="text-xs text-[#8b949e]">
                        {user.candidateProfile?.university && (
                          <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {user.candidateProfile.university}</span>
                        )}
                        {user.recruiterProfile?.companyName && (
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {user.recruiterProfile.companyName}</span>
                        )}
                        {user.candidateProfile?.skills && user.candidateProfile.skills.length > 0 && (
                          <span className="mt-0.5 block truncate max-w-[200px]">
                            {user.candidateProfile.skills.slice(0, 3).join(', ')}{user.candidateProfile.skills.length > 3 ? '...' : ''}
                          </span>
                        )}
                        {!user.candidateProfile?.university && !user.recruiterProfile?.companyName && (
                          <span className="text-[#484f58]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b949e] hidden sm:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      {user.isActive ? (
                        <span className="text-xs text-[#10b981] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Active
                        </span>
                      ) : (
                        <span className="text-xs text-[#ef4444] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => fetchUserDetail(user.id)}
                        className="p-2 rounded-lg text-[#8b949e] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 text-[#8b949e]">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                      </div>
                    ) : (
                      <div>
                        <Inbox className="w-10 h-10 text-[#484f58] mx-auto mb-3" />
                        <p className="text-sm text-[#8b949e]">
                          {search || roleFilter ? 'No users match your filters' : 'No users registered yet'}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#21262d]">
            <span className="text-xs text-[#484f58]">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-[#8b949e]">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              {detailLoading ? (
                <div className="p-12 text-center">
                  <ZCATLoader message="Loading user details..." />
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-start justify-between p-6 border-b border-[#21262d]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                        {selectedUser.avatarUrl ? (
                          <img src={selectedUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          selectedUser.name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{selectedUser.name}</h2>
                        <p className="text-sm text-[#8b949e]">{selectedUser.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColor(selectedUser.role)}`}>
                            {selectedUser.role}
                          </span>
                          <span className={`text-xs ${selectedUser.isActive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                            {selectedUser.isActive ? '● Active' : '● Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)}
                      className="p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6">
                    {/* Account Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#00d4ff]" /> Account Info
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem icon={Calendar} label="Joined" value={new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                        <InfoItem icon={Clock} label="Last Login" value={selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'} />
                        <InfoItem icon={Mail} label="Email Verified" value={selectedUser.emailVerified ? '✓ Yes' : '✗ No'} />
                        <InfoItem icon={Users} label="User ID" value={selectedUser.id.substring(0, 12) + '...'} />
                      </div>
                      {/* Role Change */}
                      <div className="mt-4 bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#f59e0b]" />
                            <span className="text-sm text-white font-medium">Change Role</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue={selectedUser.role}
                              id="role-select"
                              className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#8b949e] outline-none focus:border-[#00d4ff]/50"
                            >
                              <option value="CANDIDATE">Candidate</option>
                              <option value="RECRUITER">Recruiter</option>
                              <option value="ADMIN">Admin</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                            <button
                              onClick={async () => {
                                const sel = (document.getElementById('role-select') as HTMLSelectElement)?.value;
                                if (!sel || sel === selectedUser.role) return;
                                try {
                                  const res = await fetch('/api/v1/admin/promote', {
                                    method: 'POST', credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: selectedUser.id, role: sel }),
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    toast.success(`Role changed to ${sel}`);
                                    setSelectedUser({ ...selectedUser, role: sel });
                                    fetchUsers();
                                  } else {
                                    toast.error(data.error?.message || 'Failed to change role');
                                  }
                                } catch { toast.error('Network error'); }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs hover:bg-[#00d4ff]/20 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    {selectedUser.profile && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#a855f7]" /> Profile
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedUser.profile.bio && (
                            <div className="col-span-2">
                              <InfoItem icon={FileText} label="Bio" value={selectedUser.profile.bio} />
                            </div>
                          )}
                          <InfoItem icon={Phone} label="Phone" value={selectedUser.profile.phone || '—'} />
                          <InfoItem icon={MapPin} label="Location" value={selectedUser.profile.location || '—'} />
                          <InfoItem icon={Globe} label="Timezone" value={selectedUser.profile.timezone || '—'} />
                        </div>
                      </div>
                    )}

                    {/* Candidate Profile */}
                    {selectedUser.candidateProfile && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-[#10b981]" /> Candidate Profile
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem icon={GraduationCap} label="University" value={selectedUser.candidateProfile.university || '—'} />
                          <InfoItem icon={Calendar} label="Graduation" value={selectedUser.candidateProfile.graduationYear?.toString() || '—'} />

                          {/* Resume */}
                          <div className="col-span-2">
                            <div className="bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#f59e0b]" />
                                  <span className="text-sm text-white font-medium">Resume</span>
                                </div>
                                {selectedUser.candidateProfile.resumeUrl ? (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={selectedUser.candidateProfile.resumeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs hover:bg-[#00d4ff]/20 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" /> View
                                    </a>
                                    <a
                                      href={selectedUser.candidateProfile.resumeUrl}
                                      download
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs hover:bg-[#10b981]/20 transition-colors"
                                    >
                                      <Download className="w-3 h-3" /> Download
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#484f58]">No resume uploaded</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          {selectedUser.candidateProfile.skills.length > 0 && (
                            <div className="col-span-2">
                              <p className="text-xs text-[#484f58] mb-2">Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedUser.candidateProfile.skills.map((skill) => (
                                  <span key={skill} className="text-xs px-2 py-1 rounded-lg bg-[#161b22] border border-[#21262d] text-[#8b949e]">{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Links */}
                          <div className="col-span-2 flex flex-wrap gap-3">
                            {selectedUser.candidateProfile.githubUrl && (
                              <ExternalLinkButton href={selectedUser.candidateProfile.githubUrl} label="GitHub" />
                            )}
                            {selectedUser.candidateProfile.linkedinUrl && (
                              <ExternalLinkButton href={selectedUser.candidateProfile.linkedinUrl} label="LinkedIn" />
                            )}
                            {selectedUser.candidateProfile.portfolioUrl && (
                              <ExternalLinkButton href={selectedUser.candidateProfile.portfolioUrl} label="Portfolio" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recruiter Profile */}
                    {selectedUser.recruiterProfile && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#f59e0b]" /> Recruiter Profile
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem icon={Briefcase} label="Company" value={selectedUser.recruiterProfile.companyName || '—'} />
                          <InfoItem icon={Users} label="Job Title" value={selectedUser.recruiterProfile.jobTitle || '—'} />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Helper components ────────────────────────── */

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-[#161b22]/50 rounded-lg p-3 border border-[#21262d]/50">
      <div className="flex items-center gap-1.5 text-[#484f58] mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm text-white truncate">{value}</p>
    </div>
  );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-xs text-[#8b949e] hover:text-[#00d4ff] hover:border-[#00d4ff]/20 transition-all"
    >
      <ExternalLink className="w-3 h-3" /> {label}
    </a>
  );
}
