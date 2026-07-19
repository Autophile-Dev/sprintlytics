// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    server: {
      watch: {
        ignored: ['**/.nuxt/**', '**/.output/**', '**/node_modules/**', '**/.git/**'],
      },
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },

  // Server-only runtime configurations
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sprintlytics',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || '',
    secureCookies: process.env.SECURE_COOKIES === 'true',
  },

  // Security headers using Nitro route rules
  nitro: {
    watchOptions: {
      ignored: ['**/.nuxt/**', '**/.output/**', '**/node_modules/**', '**/.git/**'],
    },
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'X-XSS-Protection': '1; mode=block',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:;",
        },
      },
    },
  },
});
