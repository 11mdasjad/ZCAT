'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, MapPin, Upload, Save, Plus, X } from 'lucide-react';

export default function ProfilePage() {
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Python', 'Node.js', 'MongoDB']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-[#8b949e] mt-1">Manage your personal information and preferences.</p>
      </div>

      {/* Avatar Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#161b22] border border-[#21262d] flex items-center justify-center text-[#8b949e] hover:text-white transition-colors">
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Asjad Ahmed</h3>
            <p className="text-sm text-[#8b949e]">asjad@zcat.dev</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 mt-1">Candidate</span>
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-5">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input type="text" defaultValue="Asjad Ahmed" className="input-neon w-full !pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input type="email" defaultValue="asjad@zcat.dev" className="input-neon w-full !pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">College / Company</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input type="text" defaultValue="IIT Delhi" className="input-neon w-full !pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input type="text" defaultValue="Bangalore, India" className="input-neon w-full !pl-10" />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Bio</label>
          <textarea rows={3} defaultValue="Full-stack developer passionate about building scalable applications." className="input-neon w-full resize-none" />
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-sm text-[#8b949e]">
              {skill}
              <button onClick={() => setSkills(skills.filter((s) => s !== skill))} className="text-[#484f58] hover:text-[#ef4444] transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} placeholder="Add a skill..." className="input-neon flex-1" />
          <button onClick={addSkill} className="btn-neon btn-neon-secondary !py-2 !px-4 flex items-center gap-1 text-sm">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </motion.div>

      {/* Resume */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Resume</h3>
        <div className="border-2 border-dashed border-[#21262d] rounded-xl p-8 text-center hover:border-[#00d4ff]/30 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-[#484f58] mx-auto mb-3" />
          <p className="text-sm text-[#8b949e]">Drag & drop your resume or <span className="text-[#00d4ff]">browse files</span></p>
          <p className="text-xs text-[#484f58] mt-1">PDF, DOC up to 5MB</p>
        </div>
      </motion.div>

      <button className="btn-neon btn-neon-primary flex items-center gap-2">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );
}
