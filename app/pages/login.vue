<template>
  <div class="login-layout">
    <!-- Left Branding and Visuals Pane -->
    <div class="branding-pane">
      <!-- Drifting glow blobs representing growth & success -->
      <div class="glow-blob blob-1"></div>
      <div class="glow-blob blob-2"></div>
      <div class="glow-blob blob-3"></div>
      
      <!-- Grid pattern overlay -->
      <div class="grid-overlay"></div>
      
      <div class="branding-content">
        <div class="branding-header">
          <img src="/wide-logo.png" alt="Sprintlytics Logo" class="branding-logo" />
          <a href="#" class="back-link">
            <span>Back to Website</span>
            <svg class="arrow-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12L9 8L5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
        
        <div class="branding-body">
          <h1 class="branding-title">
            Track Metrics.<br />
            <span class="gradient-text-accent">Predict Risks.</span><br />
            <span class="gradient-text-primary">Ship Faster.</span>
          </h1>
          <p class="branding-description">
            Sprintlytics converts Jira and sprint data into automated health scores, key metrics, and actionable analytics. Get real-time visibility into sprint progress, team utilization, and project risks.
          </p>
        </div>
        
        <!-- Floating Metrics Cards (Motion Showcase) -->
        <div class="metrics-dashboard">
          <!-- Card 1: Health Score -->
          <div class="metric-card card-health">
            <div class="card-inner">
              <div class="metric-icon-wrapper ring-container">
                <svg width="42" height="42" viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle" stroke-dasharray="94, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="21" class="percentage">94%</text>
                </svg>
              </div>
              <div class="metric-info">
                <h3>Sprint Health</h3>
                <p>Optimal productivity</p>
              </div>
            </div>
          </div>
          
          <!-- Card 2: Team Velocity -->
          <div class="metric-card card-velocity">
            <div class="card-inner">
              <div class="metric-icon-wrapper chart-container">
                <div class="bar-chart">
                  <div class="bar bar-1"></div>
                  <div class="bar bar-2"></div>
                  <div class="bar bar-3"></div>
                  <div class="bar bar-4"></div>
                </div>
              </div>
              <div class="metric-info">
                <h3>Team Velocity</h3>
                <p class="positive">+12% vs last sprint</p>
              </div>
            </div>
          </div>
          
          <!-- Card 3: Active Risks -->
          <div class="metric-card card-risks">
            <div class="card-inner">
              <div class="metric-icon-wrapper pulse-container">
                <span class="pulse-number">0</span>
                <span class="pulse-ring"></span>
              </div>
              <div class="metric-info">
                <h3>Critical Risks</h3>
                <p>All projects on track</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Login Card Pane -->
    <div class="form-pane">
      <div class="login-card-wrapper">
        <div class="login-card">
          <!-- Mobile logo (only displays when left branding pane is hidden) -->
          <div class="mobile-logo-container">
            <img src="/wide-logo.png" alt="Sprintlytics Logo" class="mobile-logo" />
          </div>

          <!-- Alert banner for errors/success messages -->
          <Transition name="fade">
            <div v-if="alertMessage" :class="['alert-banner', alertType]">
              <span class="alert-icon">
                <svg v-if="alertType === 'error'" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  <path v-else width="18" height="18" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </span>
              <span class="alert-text">{{ alertMessage }}</span>
            </div>
          </Transition>

          <!-- State 1: LOGIN -->
          <div v-if="authState === 'login'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Welcome Back!</h2>
              <p class="form-subtitle">Log in to start optimizing your sprint analytics.</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
              <!-- Email Address -->
              <div class="form-group">
                <label for="login-email">Email</label>
                <div class="input-wrapper">
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
                    placeholder="Input your email"
                    required
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label for="login-password">Password</label>
                <div class="input-wrapper">
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
                <span>Login</span>
              </button>

              <!-- Divider -->
              <div class="divider">
                <span>Or continue with:</span>
              </div>

              <!-- Google Social Login -->
              <button type="button" @click="handleGoogleSignIn" class="google-btn">
                <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>

            <div class="form-footer">
              <p>Don't have an account? <a href="#" @click.prevent="switchState('register')" class="footer-link">Sign up here</a></p>
            </div>
          </div>

          <!-- State 2: REGISTER -->
          <div v-else-if="authState === 'register'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Create Account</h2>
              <p class="form-subtitle">Register to unlock automated sprint metrics & insights.</p>
            </div>

            <form @submit.prevent="handleRegister" class="login-form">
              <!-- Email Address -->
              <div class="form-group">
                <label for="reg-email">Email</label>
                <div class="input-wrapper">
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
                    placeholder="Input your email"
                    required
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label for="reg-password">Password</label>
                <div class="input-wrapper">
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
                <span class="password-tip">At least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special symbol.</span>
              </div>

              <!-- Action Button -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span>Sign Up</span>
              </button>
            </form>

            <div class="form-footer">
              <p>Already have an account? <a href="#" @click.prevent="switchState('login')" class="footer-link">Log in here</a></p>
            </div>
          </div>

          <!-- State 3: VERIFY OTP -->
          <div v-else-if="authState === 'verify-otp'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Verify Email</h2>
              <p class="form-subtitle text-center">We've sent a 6-digit verification code to <span class="highlight-email">{{ targetEmail }}</span>. Enter it below to activate your account.</p>
            </div>

            <form @submit.prevent="handleVerifyOtp" class="login-form">
              <!-- OTP Code Input -->
              <div class="form-group">
                <label for="otp-code">Verification Code</label>
                <div class="otp-input-container">
                  <input
                    type="text"
                    id="otp-code"
                    v-model="otpCode"
                    placeholder="Enter 6-digit code"
                    maxlength="6"
                    required
                    pattern="[0-9]{6}"
                    class="form-input otp-code-input"
                    autocomplete="one-time-code"
                  />
                </div>
              </div>

              <!-- Action Button -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span>Verify Code</span>
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

          <!-- State 4: FORGOT PASSWORD -->
          <div v-else-if="authState === 'forgot-password'" class="form-content-wrapper">
            <div class="form-header">
              <h2 class="form-title">Forgot Password?</h2>
              <p class="form-subtitle">No worries. Enter your registered email address and we'll send you a password reset code.</p>
            </div>

            <form @submit.prevent="handleForgotPassword" class="login-form">
              <!-- Email Address -->
              <div class="form-group">
                <label for="forgot-email">Email</label>
                <div class="input-wrapper">
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
                    placeholder="Input your email"
                    required
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Action Button -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span>Send Reset Code</span>
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
              <h2 class="form-title">Reset Password</h2>
              <p class="form-subtitle">Enter the 6-digit reset code sent to your email and your new password.</p>
            </div>

            <form @submit.prevent="handleResetPassword" class="login-form">
              <!-- OTP Code Input -->
              <div class="form-group">
                <label for="reset-code">Reset Code</label>
                <input
                  type="text"
                  id="reset-code"
                  v-model="resetCode"
                  placeholder="6-digit reset code"
                  maxlength="6"
                  required
                  pattern="[0-9]{6}"
                  class="form-input text-center"
                />
              </div>

              <!-- New Password -->
              <div class="form-group">
                <label for="reset-new-password">New Password</label>
                <div class="input-wrapper">
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
                <span class="password-tip">Must contain 8+ characters (uppercase, lowercase, number, special).</span>
              </div>

              <!-- Action Button -->
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span>Update Password</span>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Auth UI state: 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'
const authState = ref('login');
const loading = ref(false);
const showPassword = ref(false);

