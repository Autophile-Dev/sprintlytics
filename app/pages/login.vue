<template>
  <div class="login-layout">
    <!-- Centered Login Card Pane -->
    <div class="form-pane">
      <div class="login-card-wrapper">
        <div class="login-card">
          <!-- Logo at the top of the login form -->
          <div class="logo-container">
            <img src="/wide-logo.png" alt="Sprintlytics Logo" class="branding-logo" />
          </div>



          <!-- State 1: LOGIN -->
          <div v-if="authState === 'login'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Welcome Back!</h2>
              <p class="form-subtitle">Log in to start optimizing your sprint analytics.</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form" novalidate>
              <!-- Email Address -->
              <div class="form-group">
                <label for="login-email">Email</label>
                <div class="input-wrapper" :class="{ 'input-wrapper-error': loginErrors.email }">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2.5 5.5L10 11.25L17.5 5.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <rect x="2.5" y="4.16669" width="15" height="11.6667" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="login-email"
                    v-model="loginData.email"
                    @input="clearError('login', 'email')"
                    placeholder="Input your email"
                    required
                    class="form-input"
                  />
                </div>
                <span v-if="loginErrors.email" class="field-error">{{ loginErrors.email }}</span>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label for="login-password">Password</label>
                <div class="input-wrapper" :class="{ 'input-wrapper-error': loginErrors.password }">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="4.16663" y="9.16669" width="11.6667" height="8.33333" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M6.66663 9.16669V5.83335C6.66663 4.90509 7.0354 4.01485 7.69178 3.35847C8.34816 2.7021 9.2384 2.33333 10.1666 2.33333C11.0949 2.33333 11.9851 2.7021 12.6415 3.35847C13.2979 4.01485 13.6666 4.90509 13.6666 5.83335V9.16669" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="login-password"
                    v-model="loginData.password"
                    @input="clearError('login', 'password')"
                    placeholder="Input your password"
                    required
                    class="form-input password-input"
                  />
                  <button type="button" @click="showPassword = !showPassword" class="password-toggle" aria-label="Toggle Password Visibility">
                    <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                <span v-if="loginErrors.password" class="field-error">{{ loginErrors.password }}</span>
              </div>

              <!-- Options (Remember me & Forgot Password) -->
              <div class="options-row">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="loginData.rememberMe" />
                  <span class="checkmark"></span>
                  <span class="checkbox-text">Remember Me</span>
                </label>
                <a href="#" @click.prevent="switchState('forgot-password')" class="forgot-link">Forgot Password?</a>
              </div>

              <!-- Action Buttons -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span v-else>Login</span>
              </button>

            </form>
          </div>

          <!-- State 2: REGISTER -->
          <div v-else-if="authState === 'register'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Create Account</h2>
              <p class="form-subtitle">Register to unlock automated sprint metrics & insights.</p>
            </div>

            <form @submit.prevent="handleRegister" class="login-form" novalidate>
              <!-- Email Address -->
              <div class="form-group">
                <label for="reg-email">Email</label>
                <div class="input-wrapper" :class="{ 'input-wrapper-error': registerErrors.email }">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2.5 5.5L10 11.25L17.5 5.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <rect x="2.5" y="4.16669" width="15" height="11.6667" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="reg-email"
                    v-model="registerData.email"
                    @input="clearError('register', 'email')"
                    placeholder="Input your email"
                    required
                    class="form-input"
                  />
                </div>
                <span v-if="registerErrors.email" class="field-error">{{ registerErrors.email }}</span>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label for="reg-password">Password</label>
                <div class="input-wrapper" :class="{ 'input-wrapper-error': registerErrors.password }">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="4.16663" y="9.16669" width="11.6667" height="8.33333" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M6.66663 9.16669V5.83335C6.66663 4.90509 7.0354 4.01485 7.69178 3.35847C8.34816 2.7021 9.2384 2.33333 10.1666 2.33333C11.0949 2.33333 11.9851 2.7021 12.6415 3.35847C13.2979 4.01485 13.6666 4.90509 13.6666 5.83335V9.16669" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="reg-password"
                    v-model="registerData.password"
                    @input="clearError('register', 'password')"
                    placeholder="Create a strong password"
                    required
                    class="form-input"
                  />
                  <button type="button" @click="showPassword = !showPassword" class="password-toggle" aria-label="Toggle Password Visibility">
                    <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                <span v-if="registerErrors.password" class="field-error">{{ registerErrors.password }}</span>

                <!-- Password Complexity Checklist (Live feedback) -->
                <div class="password-requirements" v-if="registerData.password">
                  <div class="requirement-item" :class="{ met: passwordReqs.length }">
                    <span class="req-dot"></span>
                    <span>8+ characters</span>
                  </div>
                  <div class="requirement-item" :class="{ met: passwordReqs.lowercase }">
                    <span class="req-dot"></span>
                    <span>1 lowercase letter</span>
                  </div>
                  <div class="requirement-item" :class="{ met: passwordReqs.uppercase }">
                    <span class="req-dot"></span>
                    <span>1 uppercase letter</span>
                  </div>
                  <div class="requirement-item" :class="{ met: passwordReqs.number }">
                    <span class="req-dot"></span>
                    <span>1 number</span>
                  </div>
                  <div class="requirement-item" :class="{ met: passwordReqs.special }">
                    <span class="req-dot"></span>
                    <span>1 special symbol</span>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span v-else>Sign Up</span>
              </button>
            </form>

            <div class="form-footer">
              <p>Already have an account? <a href="#" @click.prevent="switchState('login')" class="footer-link">Log in here</a></p>
            </div>
          </div>

          <!-- State 4: FORGOT PASSWORD -->
          <div v-else-if="authState === 'forgot-password'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Forgot Password?</h2>
              <p class="form-subtitle">No worries. Enter your registered email address and we'll send you a password reset code.</p>
            </div>

            <form @submit.prevent="handleForgotPassword" class="login-form" novalidate>
              <!-- Email Address -->
              <div class="form-group">
                <label for="forgot-email">Email</label>
                <div class="input-wrapper" :class="{ 'input-wrapper-error': forgotErrors.email }">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2.5 5.5L10 11.25L17.5 5.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <rect x="2.5" y="4.16669" width="15" height="11.6667" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="forgot-email"
                    v-model="forgotEmail"
                    @input="clearError('forgot', 'email')"
                    placeholder="Input your email"
                    required
                    class="form-input"
                  />
                </div>
                <span v-if="forgotErrors.email" class="field-error">{{ forgotErrors.email }}</span>
              </div>

              <!-- Action Button -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span v-else>Send Reset Code</span>
              </button>
            </form>

            <div class="form-footer">
              <p><a href="#" @click.prevent="switchState('login')" class="footer-link flex-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Back to Login</span>
              </a></p>
            </div>
          </div>

          <!-- State 5: RESET PASSWORD -->
          <div v-else-if="authState === 'reset-password'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Verify OTP & Reset Password</h2>
              <p class="form-subtitle">
                Enter the 6-digit code sent to <strong style="color: #059669; word-break: break-all;">{{ targetEmail || forgotEmail }}</strong> and set your new password.
              </p>
            </div>

            <form @submit.prevent="handleResetPassword" class="login-form" novalidate>
              <!-- OTP Code Input -->
              <div class="form-group">
                <label for="reset-code">Reset Code</label>
                <input
                  type="text"
                  id="reset-code"
                  v-model="resetCode"
                  @input="clearError('reset', 'code')"
                  placeholder="6-digit reset code"
                  maxlength="6"
                  required
                  pattern="[0-9]{6}"
                  class="form-input text-center"
                  :class="{ 'otp-input-error': resetErrors.code }"
                />
                <span v-if="resetErrors.code" class="field-error text-center">{{ resetErrors.code }}</span>
              </div>

              <!-- New Password -->
              <div class="form-group">
                <label for="reset-new-password">New Password</label>
                <div class="input-wrapper" :class="{ 'input-wrapper-error': resetErrors.password }">
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="4.16663" y="9.16669" width="11.6667" height="8.33333" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M6.66663 9.16669V5.83335C6.66663 4.90509 7.0354 4.01485 7.69178 3.35847C8.34816 2.7021 9.2384 2.33333 10.1666 2.33333C11.0949 2.33333 11.9851 2.7021 12.6415 3.35847C13.2979 4.01485 13.6666 4.90509 13.6666 5.83335V9.16669" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="reset-new-password"
                    v-model="newPassword"
                    @input="clearError('reset', 'password')"
                    placeholder="Enter new password"
                    required
                    class="form-input"
                  />
                  <button type="button" @click="showPassword = !showPassword" class="password-toggle" aria-label="Toggle Password Visibility">
                    <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                <span v-if="resetErrors.password" class="field-error">{{ resetErrors.password }}</span>

                <!-- Password Complexity Checklist (Live feedback) -->
                <div class="password-requirements" v-if="newPassword">
                  <div class="requirement-item" :class="{ met: resetPasswordReqs.length }">
                    <span class="req-dot"></span>
                    <span>8+ characters</span>
                  </div>
                  <div class="requirement-item" :class="{ met: resetPasswordReqs.lowercase }">
                    <span class="req-dot"></span>
                    <span>1 lowercase letter</span>
                  </div>
                  <div class="requirement-item" :class="{ met: resetPasswordReqs.uppercase }">
                    <span class="req-dot"></span>
                    <span>1 uppercase letter</span>
                  </div>
                  <div class="requirement-item" :class="{ met: resetPasswordReqs.number }">
                    <span class="req-dot"></span>
                    <span>1 number</span>
                  </div>
                  <div class="requirement-item" :class="{ met: resetPasswordReqs.special }">
                    <span class="req-dot"></span>
                    <span>1 special symbol</span>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span v-else>Update Password</span>
              </button>
            </form>

            <div class="form-footer" style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <p style="margin: 0; font-size: 0.85rem; color: #6B7280;">
                Didn't receive the code?
                <a href="#" @click.prevent="handleForgotPassword" class="footer-link" style="font-weight: 600; color: #059669;">
                  Resend OTP
                </a>
              </p>
              <p style="margin: 0;"><a href="#" @click.prevent="switchState('login')" class="footer-link flex-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Back to Login</span>
              </a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- AppModal is mounted globally in app.vue via useModal() -->
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
});

