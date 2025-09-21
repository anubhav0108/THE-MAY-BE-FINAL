# 🚀 Timetable Ace Deployment Guide

## 📋 Prerequisites

1. **Google AI API Key** - Required for AI-powered timetable generation
2. **Deployment Platform Account** (Vercel, Netlify, Railway, etc.)

## 🔑 Step 1: Get Google AI API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## 🏠 Step 2: Local Development Setup

1. Create `.env.local` file in project root:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

2. Restart the development server:
```bash
npm run dev
```

## 🌐 Step 3: Deployment Options

### Option A: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variable in Vercel dashboard:
   - Variable: `GEMINI_API_KEY`
   - Value: `your_api_key_here`

### Option B: Netlify
1. Connect GitHub repository
2. Add environment variable in Netlify dashboard:
   - Variable: `GEMINI_API_KEY`
   - Value: `your_api_key_here`

### Option C: Railway
1. Connect GitHub repository
2. Add environment variable in Railway dashboard:
   - Variable: `GEMINI_API_KEY`
   - Value: `your_api_key_here`

### Option D: Heroku
1. Create Heroku app
2. Set environment variable:
```bash
heroku config:set GEMINI_API_KEY=your_api_key_here
```

## 🔧 Step 4: Build Configuration

The project is already configured for deployment with:
- ✅ Next.js 15 with Turbopack
- ✅ TypeScript support
- ✅ Tailwind CSS
- ✅ Framer Motion animations
- ✅ Environment variable handling

## 📱 Features Ready for Deployment

- 🎨 Modern dark theme with neon gradients
- ✨ Smooth animations and hover effects
- 📱 Fully responsive design
- 🤖 AI-powered timetable generation
- 🔐 Multi-role authentication
- 📊 Interactive dashboard
- 🎯 NEP 2020 compliance

## 🚨 Important Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Test locally** before deploying
4. **Monitor API usage** to avoid unexpected charges

## 🆘 Troubleshooting

If you encounter issues:
1. Check environment variables are set correctly
2. Verify API key is valid and active
3. Check deployment platform logs
4. Ensure all dependencies are installed

## 📞 Support

For deployment issues, check:
- Platform-specific documentation
- Next.js deployment guide
- Google AI API documentation