// Notification Alert System
const alertMessage = ref('');
const alertType = ref('error'); // 'error' | 'success'

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

// Verification/Reset target email
const targetEmail = ref('');

// OTP Verification code
const otpCode = ref('');

// Forgot & Reset Passwords
const forgotEmail = ref('');
const resetCode = ref('');
const newPassword = ref('');

// Helper to flash notifications
const showAlert = (message, type = 'error') => {
  alertMessage.value = message;
  alertType.value = type;
  setTimeout(() => {
    alertMessage.value = '';
  }, 6000);
};

// Switch auth screen state with clean reset
const switchState = (newState) => {
  authState.value = newState;
  alertMessage.value = '';
  showPassword.value = false;
  otpCode.value = '';
  resetCode.value = '';
  newPassword.value = '';
};

// State 1: Action Login
const handleLogin = async () => {
  loading.value = true;
  alertMessage.value = '';
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: loginData.email,
        password: loginData.password
      }
    });

    if (response && response.success) {
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Invalid email or password.';
    const statusCode = error.statusCode;

    // Handle Unverified email address
    if (statusCode === 403) {
      targetEmail.value = loginData.email;
      showAlert(errorMsg, 'error');
      setTimeout(() => {
        switchState('verify-otp');
      }, 2000);
    } else {
      showAlert(errorMsg, 'error');
    }
  } finally {
    loading.value = false;
  }
};