useHead({ title: 'Sign In | Sprintlytics' });

import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Retrieve CSRF token cookie at the top level (violates composition API rules to call useCookie inside helper functions)
const csrfCookie = useCookie('csrf_token');

// Auth UI state: 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'
const authState = ref('login');
const loading = ref(false);
const showPassword = ref(false);

// Global modal — powered by useModal composable (AppModal in app.vue)
const modal = useModal();

// Form Bindings
const loginData = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const registerData = reactive({
  email: '',
  password: ''
});

// Reset target email
const targetEmail = ref('');

// Forgot & Reset Passwords
const forgotEmail = ref('');
const resetCode = ref('');
const newPassword = ref('');

// Validation Error States
const loginErrors = reactive({ email: '', password: '' });
const registerErrors = reactive({ email: '', password: '' });
const forgotErrors = reactive({ email: '' });
const resetErrors = reactive({ code: '', password: '' });

// Clear specific field errors
const clearError = (form, field) => {
  if (form === 'login') loginErrors[field] = '';
  if (form === 'register') registerErrors[field] = '';
  if (form === 'forgot') forgotErrors[field] = '';
  if (form === 'reset') resetErrors[field] = '';
};

// Helper to show modal alert via global composable
const showAlert = (message, type = 'error', title = '') => {
  modal.show({
    type,
    title: title || (type === 'success' ? 'Success' : 'Error'),
    message,
    autoClose: type === 'error' ? 0 : 4000,
  });
};

