'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FileText, Clock, Users, PlusCircle, CalendarDays, Code2, Brain, Filter, Search, Shield, PlayCircle, Trash2, Eye } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

export default function TestManagementPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadAssessments() {
      try {
        const res = await fetch('/api/v1/assessments');
        const resData = await res.json();
        if (res.ok && resData.success) {
          setAssessments(resData.data);
        }
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssessments();
  }, []);

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This will immediately remove it from all candidate dashboards.')) return;
    try {
      const res = await fetch(`/api/v1/assessments/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Assessment deleted successfully');
        setAssessments((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(data.error?.message || 'Failed to delete assessment');
      }
    } catch (err) {
      console.error('Failed to delete assessment:', err);
      toast.error('An error occurred while deleting the assessment');
    }
  };

  const stats = [
    { label: 'Total Assessments', value: assessments.length.toString(), icon: CalendarDays, color: '#3b82f6' },
    { label: 'Active Live Tests', value: assessments.filter(a => a.status === 'LIVE' || a.status === 'Live').length.toString(), icon: PlayCircle, color: '#10b981' },
    { label: 'Submissions Today', value: '18', icon: Users, color: '#f59e0b' },
    { label: 'Proctoring Flags', value: '0', icon: Shield, color: '#ef4444' },
  ];

  if (isLoading) {
    return <ZCATLoader message="Loading Test Management..." fullScreen />;
  }

  const filteredTests = assessments.filter(test => {
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Coding' && test.type === 'CODING') ||
      (activeTab === 'MCQ' && test.type === 'APTITUDE') ||
      (activeTab === 'Mixed' && test.type === 'MIXED');
      
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Test Management</h1>
          <p className="text-sm text-[#8b949e]">Schedule and monitor examinations across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/assessments/create" className="btn-neon btn-neon-primary py-2 px-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Create Assessment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 rounded-xl flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[#8b949e] font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="glass-strong rounded-xl border border-[#21262d] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#21262d] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161b22]/50">
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d] self-start md:self-auto">
            {['All', 'Coding', 'MCQ', 'Mixed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-[#21262d] text-white shadow-sm'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#e4e8f1] placeholder:text-[#8b949e] focus:border-[#00d4ff]/50 outline-none transition-colors"
              />
            </div>
            <button className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Filter">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] text-xs uppercase text-[#8b949e] bg-[#0d1117]/80">
                <th className="px-6 py-4 font-semibold">Test Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created Date</th>
                <th className="px-6 py-4 font-semibold">Visibility</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              <AnimatePresence>
                {filteredTests.map((test, index) => (
                  <motion.tr
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{test.title}</div>
                      <div className="text-xs text-[#8b949e] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {test.duration} mins
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-[#c9d1d9]">
                        {test.type === 'CODING' && <Code2 className="w-4 h-4 text-[#00d4ff]" />}
                        {test.type === 'APTITUDE' && <FileText className="w-4 h-4 text-[#10b981]" />}
                        {test.type === 'MIXED' && <Brain className="w-4 h-4 text-[#7c3aed]" />}
                        {test.type === 'CODING' ? 'Coding' : test.type === 'APTITUDE' ? 'MCQ' : 'Mixed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        test.status === 'LIVE' || test.status === 'Live' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                        test.status === 'SCHEDULED' || test.status === 'Scheduled' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20' :
                        test.status === 'DRAFT' || test.status === 'Draft' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                        'bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/20'
                      }`}>
                        {(test.status === 'LIVE' || test.status === 'Live') && <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5 animate-pulse" />}
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#c9d1d9]">
                      {new Date(test.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#8b949e]">{test.isPublic ? 'Public' : 'Private'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/leaderboards`} className="p-1.5 text-[#8b949e] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded transition-colors" title="Monitor Leaderboard">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDeleteAssessment(test.id)} className="p-1.5 text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors" title="Delete Assessment">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredTests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#8b949e]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Search className="w-8 h-8 text-[#484f58]" />
                        <p>No assessments found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