// State 2: Action Register
const handleRegister = async () => {
  loading.value = true;
  alertMessage.value = '';

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: registerData.email,
        password: registerData.password
      }
    });

    if (response && response.success) {
      targetEmail.value = registerData.email;
      showAlert(response.message || 'OTP Sent. Please verify your email.', 'success');
      setTimeout(() => {
        switchState('verify-otp');
      }, 2000);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Registration failed. Try again.';
    showAlert(errorMsg, 'error');
  } finally {
    loading.value = false;
  }
};

// State 3: Action Verify OTP
const handleVerifyOtp = async () => {
  if (otpCode.value.length !== 6) {
    showAlert('Please enter the full 6-digit code.');
    return;
  }

  loading.value = true;
  alertMessage.value = '';

  try {
    const response = await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        email: targetEmail.value,
        code: otpCode.value
      }
    });

    if (response && response.success) {
      showAlert(response.message || 'Email verified successfully!', 'success');
      // Autofill verified email into login form
      loginData.email = targetEmail.value;
      setTimeout(() => {
        switchState('login');
      }, 2000);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Invalid or expired OTP.';
    showAlert(errorMsg, 'error');
  } finally {
    loading.value = false;
  }
};

// State 4: Action Forgot Password
const handleForgotPassword = async () => {
  loading.value = true;
  alertMessage.value = '';

  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: forgotEmail.value
      }
    });

    if (response && response.success) {
      targetEmail.value = forgotEmail.value;
      showAlert(response.message || 'Reset code sent to email.', 'success');
      setTimeout(() => {
        switchState('reset-password');
      }, 2000);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Error requesting reset code.';
    showAlert(errorMsg, 'error');
  } finally {
    loading.value = false;
  }
};

// State 5: Action Reset Password
const handleResetPassword = async () => {
  if (resetCode.value.length !== 6) {
    showAlert('Please enter the full 6-digit code.');
    return;
  }

  loading.value = true;
  alertMessage.value = '';

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        email: targetEmail.value,
        code: resetCode.value,
        newPassword: newPassword.value
      }
    });

    if (response && response.success) {
      showAlert(response.message || 'Password reset successfully!', 'success');
      loginData.email = targetEmail.value;
      setTimeout(() => {
        switchState('login');
      }, 2500);
    }
  } catch (error) {
    const errorMsg = error.data?.message || 'Reset password failed.';
    showAlert(errorMsg, 'error');
  } finally {
    loading.value = false;
  }
};

// Google Mock Sign In Action
const handleGoogleSignIn = () => {
  showAlert('Google authentication integration is simulated for development.', 'success');
};
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
  display: flex;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #F9FAFB;
  font-family: 'Open Sans', sans-serif;
  color: #111827;
}

/* ----------------------------------------------------
   LEFT BRANDING PANE STYLING
---------------------------------------------------- */
.branding-pane {
  position: relative;
  width: 50%;
  background: radial-gradient(circle at 10% 20%, #065F46 0%, #022c22 90%);
  display: flex;
  flex-direction: column;
  padding: 3rem 4rem;
  overflow: hidden;
  color: #ffffff;
  box-sizing: border-box;
}

/* Glowing Ambient Blobs (Motion) */
.glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  pointer-events: none;
  z-index: 1;
}

.blob-1 {
  background-color: #059669;
  width: 350px;
  height: 350px;
  top: -100px;
  left: -50px;
  animation: drift 15s ease-in-out infinite alternate;
}

.blob-2 {
  background-color: #14B8A6;
  width: 400px;
  height: 400px;
  bottom: -150px;
  right: -50px;
  animation: drift 20s ease-in-out infinite alternate-reverse;
}