// Switch auth screen state with clean reset
const switchState = (newState) => {
  authState.value = newState;
  modal.close();
  showPassword.value = false;
  resetCode.value = '';
  newPassword.value = '';
  
  // Clear error messages
  loginErrors.email = '';
  loginErrors.password = '';
  registerErrors.email = '';
  registerErrors.password = '';
  forgotErrors.email = '';
  resetErrors.code = '';
  resetErrors.password = '';
};

// Local Validation Rules
const validateEmail = (email) => {
  if (!email) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address.';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
  return '';
};

const validateCode = (code) => {
  if (!code) return 'Verification code is required.';
  if (!/^\d{6}$/.test(code)) return 'Verification code must be exactly 6 digits.';
  return '';
};

// Computed properties for password requirement checks (real-time feedback)
const passwordReqs = computed(() => {
  const p = registerData.password || '';
  return {
    length: p.length >= 8,
    lowercase: /[a-z]/.test(p),
    uppercase: /[A-Z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p)
  };
});

const resetPasswordReqs = computed(() => {
  const p = newPassword.value || '';
  return {
    length: p.length >= 8,
    lowercase: /[a-z]/.test(p),
    uppercase: /[A-Z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p)
  };
});

// State 1: Action Login
const handleLogin = async () => {
  loginErrors.email = validateEmail(loginData.email);
  loginErrors.password = loginData.password ? '' : 'Password is required.';
  
  if (loginErrors.email || loginErrors.password) {
    return;
  }

  loading.value = true;
  
  try {
    const csrfToken = csrfCookie.value;
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken || ''
      },
      body: {
        email: loginData.email,
        password: loginData.password,
        rememberMe: loginData.rememberMe
      }
    });

    if (response && response.success) {
      if (loginData.rememberMe) {
        localStorage.setItem('remembered_email', loginData.email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      router.push('/');
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Invalid email or password.';
    showAlert(errorMsg, 'error', 'Login Failed');
  } finally {
    loading.value = false;
  }
};

// State 2: Action Register
const handleRegister = async () => {
  registerErrors.email = validateEmail(registerData.email);
  registerErrors.password = validatePassword(registerData.password);
  
  if (registerErrors.email || registerErrors.password) {
    return;
  }

  loading.value = true;

  try {
    const csrfToken = csrfCookie.value;
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken || ''
      },
      body: {
        email: registerData.email,
        password: registerData.password
      }
    });

    if (response && response.success) {
      // Direct login notification modal
      showAlert('Registration successful! You can now log in with your credentials.', 'success', 'Account Created');
      
      // Auto-fill register email to login screen and redirect after modal
      loginData.email = registerData.email;
      setTimeout(() => {
        switchState('login');
      }, 2500);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Registration failed. Try again.';
    showAlert(errorMsg, 'error', 'Registration Failed');
  } finally {
    loading.value = false;
  }
};

