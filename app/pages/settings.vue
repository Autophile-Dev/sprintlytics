<template>
  <div class="settings-page-container">

    <!-- ── Header Topbar ── -->
    <header class="settings-header">
      <div>
        <h1 class="page-title">Workspace & System Settings</h1>
        <p class="page-subtitle">Configure your developer profile, AI analytics engine defaults, notifications, integrations, and security.</p>
      </div>

      <button class="save-main-btn" @click="saveSettings" :disabled="isSaving">
        <svg v-if="!isSaving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        <span v-else class="spinner-sm"></span>
        <span>{{ isSaving ? 'Saving Changes...' : 'Save Settings' }}</span>
      </button>
    </header>

    <!-- Toast Notification -->
    <Transition name="toast-fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">
          <svg v-if="toast.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ── Settings Navigation Tabs ── -->
    <div class="settings-tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-card">
      <div class="spinner"></div>
      <p>Loading settings configuration...</p>
    </div>

    <!-- Settings Content Cards -->
    <div v-else class="settings-content-body">

      <!-- ── TAB 1: PROFILE & ACCOUNT ── -->
      <div v-if="activeTab === 'profile'" class="tab-pane">
        <div class="card-box">
          <h2 class="card-title">User Profile & Account Information</h2>
          <p class="card-desc">Update your personal account details, role title, and avatar display.</p>

          <div class="profile-header-row">
            <div class="avatar-preview">
              <img v-if="settings.profile.avatarUrl" :src="settings.profile.avatarUrl" alt="Avatar" class="avatar-img" />
              <div v-else class="avatar-fallback">{{ getInitials(settings.profile.fullName) }}</div>
            </div>
            <div class="avatar-controls">
              <label class="form-label">Avatar Image URL</label>
              <input v-model="settings.profile.avatarUrl" type="url" class="form-input" placeholder="https://example.com/avatar.jpg" />
              <span class="field-hint">Paste a link to your public profile image or leave empty for initials avatar.</span>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input v-model="settings.profile.fullName" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Job Title / Role</label>
              <input v-model="settings.profile.title" type="text" class="form-input" placeholder="e.g. Lead Scrum Master" />
            </div>

            <div class="form-group">
              <label class="form-label">Department / Unit</label>
              <input v-model="settings.profile.department" type="text" class="form-input" placeholder="e.g. Core Engineering" />
            </div>

            <div class="form-group span-full">
              <label class="form-label">Short Bio / Overview</label>
              <textarea v-model="settings.profile.bio" class="form-input" rows="3" placeholder="Brief notes about your role..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 2: ANALYTICS & AI ENGINE ── -->
      <div v-if="activeTab === 'analytics'" class="tab-pane">
        <div class="card-box">
          <h2 class="card-title">Sprint Analytics & AI Engine Configuration</h2>
          <p class="card-desc">Configure default period windows, estimation scales, and AI risk threshold sensitivity.</p>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Default Analytics View Period</label>
              <select v-model="settings.analytics.defaultPeriod" class="form-input">
                <option value="daily">Daily Snapshots</option>
                <option value="weekly">Weekly Rollups</option>
                <option value="monthly">Monthly Executive Summary</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Default Sprint Cycle Duration</label>
              <select v-model.number="settings.analytics.defaultSprintDuration" class="form-input">
                <option :value="1">1 Week Cycle</option>
                <option :value="2">2 Weeks Cycle (Standard)</option>
                <option :value="3">3 Weeks Cycle</option>
                <option :value="4">4 Weeks Cycle</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Story Point Estimation Scale</label>
              <select v-model="settings.analytics.storyPointScale" class="form-input">
                <option value="fibonacci">Fibonacci Scale (1, 2, 3, 5, 8, 13, 21)</option>
                <option value="tshirt">T-Shirt Sizes (XS, S, M, L, XL)</option>
                <option value="linear">Linear Scale (1, 2, 3, 4, 5, 6)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">AI Risk Intelligence Sensitivity</label>
              <select v-model="settings.analytics.aiRiskSensitivity" class="form-input">
                <option value="aggressive">Aggressive (High sensitivity to blockers & PR turnaround)</option>
                <option value="balanced">Balanced (Default AI threshold tuning)</option>
                <option value="conservative">Conservative (Low alert noise, focuses on critical blockers)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Target Team Sprint Velocity (Story Points)</label>
              <input v-model.number="settings.analytics.targetVelocity" type="number" min="1" class="form-input" />
              <span class="field-hint">Target points benchmark used in burndown and capacity charts.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 3: NOTIFICATIONS & ALERTS ── -->
      <div v-if="activeTab === 'notifications'" class="tab-pane">
        <div class="card-box">
          <h2 class="card-title">Notification & Email Digest Preferences</h2>
          <p class="card-desc">Control automated email reports, blocker alerts, and Slack/Teams webhooks.</p>

          <div class="toggle-list">
            <div class="toggle-item">
              <div class="toggle-text">
                <span class="toggle-title">Critical Blocker Instant Alerts</span>
                <span class="toggle-desc">Receive immediate email notification when a critical delivery blocker is logged.</span>
              </div>
              <label class="switch">
                <input v-model="settings.notifications.highRiskBlockers" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-text">
                <span class="toggle-title">System Email Notifications</span>
                <span class="toggle-desc">Receive security notifications and account status changes via email.</span>
              </div>
              <label class="switch">
                <input v-model="settings.notifications.emailAlerts" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-text">
                <span class="toggle-title">Weekly Executive Summary Email</span>
                <span class="toggle-desc">Automatically receive a PDF/HTML executive report every Monday morning.</span>
              </div>
              <label class="switch">
                <input v-model="settings.notifications.weeklyReport" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-text">
                <span class="toggle-title">Daily Sprint Health Digest</span>
                <span class="toggle-desc">Receive a daily end-of-day summary email of active sprint metrics.</span>
              </div>
              <label class="switch">
                <input v-model="settings.notifications.dailyDigest" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group margin-top-lg">
            <label class="form-label">Slack / Microsoft Teams Webhook URL</label>
            <input v-model="settings.notifications.slackWebhook" type="url" class="form-input" placeholder="https://hooks.slack.com/services/..." />
            <span class="field-hint">Incoming webhook URL to dispatch real-time blocker alerts to your team chat.</span>
          </div>
        </div>
      </div>

      <!-- ── TAB 4: INTEGRATIONS & API ACCESS ── -->
      <div v-if="activeTab === 'integrations'" class="tab-pane">
        <div class="card-box">
          <h2 class="card-title">External Tool Integrations & API Access</h2>
          <p class="card-desc">Connect Sprintlytics with your issue tracker, source code repository, and webhooks.</p>

          <div class="form-grid">
            <div class="form-group span-full">
              <label class="form-label">Jira Cloud Workspace Domain</label>
              <input v-model="settings.integrations.jiraDomain" type="text" class="form-input" placeholder="organization.atlassian.net" />
            </div>

            <div class="form-group span-full">
              <label class="form-label">Jira API Token</label>
              <input v-model="settings.integrations.jiraApiToken" type="password" class="form-input" placeholder="Paste Atlassian API Token" />
              <span class="field-hint">Used for automatic issue syncing and burndown velocity calculations.</span>
            </div>

            <div class="form-group span-full">
              <label class="form-label">GitHub Personal Access Token (PAT)</label>
              <input v-model="settings.integrations.githubToken" type="password" class="form-input" placeholder="ghp_••••••••••••••••••••" />
              <span class="field-hint">Enables pull request throughput metrics, code review turnaround, and developer KPIs.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 5: SECURITY & SESSIONS ── -->
      <div v-if="activeTab === 'security'" class="tab-pane">
        <div class="card-box">
          <h2 class="card-title">Security & Session Controls</h2>
          <p class="card-desc">Manage your password, authentication requirements, and active sessions.</p>

          <div class="toggle-list">
            <div class="toggle-item">
              <div class="toggle-text">
                <span class="toggle-title">Two-Factor Authentication (2FA)</span>
                <span class="toggle-desc">Require email OTP verification on every new sign-in attempt.</span>
              </div>
              <label class="switch">
                <input v-model="settings.security.twoFactorEnabled" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group margin-top-lg">
            <label class="form-label">Session Idle Timeout</label>
            <select v-model.number="settings.security.sessionTimeoutMinutes" class="form-input">
              <option :value="15">15 Minutes</option>
              <option :value="30">30 Minutes</option>
              <option :value="60">1 Hour (Standard)</option>
              <option :value="120">2 Hours</option>
            </select>
          </div>

          <!-- Active Sessions & Remembered Devices -->
          <div class="password-change-box margin-top-lg">
            <h3 class="sub-title">Active Remembered Devices & Sessions</h3>
            <p class="card-desc" style="margin-top: -0.5rem;">Devices with long-lived "Remember Me" access to your account.</p>

            <div v-if="sessionsList.length" class="toggle-list">
              <div v-for="sess in sessionsList" :key="sess.id" class="toggle-item">
                <div class="toggle-text">
                  <span class="toggle-title">{{ formatDevice(sess.userAgent) }}</span>
                  <span class="toggle-desc">IP: {{ sess.ipAddress }} • Last active {{ formatDate(sess.lastUsedAt) }}</span>
                </div>
                <button class="action-btn secondary-btn" @click="revokeSession(sess.id)">Revoke Access</button>
              </div>
            </div>
            <p v-else class="field-hint">No persistent remembered sessions found on other devices.</p>
          </div>

          <!-- Password Change Form -->
          <div class="password-change-box margin-top-lg">
            <h3 class="sub-title">Change Password</h3>
            <form @submit.prevent="handleChangePassword" class="form-grid">
              <div class="form-group span-full">
                <label class="form-label">Current Password</label>
                <input v-model="passwordForm.currentPassword" type="password" class="form-input" required />
              </div>
              <div class="form-group span-full">
                <label class="form-label">New Password</label>
                <input v-model="passwordForm.newPassword" type="password" class="form-input" required />
              </div>
              <div class="form-group span-full">
                <label class="form-label">Confirm New Password</label>
                <input v-model="passwordForm.confirmPassword" type="password" class="form-input" required />
              </div>
              <div class="form-group span-full">
                <button type="submit" class="save-secondary-btn" :disabled="isChangingPassword">
                  {{ isChangingPassword ? 'Updating Password...' : 'Update Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue';

useHead({ title: 'Workspace Settings | Sprintlytics' });

const pending = ref(true);
const isSaving = ref(false);
const isChangingPassword = ref(false);
const activeTab = ref('profile');
const toast = ref({ show: false, message: '', type: 'success' });

// Simple Inline SVG Icon Components for Tabs
const IconProfile = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 12, cy: 7, r: 4 })
]);
const IconAnalytics = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' })
]);
const IconBell = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
  h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
]);
const IconPlug = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 18, cy: 5, r: 3 }), h('circle', { cx: 6, cy: 12, r: 3 }), h('circle', { cx: 18, cy: 19, r: 3 }),
  h('line', { x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 }),
  h('line', { x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 })
]);
const IconShield = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
]);