.blob-3 {
  background-color: #065F46;
  width: 300px;
  height: 300px;
  top: 40%;
  left: 30%;
  animation: drift 18s ease-in-out infinite alternate;
}

@keyframes drift {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -40px) scale(1.15);
  }
  100% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Grid Overlay */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(20, 184, 166, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(20, 184, 166, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 2;
}

/* Branding Header */
.branding-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.branding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.branding-logo {
  height: 44px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.back-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.25s ease;
}

.back-link:hover {
  color: #14B8A6;
}

.arrow-icon {
  transform: rotate(180deg);
  transition: transform 0.25s ease;
}

.back-link:hover .arrow-icon {
  transform: rotate(180deg) translateX(4px);
}

/* Branding Body text */
.branding-body {
  margin-top: 2rem;
  max-width: 90%;
}

.branding-title {
  font-family: 'Tan Mon Cherie', 'Playfair Display', serif;
  font-size: 3.2rem;
  line-height: 1.15;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
}

.gradient-text-accent {
  background: linear-gradient(135deg, #14B8A6 0%, #ffffff 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text-primary {
  background: linear-gradient(135deg, #059669 0%, #14B8A6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.branding-description {
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba(243, 244, 246, 0.8);
  font-weight: 300;
}

/* KPI Metrics Dashboard Showcase (Floating Motion) */
.metrics-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-top: 2rem;
}

.metric-card {
  background: rgba(6, 95, 70, 0.35);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-8px) scale(1.03);
  border-color: rgba(20, 184, 166, 0.4);
}

.card-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-info h3 {
  font-size: 0.87rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.metric-info p {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.2rem 0 0 0;
}

/* Circular Chart animation */
.circular-chart {
  max-width: 42px;
  max-height: 42px;
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 2.8;
}

.circle {
  fill: none;
  stroke: #14B8A6;
  stroke-width: 2.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.35s;
}

.percentage {
  fill: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-size: 9px;
  font-weight: 700;
  text-anchor: middle;
}

/* Mini Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 28px;
  width: 32px;
  padding-bottom: 2px;
}

.bar {
  flex-grow: 1;
  background-color: #059669;
  border-radius: 2px;
  width: 5px;
  animation: barGrow 1.5s ease-in-out infinite alternate;
}

.bar-1 { height: 40%; animation-delay: 0.1s; }
.bar-2 { height: 75%; animation-delay: 0.3s; background-color: #14B8A6; }
.bar-3 { height: 55%; animation-delay: 0.2s; }
.bar-4 { height: 95%; animation-delay: 0.4s; background-color: #14B8A6; }

@keyframes barGrow {
  0% { transform: scaleY(0.7); transform-origin: bottom; }
  100% { transform: scaleY(1); transform-origin: bottom; }
}

.metric-info p.positive {
  color: #14B8A6;
  font-weight: 600;
}

/* Pulse Check indicator */
.pulse-container {
  position: relative;
  width: 32px;
  height: 32px;
  background-color: rgba(5, 150, 105, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-number {
  font-weight: 700;
  font-size: 0.95rem;
  color: #10B981;
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #10B981;
  border-radius: 50%;
  animation: pulseAnim 2s infinite ease-out;
  z-index: 1;
}

@keyframes pulseAnim {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* Assign staggered floating animations to cards */
.card-health {
  animation: floatCard 6s ease-in-out infinite;
}

.card-velocity {
  animation: floatCard 7s ease-in-out infinite;
  animation-delay: 1.5s;
}

.card-risks {
  animation: floatCard 8s ease-in-out infinite;
  animation-delay: 3s;
}

@keyframes floatCard {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(0.5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

/* ----------------------------------------------------
   RIGHT FORM PANE STYLING
---------------------------------------------------- */
.form-pane {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F9FAFB;
  padding: 2rem;
  box-sizing: border-box;
}

.login-card-wrapper {
  width: 100%;
  max-width: 520px;
}

.login-card {
  background: #ffffff;
  border-radius: 40px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 15px 25px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid #F3F4F6;
  padding: 3.5rem 3rem;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.mobile-logo-container {
  display: none;
  justify-content: center;
  margin-bottom: 2rem;
}

.mobile-logo {
  height: 40px;
  object-fit: contain;
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
  gap: 1.5rem;
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
    overflow-y: auto;
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