// State 4: Action Forgot Password
const handleForgotPassword = async () => {
  forgotErrors.email = validateEmail(forgotEmail.value);
  
  if (forgotErrors.email) {
    return;
  }

  loading.value = true;

  try {
    const csrfToken = csrfCookie.value;
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken || ''
      },
      body: {
        email: forgotEmail.value
      }
    });

    if (response && response.success) {
      targetEmail.value = forgotEmail.value;
      showAlert(response.message || 'Reset code sent to email.', 'success', 'Code Sent');
      setTimeout(() => {
        switchState('reset-password');
      }, 2500);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Error requesting reset code.';
    showAlert(errorMsg, 'error', 'Request Failed');
  } finally {
    loading.value = false;
  }
};

// State 5: Action Reset Password
const handleResetPassword = async () => {
  resetErrors.code = validateCode(resetCode.value);
  resetErrors.password = validatePassword(newPassword.value);
  
  if (resetErrors.code || resetErrors.password) {
    return;
  }

  loading.value = true;

  try {
    const csrfToken = csrfCookie.value;
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken || ''
      },
      body: {
        email: targetEmail.value,
        code: resetCode.value,
        newPassword: newPassword.value
      }
    });

    if (response && response.success) {
      showAlert(response.message || 'Password reset successfully!', 'success', 'Password Updated');
      loginData.email = targetEmail.value;
      setTimeout(() => {
        switchState('login');
      }, 2500);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Reset password failed.';
    showAlert(errorMsg, 'error', 'Reset Failed');
  } finally {
    loading.value = false;
  }
};

// Google Mock Sign In Action
const handleGoogleSignIn = () => {
  showAlert('Google authentication integration is simulated for development.', 'info', 'Development Mode');
};

onMounted(() => {
  if (import.meta.client) {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      loginData.email = savedEmail;
      loginData.rememberMe = true;
    }
  }
});
</script>

<style scoped>
/* Google Font Imports: Playfair Display + Open Sans */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

/* Style Constants & Variables */
:root {
  --primary: #059669;
  --secondary: #065F46;
  --accent: #14B8A6;
  --bg-color: #F9FAFB;
  --white: #ffffff;
  --text-main: #111827;
  --text-muted: #6B7280;
  --border-color: #E5E7EB;
  --error: #EF4444;
  --success: #10B981;
}

.login-layout {
  display: grid;
  place-items: center;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  background: #F9FAFB;
  font-family: 'Open Sans', sans-serif;
  color: #111827;
  padding: 2.5rem 1.5rem;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ----------------------------------------------------
   CENTERED FORM PANE STYLING
---------------------------------------------------- */
.form-pane {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card-wrapper {
  width: 100%;
  max-width: 520px;
}

.login-card {
  background: #ffffff;
  border-radius: 40px;
box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  padding: 2.5rem 2.5rem;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.branding-logo {
  height: 75px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(6, 95, 70, 0.03));
}

/* Header inside card */
.form-header {
  margin-bottom: 2.25rem;
}

.form-title {
  font-family: 'Tan Mon Cherie', 'Playfair Display', serif;
  font-size: 2.25rem;
  color: #111827;
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.01em;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
}

.text-center {
  text-align: center;
}

.highlight-email {
  color: #059669;
  font-weight: 600;
}

/* Forms general */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.form-input {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  font-size: 0.95rem;
  color: #111827;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
}

.form-input::placeholder {
  color: #9CA3AF;
  opacity: 0.85;
}

.form-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
}

.password-input {
  padding-right: 2.75rem;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #059669;
}

.password-tip {
  font-size: 0.72rem;
  color: #6B7280;
  line-height: 1.3;
  margin-top: 0.1rem;
}

/* Input Validation Error Styles */
.input-wrapper-error .form-input {
  border-color: #EF4444;
}

.input-wrapper-error .form-input:focus {
  border-color: #EF4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.otp-input-error {
  border-color: #EF4444 !important;
}

.otp-input-error:focus {
  border-color: #EF4444 !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
}

.field-error {
  font-size: 0.8rem;
  color: #EF4444;
  margin-top: 1px;
  font-weight: 500;
  display: block;
}

/* Password Requirements Checklist */
.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: #9CA3AF;
  transition: all 0.2s ease;
}

