'use client';

import { motion } from 'framer-motion';
import { Save, Bell, Shield, Palette, Globe, Database } from 'lucide-react';

type SettingItem =
  | { label: string; type: 'input'; value: string }
  | { label: string; type: 'select'; options: string[] }
  | { label: string; type: 'toggle'; checked: boolean };

const settingSections: { icon: typeof Globe; title: string; color: string; settings: SettingItem[] }[] = [
  {
    icon: Globe, title: 'General', color: '#00d4ff',
    settings: [
      { label: 'Platform Name', type: 'input', value: 'ZCAT' },
      { label: 'Support Email', type: 'input', value: 'support@zcat.dev' },
      { label: 'Default Language', type: 'select', options: ['English', 'Hindi', 'Spanish'] },
    ],
  },
  {
    icon: Bell, title: 'Notifications', color: '#a855f7',
    settings: [
      { label: 'Email Notifications', type: 'toggle', checked: true },
      { label: 'Violation Alerts', type: 'toggle', checked: true },
      { label: 'Weekly Reports', type: 'toggle', checked: false },
      { label: 'New Registration Alerts', type: 'toggle', checked: true },
    ],
  },
  {
    icon: Shield, title: 'Security', color: '#10b981',
    settings: [
      { label: 'Two-Factor Authentication', type: 'toggle', checked: true },
      { label: 'Session Timeout (minutes)', type: 'input', value: '60' },
      { label: 'Max Login Attempts', type: 'input', value: '5' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#8b949e] mt-1">Configure platform settings and preferences.</p>
      </div>

      {settingSections.map(({ icon: Icon, title, color, settings }, si) => (
        <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}
          className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.label} className="flex items-center justify-between">
                <label className="text-sm text-[#8b949e]">{setting.label}</label>
                {setting.type === 'input' && (
                  <input type="text" defaultValue={setting.value} className="input-neon w-48 text-sm !py-2" />
                )}
                {setting.type === 'select' && (
                  <select className="input-neon w-48 text-sm !py-2">
                    {setting.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                )}
                {setting.type === 'toggle' && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={setting.checked} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#21262d] peer-checked:bg-[#0066ff] rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-full" />
                  </label>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <button className="btn-neon btn-neon-primary flex items-center gap-2">
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  );
}