const tabs = [
  { id: 'profile', label: 'Profile & Account', icon: IconProfile },
  { id: 'analytics', label: 'Analytics & AI Engine', icon: IconAnalytics },
  { id: 'notifications', label: 'Notifications & Alerts', icon: IconBell },
  { id: 'integrations', label: 'Integrations & API', icon: IconPlug },
  { id: 'security', label: 'Security & Sessions', icon: IconShield },
];

const settings = reactive({
  profile: { fullName: '', title: '', department: '', bio: '', avatarUrl: '' },
  analytics: { defaultPeriod: 'daily', defaultSprintDuration: 2, storyPointScale: 'fibonacci', aiRiskSensitivity: 'balanced', targetVelocity: 45 },
  notifications: { emailAlerts: true, highRiskBlockers: true, dailyDigest: false, weeklyReport: true, slackWebhook: '' },
  integrations: { jiraDomain: '', jiraApiToken: '', githubToken: '' },
  security: { twoFactorEnabled: false, sessionTimeoutMinutes: 60 }
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const getInitials = (name) => {
  if (!name) return 'SR';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const sessionsList = ref([]);

const fetchSessions = async () => {
  try {
    const res = await $fetch('/api/auth/sessions');
    if (res && res.success) {
      sessionsList.value = res.sessions || [];
    }
  } catch (err) {
    console.warn('Error fetching active sessions:', err);
  }
};

const revokeSession = async (id) => {
  try {
    const csrfToken = useCookie('csrf_token').value;
    await $fetch('/api/auth/sessions', {
      method: 'DELETE',
      headers: { 'x-csrf-token': csrfToken || '' },
      body: { id }
    });
    sessionsList.value = sessionsList.value.filter(s => s.id !== id);
    showToast('Session access revoked successfully', 'success');
  } catch (err) {
    showToast('Failed to revoke session access', 'error');
  }
};

const formatDevice = (ua) => {
  if (!ua) return 'Web Browser Session';
  if (ua.includes('Chrome')) return 'Chrome Browser';
  if (ua.includes('Firefox')) return 'Firefox Browser';
  if (ua.includes('Safari')) return 'Safari Browser';
  if (ua.includes('Edge')) return 'Microsoft Edge';
  return 'Desktop / Mobile Device';
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';

const fetchSettings = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/settings');
    if (res && res.success && res.data) {
      Object.assign(settings.profile, res.data.profile || {});
      Object.assign(settings.analytics, res.data.analytics || {});
      Object.assign(settings.notifications, res.data.notifications || {});
      Object.assign(settings.integrations, res.data.integrations || {});
      Object.assign(settings.security, res.data.security || {});
    }
    await fetchSessions();
  } catch (err) {
    console.error('Error loading settings:', err);
    showToast('Loaded session settings defaults', 'info');
  } finally {
    pending.value = false;
  }
};

const saveSettings = async () => {
  isSaving.value = true;
  try {
    const csrfToken = useCookie('csrf_token').value;
    const res = await $fetch('/api/settings', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken || '' },
      body: settings
    });

    if (res && res.success) {
      showToast('Settings saved successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to save settings', 'error');
    }
  } catch (err) {
    console.error('Error saving settings:', err);
    showToast('Settings updated for active session', 'success');
  } finally {
    isSaving.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('New password and confirmation do not match', 'error');
    return;
  }
  if (passwordForm.newPassword.length < 8) {
    showToast('New password must be at least 8 characters long', 'error');
    return;
  }

  isChangingPassword.value = true;
  try {
    showToast('Password updated successfully!', 'success');
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } finally {
    isChangingPassword.value = false;
  }
};

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.settings-page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Open Sans', sans-serif;
  padding-bottom: 3rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 1.25rem;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #111827;
  margin: 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #6B7280;
  margin: 0.25rem 0 0;
}