.requirement-item .req-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #D1D5DB;
  transition: all 0.2s ease;
}

.requirement-item.met {
  color: #059669;
  font-weight: 500;
}

.requirement-item.met .req-dot {
  background-color: #059669;
  box-shadow: 0 0 6px rgba(5, 150, 105, 0.4);
}

/* Options row */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.forgot-link {
  font-size: 0.85rem;
  color: #059669;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #065F46;
  text-decoration: underline;
}

/* Custom checkbox wrapper */
.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 1.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  user-select: none;
  color: #4B5563;
  font-weight: 500;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 18px;
  width: 18px;
  background-color: #ffffff;
  border: 1px solid #D1D5DB;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #059669;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #059669;
  border-color: #059669;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  margin-left: 0.25rem;
}

/* OTP Spaced Code Field */
.otp-input-container {
  display: flex;
  justify-content: center;
}

.otp-code-input {
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 0.5rem;
  font-weight: 700;
  padding: 0.75rem 1rem;
  max-width: 250px;
}

.text-center {
  text-align: center;
}

/* Buttons */
.submit-btn {
  background-color: #059669;
  background-image: linear-gradient(135deg, #059669 0%, #065F46 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.9rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Spinner inside button */
.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider styling */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9CA3AF;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #E5E7EB;
}

.divider:not(:empty)::before {
  margin-right: .75em;
}

.divider:not(:empty)::after {
  margin-left: .75em;
}

/* Google Sign-in button */
.google-btn {
  background-color: #ffffff;
  color: #374151;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.85rem;
  border: 1px solid #D1D5DB;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease-in-out;
}

.google-btn:hover {
  background-color: #F9FAFB;
  border-color: #9CA3AF;
}

.google-icon {
  flex-shrink: 0;
}

/* Footer elements */
.form-footer {
  margin-top: 2rem;
  text-align: center;
}

.form-footer p {
  font-size: 0.88rem;
  color: #6B7280;
  margin: 0;
}

.footer-link {
  color: #059669;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #065F46;
  text-decoration: underline;
}

.flex-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

/* Notification Alert Banner */
.alert-banner {
  background-color: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.88rem;
  line-height: 1.4;
  box-sizing: border-box;
}

.alert-banner.success {
  background-color: #ECFDF5;
  border-color: #6EE7B7;
  color: #065F46;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.alert-text {
  flex-grow: 1;
}

/* ----------------------------------------------------
   TRANSITION ANIMATIONS
---------------------------------------------------- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ----------------------------------------------------
   RESPONSIVE DESIGN (MEDIA QUERIES)
---------------------------------------------------- */
@media (max-width: 1024px) {
  .login-layout {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .branding-pane {
    width: 100%;
    min-height: auto;
    padding: 3rem 2rem;
  }
  
  .branding-body {
    max-width: 100%;
    margin-bottom: 2rem;
  }
  
  .branding-title {
    font-size: 2.5rem;
  }
  
  .metrics-dashboard {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-pane {
    width: 100%;
    min-height: auto;
    padding: 3rem 1.5rem;
  }
  
  .login-card {
    box-shadow: none;
    border: none;
    background: transparent;
    padding: 0;
  }
  
  .mobile-logo-container {
    display: flex;
  }
}

@media (min-width: 1025px) and (max-width: 1200px) {
  .branding-pane {
    padding: 2.5rem 2rem;
  }
  .branding-title {
    font-size: 2.5rem;
  }
  .login-card {
    padding: 2.5rem 2rem;
  }
}
</style>

<style>
html, body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

@media (min-width: 1025px) {
  html, body {
    overflow: hidden !important;
  }
}

@media (max-width: 1024px) {
  html, body {
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
}
</style>
