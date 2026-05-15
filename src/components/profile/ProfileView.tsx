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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didFetchProfileRef = useRef(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    // Step 1: Always load from localStorage FIRST for instant display
    const stored = loadProfileFromStorage();
    if (stored) {
      setProfile(stored);
      setUseLocalStorage(true);
    }

    // Step 2: Try to fetch from API (may fail if not authenticated)
    try {
      const response = await fetch('/api/v1/profile', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      // API succeeded — use server data (source of truth)
      setProfile(data.data);
      saveProfileToStorage(data.data); // keep localStorage in sync
      setUseLocalStorage(false);
    } catch (error) {
      console.error('Profile API unavailable:', error);
      // If we already loaded from localStorage, keep that data
      if (stored) {
        // Already set above, no toast spam on revisit
      } else {
        // No localStorage and no API — create a default
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

  // Save profile — always saves to localStorage, tries API
  const saveProfile = useCallback(async (updatedProfile?: ProfileData) => {
    const profileToSave = updatedProfile || profile;
    if (!profileToSave) return;

    setSaving(true);

    // Step 1: ALWAYS save to localStorage immediately (guaranteed persistence)
    saveProfileToStorage(profileToSave);
    setProfile(profileToSave);

    // Step 2: Try to save to API
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
      toast.success('Profile saved to server!', { duration: 2000 });
    } catch {
      // API failed — localStorage already saved above
      setLastSaved(new Date());
      setIsDirty(false);
      setUseLocalStorage(true);
      toast.success('Saved locally', { icon: '💾', duration: 2000 });
    } finally {
      setSaving(false);
    }
  }, [profile]);

  // Marks that there are unsaved changes
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  // Fetch profile data
  useEffect(() => {
    if (didFetchProfileRef.current) return;
    didFetchProfileRef.current = true;
    fetchProfile();
  }, [fetchProfile]);

  // Handle field changes
  const handleFieldChange = (
    field: keyof ProfileUpdates,
    value: ProfileUpdates[keyof ProfileUpdates]
  ) => {
    if (!profile) return;

    // Update local state immediately
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

    // Mark as dirty (user needs to click Save)
    markDirty();
  };

  // Handle skills
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

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
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

      // Update profile with new avatar URL
      await fetch('/api/v1/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      });

      setProfile((prev) => prev ? { ...prev, avatarUrl } : prev);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a PDF or DOC file');
      return;
    }

    // Validate file size (5MB)
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

      // Update profile with new resume URL
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
          className="glass-card p-8 rounded-2xl text-center max-w-sm w-full mx-4 border border-[#ef4444]/20 bg-[#ef4444]/[0.02]"
        >
          <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-8 h-8 text-[#ef4444]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Profile Unavailable</h3>
          <p className="text-sm text-[#8b949e] mb-8 leading-relaxed">
            We couldn&apos;t load your profile data. Please check your database connection or try again later.
          </p>
          <button 
            onClick={fetchProfile} 
            className="w-full flex justify-center items-center gap-2 py-3 bg-[#161b22] hover:bg-[#21262d] text-white rounded-xl border border-[#21262d] hover:border-[#ef4444]/50 transition-all duration-300"
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
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-[#8b949e] mt-1">Manage your personal information and preferences.</p>
          {useLocalStorage && (
            <p className="text-xs text-[#f59e0b] mt-1 flex items-center gap-1">💾 Offline mode — data saved locally</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {saving ? (
              <motion.div key="saving" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                <Loader2 className="w-3.5 h-3.5 text-[#f59e0b] animate-spin" />
                <span className="text-xs text-[#f59e0b]">Saving...</span>
              </motion.div>
            ) : lastSaved ? (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-xs text-[#10b981]">Saved {lastSaved.toLocaleTimeString()}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <button
            onClick={() => saveProfile()}
            disabled={saving || !isDirty}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isDirty
                ? 'bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] cursor-pointer'
                : 'bg-[#161b22] text-[#484f58] border border-[#21262d] cursor-not-allowed'
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Avatar Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover border-2 border-[#21262d]" 
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#161b22] border border-[#21262d] flex items-center justify-center text-[#8b949e] hover:text-white hover:border-[#00d4ff] transition-all disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
            <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
            <p className="text-sm text-[#8b949e]">{profile.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 mt-1 capitalize">
              {profile.role.toLowerCase()}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#484f58] mt-4">
          Click the upload button to change your avatar. Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
        </p>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-5">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="input-neon w-full !pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-neon w-full !pl-10 opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-[#484f58] mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                type="tel"
                value={profile.profile?.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="input-neon w-full !pl-10"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                type="text"
                value={profile.profile?.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="input-neon w-full !pl-10"
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={profile.profile?.bio || ''}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            className="input-neon w-full resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </motion.div>

      {/* Candidate-specific fields */}
      {profile.role === 'CANDIDATE' && profile.candidateProfile && (
        <>
          {/* Education & Career */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Education & Career</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">University / College</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input
                    type="text"
                    value={profile.candidateProfile.university || ''}
                    onChange={(e) => handleFieldChange('university', e.target.value)}
                    className="input-neon w-full !pl-10"
                    placeholder="MIT"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Graduation Year</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input
                    type="number"
                    min="2000"
                    max="2035"
                    value={profile.candidateProfile.graduationYear || ''}
                    onChange={(e) => handleFieldChange('graduationYear', parseInt(e.target.value) || null)}
                    className="input-neon w-full !pl-10"
                    placeholder="2025"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.candidateProfile.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-sm text-[#8b949e] hover:border-[#00d4ff]/30 transition-colors">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-[#484f58] hover:text-[#ef4444] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {profile.candidateProfile.skills.length === 0 && (
                <p className="text-sm text-[#484f58]">No skills added yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="input-neon flex-1"
              />
              <button onClick={addSkill} className="btn-neon btn-neon-secondary !py-2 !px-4 flex items-center gap-1 text-sm">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Social Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">GitHub</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input
                    type="url"
                    value={profile.candidateProfile.githubUrl || ''}
                    onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                    className="input-neon w-full !pl-10"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">LinkedIn</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input
                    type="url"
                    value={profile.candidateProfile.linkedinUrl || ''}
                    onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                    className="input-neon w-full !pl-10"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Portfolio</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input
                    type="url"
                    value={profile.candidateProfile.portfolioUrl || ''}
                    onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                    className="input-neon w-full !pl-10"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resume */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Resume</h3>
            
            {profile.candidateProfile.resumeUrl ? (
              <div className="border border-[#21262d] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Resume uploaded</p>
                      <p className="text-xs text-[#8b949e]">Click to view or replace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={profile.candidateProfile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-xs text-[#8b949e] hover:text-white hover:border-[#00d4ff]/30 transition-all"
                    >
                      View
                    </a>
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-xs text-[#8b949e] hover:text-white hover:border-[#00d4ff]/30 transition-all disabled:opacity-50"
                    >
                      {uploadingResume ? 'Uploading...' : 'Replace'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => resumeInputRef.current?.click()}
                className="border-2 border-dashed border-[#21262d] rounded-xl p-8 text-center hover:border-[#00d4ff]/30 transition-colors cursor-pointer"
              >
                {uploadingResume ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#00d4ff] mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-[#8b949e]">Uploading resume...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#484f58] mx-auto mb-3" />
                    <p className="text-sm text-[#8b949e]">
                      Drag & drop your resume or <span className="text-[#00d4ff]">browse files</span>
                    </p>
                    <p className="text-xs text-[#484f58] mt-1">PDF, DOC, DOCX up to 5MB</p>
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
          <div className="glass-strong rounded-xl p-4 flex items-center justify-between border border-[#0066ff]/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
              <span className="text-sm text-[#8b949e]">You have unsaved changes</span>
            </div>
            <button
              onClick={() => saveProfile()}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-xl p-4 border-l-4 border-[#00d4ff]">
        <div className="flex items-start gap-3">
          <Save className="w-5 h-5 text-[#00d4ff] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Click Save to persist changes</h4>
            <p className="text-xs text-[#8b949e]">
              Edit your profile fields and click the Save button to persist your changes. Data is saved to the server when connected, or locally when offline.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
