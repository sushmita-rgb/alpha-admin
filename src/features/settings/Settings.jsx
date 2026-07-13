import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { useThemeStore } from '../../store/themeStore';
import { useUiStore } from '../../store/uiStore';
import { 
  User, 
  Moon, 
  Sun, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight,
  Database,
  Bell,
  Sliders,
  Download,
  Check
} from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const { pollingEnabled, togglePolling, resetColumnPrefs } = useProductStore();
  const { theme, toggleTheme } = useThemeStore();
  const { addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('profile');

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifySystemStatus, setNotifySystemStatus] = useState(false);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(true);

  const [tableDensity, setTableDensity] = useState('comfortable');

  const [csvDelimiter, setCsvDelimiter] = useState('comma');
  const [csvAutodownload, setCsvAutodownload] = useState(true);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('File size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result });
        addToast('Profile avatar updated', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({ name: profileName, email: profileEmail });
    addToast('Profile settings saved', 'success');
  };

  const handleResetApp = () => {
    localStorage.removeItem('alpha_hidden_product_ids');
    localStorage.removeItem('alpha_column_order');
    localStorage.removeItem('alpha_column_visibility');
    addToast('All preferences reset', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'theme', label: 'Theme & System', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'table', label: 'Table Preferences', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'export', label: 'Export Preferences', icon: <Download className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 pb-10 font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-notion-text dark:text-notion-dark-text">
          Settings
        </h1>
        <p className="text-xs text-notion-muted dark:text-notion-dark-muted mt-1">
          Adjust profile details, table densities, export strategies, and theme preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TAB NAVIGATION */}
        <nav className="lg:col-span-3 space-y-0.5 bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-1.5 rounded-xl shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-notion-selected dark:bg-notion-dark-selected text-notion-accent dark:text-notion-dark-accent'
                  : 'text-notion-muted dark:text-notion-dark-muted hover:bg-notion-hover dark:hover:bg-notion-dark-hover'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* CONFIG PANELS */}
        <div className="lg:col-span-9 bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-6 rounded-xl shadow-sm">
          
          {/* PROFILE PANEL */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-notion-text dark:text-white uppercase tracking-wider">Profile Information</h3>
                <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted">View and modify your business account details</span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 border-b border-notion-border dark:border-notion-dark-border/60 pb-4">
                  <img src={user?.avatar} alt={user?.name} className="w-12 h-12 rounded object-cover border border-notion-border dark:border-notion-dark-border" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-notion-hover dark:bg-notion-dark-hover text-notion-muted">
                        {user?.role}
                      </span>
                      
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange} 
                      />
                      <label 
                        htmlFor="avatar-upload" 
                        className="inline-flex items-center px-2.5 py-1 rounded-lg border border-notion-border dark:border-notion-dark-border text-[10px] font-bold text-notion-accent dark:text-notion-dark-accent hover:bg-notion-hover dark:hover:bg-notion-dark-hover/80 cursor-pointer transition-colors shadow-sm"
                      >
                        Upload Image
                      </label>
                    </div>
                    <p className="text-[9px] text-notion-muted">Max size 2MB (PNG, JPG, SVG)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-notion-muted dark:text-notion-dark-muted">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border bg-transparent text-xs text-notion-text dark:text-white focus:outline-none focus:border-notion-accent transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-notion-muted dark:text-notion-dark-muted">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border bg-transparent text-xs text-notion-text dark:text-white focus:outline-none focus:border-notion-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-notion-accent hover:bg-brand-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* THEME PANEL */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-notion-text dark:text-white uppercase tracking-wider">Theme & Live Feeds</h3>
                <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted">Customize appearance theme preferences and polling behaviors</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-1.5 border-b border-notion-border dark:border-notion-dark-border/40">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-notion-text dark:text-slate-200">Theme Appearance</label>
                    <span className="text-[10px] text-notion-muted block">Switch app interface colors</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        theme === 'light'
                          ? 'bg-notion-selected dark:bg-notion-dark-selected border-notion-accent/20 text-notion-accent'
                          : 'border-notion-border dark:border-notion-dark-border hover:bg-notion-hover text-notion-muted'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>

                    <button 
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        theme === 'dark'
                          ? 'bg-notion-selected dark:bg-notion-dark-selected border-notion-accent/20 text-notion-accent'
                          : 'border-notion-border dark:border-notion-dark-border hover:bg-notion-hover text-notion-muted'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-notion-border dark:border-notion-dark-border/40">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-notion-text dark:text-slate-200">Auto background polling</label>
                    <span className="text-[10px] text-notion-muted block">Polling details from API every 10 seconds</span>
                  </div>
                  <button onClick={togglePolling} className="cursor-pointer focus:outline-none">
                    {pollingEnabled ? (
                      <ToggleRight className="w-8 h-8 text-notion-accent" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-rose-600">Reset Local Storage Database</label>
                    <span className="text-[10px] text-notion-muted block">Clear hidden statuses and reset dashboard variables</span>
                  </div>
                  <button
                    onClick={handleResetApp}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-650 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Format App</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS PANEL */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-notion-text dark:text-white uppercase tracking-wider">Notification Preferences</h3>
                <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted">Configure alert rules for inventory levels</span>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-3 hover:bg-notion-hover dark:hover:bg-notion-dark-hover/40 p-2 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyLowStock}
                    onChange={(e) => setNotifyLowStock(e.target.checked)}
                    className="rounded border-slate-300 dark:border-notion-dark-border text-notion-accent focus:ring-notion-accent/25"
                  />
                  <div>
                    <span className="text-xs font-bold text-notion-text dark:text-slate-200 block">Low stock warnings</span>
                    <span className="text-[10px] text-notion-muted block mt-0.5">Notify when products fall below 8 units capacity</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 hover:bg-notion-hover dark:hover:bg-notion-dark-hover/40 p-2 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyWeeklyReport}
                    onChange={(e) => setNotifyWeeklyReport(e.target.checked)}
                    className="rounded border-slate-300 dark:border-notion-dark-border text-notion-accent focus:ring-notion-accent/25"
                  />
                  <div>
                    <span className="text-xs font-bold text-notion-text dark:text-slate-200 block">Weekly analytical briefs</span>
                    <span className="text-[10px] text-notion-muted block mt-0.5">Alert when weekly inventory values reports generate</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 hover:bg-notion-hover dark:hover:bg-notion-dark-hover/40 p-2 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifySystemStatus}
                    onChange={(e) => setNotifySystemStatus(e.target.checked)}
                    className="rounded border-slate-300 dark:border-notion-dark-border text-notion-accent focus:ring-notion-accent/25"
                  />
                  <div>
                    <span className="text-xs font-bold text-notion-text dark:text-slate-200 block">System diagnostic events</span>
                    <span className="text-[10px] text-notion-muted block mt-0.5">Notify on updates regarding API synchronization connections</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TABLE PANEL */}
          {activeTab === 'table' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-notion-text dark:text-white uppercase tracking-wider">Table Preferences</h3>
                <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted">Configure layouts and spacing defaults for products data table</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-notion-border dark:border-notion-dark-border/40 pb-3">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-notion-text dark:text-slate-200">Table Row Density</label>
                    <span className="text-[10px] text-notion-muted block">Alter paddings of products catalog grid rows</span>
                  </div>
                  <select
                    value={tableDensity}
                    onChange={(e) => setTableDensity(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-notion-border dark:border-notion-dark-border bg-white dark:bg-notion-dark-card text-xs font-semibold text-notion-text focus:outline-none"
                  >
                    <option value="compact">Compact (Tight)</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-notion-text dark:text-slate-200">Reset Header Column Configurations</label>
                    <span className="text-[10px] text-notion-muted block">Restore initial column visibility states and ordering</span>
                  </div>
                  <button
                    onClick={() => {
                      resetColumnPrefs();
                      addToast('Columns reset successfully', 'success');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border text-xs font-semibold hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-notion-muted" />
                    <span>Reset Layout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXPORT PANEL */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-notion-text dark:text-white uppercase tracking-wider">Export Preferences</h3>
                <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted">Configure CSV extraction parameters</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-notion-border dark:border-notion-dark-border/40 pb-3">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-notion-text dark:text-slate-200">CSV Delimiter Character</label>
                    <span className="text-[10px] text-notion-muted block">Delimiter symbol separator inside generated exports</span>
                  </div>
                  <select
                    value={csvDelimiter}
                    onChange={(e) => setCsvDelimiter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-notion-border dark:border-notion-dark-border bg-white dark:bg-notion-dark-card text-xs font-semibold text-notion-text focus:outline-none"
                  >
                    <option value="comma">Comma ( , )</option>
                    <option value="semicolon">Semicolon ( ; )</option>
                    <option value="tab">Tab ( \t )</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-notion-text dark:text-slate-200">Export Auto-Trigger Alerts</label>
                    <span className="text-[10px] text-notion-muted block">Trigger system toast notification after generating export file</span>
                  </div>
                  <button onClick={() => setCsvAutodownload(!csvAutodownload)} className="cursor-pointer focus:outline-none">
                    {csvAutodownload ? (
                      <ToggleRight className="w-8 h-8 text-notion-accent" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