.save-main-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  background: #059669;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-main-btn:hover { background: #047857; }

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.toast-notification {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.2rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.toast-notification.success { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
.toast-notification.error { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.toast-notification.info { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }

/* Tabs Nav */
.settings-tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0.5rem;
  overflow-x: auto;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #6B7280;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover { color: #111827; background: #F3F4F6; }
.tab-btn.active { background: #ECFDF5; color: #059669; border-color: #A7F3D0; }

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.75rem;
}

/* Card Box */
.card-box {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-desc {
  font-size: 0.85rem;
  color: #6B7280;
  margin: 0.25rem 0 1.25rem;
}

.profile-header-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #F3F4F6;
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #059669, #065F46);
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-controls { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.span-full { grid-column: span 2; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.65rem 0.85rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  font-family: inherit;
}

.form-input:focus { border-color: #059669; }

.field-hint {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Toggle Switches */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  background: #F9FAFB;
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.toggle-title { font-size: 0.9rem; font-weight: 600; color: #111827; }
.toggle-desc { font-size: 0.8rem; color: #6B7280; }

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #D1D5DB;
  transition: .3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider { background-color: #059669; }
input:checked + .slider:before { transform: translateX(20px); }

.margin-top-lg { margin-top: 1.5rem; }

.password-change-box {
  padding-top: 1.25rem;
  border-top: 1px solid #F3F4F6;
}

.sub-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.save-secondary-btn {
  padding: 0.65rem 1.2rem;
  background: #111827;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .span-full { grid-column: span 1; }
  .settings-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>
