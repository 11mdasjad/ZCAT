'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, MapPin, Upload, Plus, X, 
  Loader2, Check, AlertCircle, GraduationCap, Calendar, 
  Globe, FileText, Phone, Clock, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { useAuthStore } from '@/lib/store/auth-store';

type ProfileUpdates = Partial<{
  name: string;
  avatarUrl: string;
  bio: string;
  phone: string;
  location: string;
  timezone: string;
  university: string;
  graduationYear: number | null;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
}>;

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  profile: {
    bio: string | null;
    phone: string | null;
    location: string | null;
    timezone: string | null;
  } | null;
  candidateProfile: {
    university: string | null;
    graduationYear: number | null;
    resumeUrl: string | null;
    skills: string[];
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
  } | null;
}

const PROFILE_STORAGE_KEY = 'zcat_profile_data';

function loadProfileFromStorage(): ProfileData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function saveProfileToStorage(profile: ProfileData) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

export default function ProfileView() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const didFetchProfileRef = useRef(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    const stored = loadProfileFromStorage();
    if (stored) {
      setProfile(stored);
      setUseLocalStorage(true);
    }

    try {
      const response = await fetch('/api/v1/profile', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data.data);
      saveProfileToStorage(data.data);
      setUseLocalStorage(false);
    } catch (error) {
      console.error('Profile API unavailable:', error);
      if (!stored) {
        const defaultProfile: ProfileData = {
          id: 'local', email: '', name: 'User', role: 'CANDIDATE', avatarUrl: null,
          profile: { bio: null, phone: null, location: null, timezone: null },
          candidateProfile: { university: null, graduationYear: null, resumeUrl: null, skills: [], githubUrl: null, linkedinUrl: null, portfolioUrl: null },
        };
        setProfile(defaultProfile);
        saveProfileToStorage(defaultProfile);
        setUseLocalStorage(true);
        toast('Using local profile — sign in to save online', { icon: '💾' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (updatedProfile?: ProfileData) => {
    const profileToSave = updatedProfile || profile;
    if (!profileToSave) return;

    setSaving(true);
    saveProfileToStorage(profileToSave);
    setProfile(profileToSave);

    try {
      const response = await fetch('/api/v1/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileToSave.name,
          bio: profileToSave.profile?.bio,
          phone: profileToSave.profile?.phone,
          location: profileToSave.profile?.location,
          timezone: profileToSave.profile?.timezone,
          university: profileToSave.candidateProfile?.university,
          graduationYear: profileToSave.candidateProfile?.graduationYear,
          skills: profileToSave.candidateProfile?.skills,
          githubUrl: profileToSave.candidateProfile?.githubUrl,
          linkedinUrl: profileToSave.candidateProfile?.linkedinUrl,
          portfolioUrl: profileToSave.candidateProfile?.portfolioUrl,
        }),
      });

      if (!response.ok) throw new Error('API save failed');

      const data = await response.json();
      setProfile(data.data);
      saveProfileToStorage(data.data);
      setLastSaved(new Date());
      setIsDirty(false);
      setUseLocalStorage(false);
      
      useAuthStore.getState().initialize();
      
      toast.success('Profile saved to server!', { duration: 2000 });
    } catch {
      setLastSaved(new Date());
      setIsDirty(false);
      setUseLocalStorage(true);
      toast.success('Saved locally', { icon: '💾', duration: 2000 });
    } finally {
      setSaving(false);
    }
  }, [profile]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  useEffect(() => {
    if (didFetchProfileRef.current) return;
    didFetchProfileRef.current = true;
    fetchProfile();
  }, [fetchProfile]);

  const handleFieldChange = (
    field: keyof ProfileUpdates,
    value: ProfileUpdates[keyof ProfileUpdates]
  ) => {
    if (!profile) return;

    setProfile((prev) => {
      if (!prev) return prev;
      
      if (field === 'name') {
        return typeof value === 'string' ? { ...prev, name: value } : prev;
      } else if (['bio', 'phone', 'location', 'timezone'].includes(field)) {
        return {
          ...prev,
          profile: {
            bio: prev.profile?.bio ?? null,
            phone: prev.profile?.phone ?? null,
            location: prev.profile?.location ?? null,
            timezone: prev.profile?.timezone ?? null,
            [field]: value,
          },
        };
      } else if (['university', 'graduationYear', 'githubUrl', 'linkedinUrl', 'portfolioUrl'].includes(field)) {
        return {
          ...prev,
          candidateProfile: prev.candidateProfile
            ? { ...prev.candidateProfile, [field]: value }
            : prev.candidateProfile,
        };
      }
      return prev;
    });

    markDirty();
  };

  const addSkill = () => {
    if (!profile?.candidateProfile || !newSkill.trim()) return;
    
    const skills = profile.candidateProfile.skills || [];
    if (skills.includes(newSkill.trim())) {
      toast.error('Skill already added');
      return;
    }

    const updatedSkills = [...skills, newSkill.trim()];
    setProfile({
      ...profile,
      candidateProfile: { ...profile.candidateProfile, skills: updatedSkills },
    });
    setNewSkill('');
    markDirty();
  };

  const removeSkill = (skillToRemove: string) => {
    if (!profile?.candidateProfile) return;
    
    const updatedSkills = profile.candidateProfile.skills.filter((s) => s !== skillToRemove);
    setProfile({
      ...profile,
      candidateProfile: { ...profile.candidateProfile, skills: updatedSkills },
    });
    markDirty();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      const avatarUrl = data.data.url;

      await fetch('/api/v1/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      });

      setProfile((prev) => prev ? { ...prev, avatarUrl } : prev);
      useAuthStore.getState().initialize();
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a PDF or DOC file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume size must be less than 5MB');
      return;
    }

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'resume');

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const data = await response.json();
      const resumeUrl = data.data.url;

      await fetch('/api/v1/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrl }),
      });

      setProfile((prev) => 
        prev && prev.candidateProfile
          ? { ...prev, candidateProfile: { ...prev.candidateProfile, resumeUrl } }
          : prev
      );
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return <ZCATLoader message="Loading your profile..." fullScreen />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl text-center max-w-sm w-full mx-4 border border-red-200 bg-red-50/50 shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-[#dc2626]" />
          </div>
          <h3 className="text-xl font-bold text-[#0f172a] mb-2">Profile Unavailable</h3>
          <p className="text-sm text-[#64748b] mb-8 leading-relaxed">
            We couldn&apos;t load your profile data. Please check your database connection or try again later.
          </p>
          <button 
            onClick={fetchProfile} 
            className="w-full flex justify-center items-center gap-2 py-3 bg-white hover:bg-slate-50 text-[#0f172a] font-bold rounded-xl border border-[#e2e8f0] hover:border-red-300 transition-all duration-300 shadow-xs cursor-pointer"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Profile</h1>
          <p className="text-sm font-medium text-[#64748b] mt-1">Manage your personal information and preferences.</p>
          {useLocalStorage && (
            <p className="text-xs text-[#d97706] font-semibold mt-1 flex items-center gap-1">💾 Offline mode — data saved locally</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {saving ? (
              <motion.div key="saving" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                <Loader2 className="w-3.5 h-3.5 text-[#d97706] animate-spin" />
                <span className="text-xs font-semibold text-[#d97706]">Saving...</span>
              </motion.div>
            ) : lastSaved ? (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-xs font-semibold text-[#059669]">Saved {lastSaved.toLocaleTimeString()}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <button
            onClick={() => saveProfile()}
            disabled={saving || !isDirty}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isDirty
                ? 'bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white hover:shadow-md cursor-pointer'
                : 'bg-slate-100 text-[#94a3b8] border border-[#e2e8f0] cursor-not-allowed'
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Avatar Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover border-2 border-[#e2e8f0]" 
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shadow-xs">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#cbd5e1] flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:border-[#2563eb] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]">{profile.name}</h3>
            <p className="text-sm text-[#64748b] font-medium">{profile.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2563eb] border border-blue-200 mt-1 capitalize">
              {profile.role.toLowerCase()}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#94a3b8] font-medium mt-4">
          Click the upload button to change your avatar. Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
        </p>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
        <h3 className="text-lg font-bold text-[#0f172a] mb-5">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-[#64748b] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="input-neon w-full !pl-10 text-sm font-medium"
                placeholder="Your full name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#64748b] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-neon w-full !pl-10 bg-slate-50 opacity-70 cursor-not-allowed text-sm font-medium"
              />
            </div>
            <p className="text-xs text-[#94a3b8] font-medium mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#64748b] mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="tel"
                value={profile.profile?.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="input-neon w-full !pl-10 text-sm font-medium"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#64748b] mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                value={profile.profile?.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="input-neon w-full !pl-10 text-sm font-medium"
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-bold text-[#64748b] mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={profile.profile?.bio || ''}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            className="input-neon w-full resize-none text-sm font-medium"
            placeholder="Tell us about yourself..."
          />
        </div>
      </motion.div>

      {/* Candidate-specific fields */}
      {profile.role === 'CANDIDATE' && profile.candidateProfile && (
        <>
          {/* Education & Career */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-5">Education & Career</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#64748b] mb-1.5">University / College</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="text"
                    value={profile.candidateProfile.university || ''}
                    onChange={(e) => handleFieldChange('university', e.target.value)}
                    className="input-neon w-full !pl-10 text-sm font-medium"
                    placeholder="MIT"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#64748b] mb-1.5">Graduation Year</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="number"
                    min="2000"
                    max="2035"
                    value={profile.candidateProfile.graduationYear || ''}
                    onChange={(e) => handleFieldChange('graduationYear', parseInt(e.target.value) || null)}
                    className="input-neon w-full !pl-10 text-sm font-medium"
                    placeholder="2025"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.candidateProfile.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-[#e2e8f0] text-xs font-bold text-[#0f172a] hover:border-[#2563eb] transition-colors">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-[#94a3b8] hover:text-[#dc2626] transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {profile.candidateProfile.skills.length === 0 && (
                <p className="text-sm text-[#94a3b8] font-medium">No skills added yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="input-neon flex-1 text-sm font-medium"
              />
              <button onClick={addSkill} className="btn-neon btn-neon-secondary !py-2 !px-4 flex items-center gap-1 text-sm font-bold cursor-pointer">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-5">Social Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#64748b] mb-1.5">GitHub</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="url"
                    value={profile.candidateProfile.githubUrl || ''}
                    onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                    className="input-neon w-full !pl-10 text-sm font-medium"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#64748b] mb-1.5">LinkedIn</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="url"
                    value={profile.candidateProfile.linkedinUrl || ''}
                    onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                    className="input-neon w-full !pl-10 text-sm font-medium"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#64748b] mb-1.5">Portfolio</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="url"
                    value={profile.candidateProfile.portfolioUrl || ''}
                    onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                    className="input-neon w-full !pl-10 text-sm font-medium"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resume */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
            <h3 className="text-lg font-bold text-[#0f172a] mb-4">Resume</h3>
            
            {profile.candidateProfile.resumeUrl ? (
              <div className="border border-[#e2e8f0] rounded-xl p-4 mb-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0f172a]">Resume uploaded</p>
                      <p className="text-xs text-[#64748b] font-medium">Click to view or replace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={profile.candidateProfile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-xs font-bold text-[#0f172a] hover:border-[#2563eb] transition-all shadow-xs"
                    >
                      View
                    </a>
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-xs font-bold text-[#0f172a] hover:border-[#2563eb] transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                    >
                      {uploadingResume ? 'Uploading...' : 'Replace'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => resumeInputRef.current?.click()}
                className="border-2 border-dashed border-[#cbd5e1] rounded-xl p-8 text-center hover:border-[#2563eb] transition-colors cursor-pointer bg-slate-50/50"
              >
                {uploadingResume ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#2563eb] mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-[#64748b] font-medium">Uploading resume...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#94a3b8] mx-auto mb-3" />
                    <p className="text-sm text-[#64748b] font-medium">
                      Drag & drop your resume or <span className="text-[#2563eb] font-bold">browse files</span>
                    </p>
                    <p className="text-xs text-[#94a3b8] font-medium mt-1">PDF, DOC, DOCX up to 5MB</p>
                  </>
                )}
              </div>
            )}
            
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </motion.div>
        </>
      )}

      {/* Save Button (Bottom) */}
      {isDirty && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4 z-10">
          <div className="glass-strong rounded-xl p-4 flex items-center justify-between border border-[#2563eb]/40 bg-white/95 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d97706] animate-pulse" />
              <span className="text-sm font-bold text-[#0f172a]">You have unsaved changes</span>
            </div>
            <button
              onClick={() => saveProfile()}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white text-sm font-bold hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-xl p-4 border-l-4 border-[#2563eb] border border-[#e2e8f0] bg-white shadow-xs">
        <div className="flex items-start gap-3">
          <Save className="w-5 h-5 text-[#2563eb] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-[#0f172a] mb-1">Click Save to persist changes</h4>
            <p className="text-xs text-[#64748b] font-medium">
              Edit your profile fields and click the Save button to persist your changes. Data is saved to the server when connected, or locally when offline.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
