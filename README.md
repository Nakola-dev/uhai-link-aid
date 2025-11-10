# 🏥 Uhai Assist Link

**Empowering You to Act When Every Second Counts**

An AI-powered First Aid and Emergency Response platform designed to provide real-time medical guidance, store critical health information, and connect users with emergency services across Kenya.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [License](#license)

---

## 🌟 About the Project

**Uhai Assist Link** is a modern, AI-driven emergency response platform that bridges the gap between emergencies and professional medical care. Whether you're facing a medical emergency or need quick first aid guidance, Uhai Assist Link provides instant, reliable support.

### Why Uhai Assist Link?

- **Instant AI Guidance**: Get real-time first aid instructions powered by advanced AI models
- **Personal Medical Profile**: Store vital health information securely in one place
- **Emergency QR Code**: Quick access to your medical profile for first responders
- **Educational Resources**: Learn life-saving skills through interactive tutorials
- **Emergency Directory**: Connect with verified emergency organizations across Kenya

---

## ✨ Key Features

### 🤖 AI First Aid Assistant
- Real-time conversational guidance for medical emergencies
- Step-by-step first aid instructions
- Powered by OpenRouter AI models for accurate, context-aware responses

### 👤 Personal Medical Profile
- Comprehensive health information storage
- Blood type, allergies, medications, and medical conditions
- Multiple emergency contacts with priority levels
- Secure, cloud-based storage via Supabase

### 📱 QR Code Emergency ID
- Auto-generated QR code linked to your medical profile
- Instant access for first responders and medical personnel
- Download and print options for physical ID cards

### 📚 First Aid Learning Center
- **General Steps**: Interactive cards with basic first aid procedures
- **Video Tutorials**: Watch and learn from expert demonstrations
- **Download Center**: Access e-books and PDF guides offline

### 🏥 Emergency Organizations Directory
- Comprehensive list of emergency services in Kenya
- Hospitals, ambulance services, and emergency hotlines
- Contact information and service descriptions

### 👨‍💼 Admin Dashboard
- User management with full CRUD operations
- Tutorial and organization content management
- Analytics and platform statistics
- Secure role-based access control

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible component library
- **Lucide React** - Modern icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Row Level Security (RLS)
  - Real-time subscriptions

### AI Integration
- **OpenRouter API** - Access to multiple AI models
- Edge functions for secure API communication

### State Management & Routing
- **React Router DOM** - Client-side routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling and validation

### UI/UX Libraries
- **qrcode.react** - QR code generation
- **Sonner** - Toast notifications
- **Radix UI** - Accessible component primitives

---

## 📁 Project Structure

```
uhai-assist-link/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Enhanced footer with CTA
│   │   └── Layout.tsx       # Page layout wrapper
│   ├── hooks/
│   │   ├── use-mobile.tsx   # Responsive breakpoint hook
│   │   └── use-toast.ts     # Toast notification hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client config
│   │       └── types.ts     # Generated database types
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── Index.tsx           # Home page with hero & stats
│   │   ├── Auth.tsx            # Login & signup
│   │   ├── Services.tsx        # AI assistant page
│   │   ├── Learn.tsx           # Learning center
│   │   ├── About.tsx           # About the platform
│   │   ├── Contact.tsx         # Contact form
│   │   ├── UserDashboard.tsx   # User dashboard
│   │   ├── UserProfilePage.tsx # Comprehensive profile editor
│   │   ├── UserQRPage.tsx      # QR code management
│   │   ├── AdminDashboard.tsx  # Admin control panel
│   │   ├── PublicProfileView.tsx # Public profile via QR
│   │   └── NotFound.tsx        # 404 page
│   ├── App.tsx              # Main app component with routing
│   ├── index.css            # Global styles & animations
│   └── main.tsx             # App entry point
├── supabase/
│   ├── config.toml          # Supabase configuration
│   └── migrations/          # Database migrations
├── .env                     # Environment variables
├── tailwind.config.ts       # Tailwind configuration
├── vite.config.ts           # Vite configuration
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **bun** package manager
- **Supabase Account** - [Sign up](https://supabase.com/)
- **OpenRouter API Key** - [Get yours](https://openrouter.ai/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/uhai-assist-link.git
   cd uhai-assist-link
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.com/)
   - Run the database migrations from `supabase/migrations/`
   - Enable Email Authentication in Supabase Dashboard
   - Configure auto-confirm for email signups (Settings → Auth)

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

5. **Add OpenRouter API Key**
   
   For AI functionality, add your OpenRouter API key to Supabase secrets:
   - Go to your Supabase project dashboard
   - Navigate to Settings → Edge Functions → Secrets
   - Add: `OPENROUTER_API_KEY=your_openrouter_key`

6. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Default Admin Credentials

To access the admin dashboard at `/dashboard/admin`:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

> ⚠️ **Important**: Change these credentials after first login in production!

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | ✅ Yes |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | ✅ Yes |

### Supabase Edge Function Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | ✅ Yes (for AI) |

---

## 🌐 Deployment

### Recommended: Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Add environment variables from `.env`
   - Click "Deploy"

### Alternative: Netlify, Railway, or Render

The project is compatible with any modern static hosting platform. Just ensure:
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables are configured

### Supabase Edge Functions

Deploy edge functions separately:
```bash
supabase functions deploy
```

---

## 📸 Screenshots

> _Add screenshots here once the application is deployed_

### Home Page
![Home Page](./screenshots/home.png)

### AI Assistant
![AI Assistant](./screenshots/ai-assistant.png)

### User Profile
![User Profile](./screenshots/profile.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/admin.png)

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Mobile App** - React Native version for iOS and Android
- [ ] **Voice Assistant** - Hands-free emergency guidance
- [ ] **Multi-language Support** - Swahili, Kikuyu, and other local languages
- [ ] **Offline Mode** - Access critical information without internet
- [ ] **Emergency Video Calls** - Direct connection with medical professionals
- [ ] **Community Features** - Forum for first aid tips and experiences
- [ ] **Wearable Integration** - Sync with smartwatches and fitness trackers
- [ ] **SMS Alerts** - Emergency notifications via text message
- [ ] **Geolocation Services** - Find nearest hospitals and emergency services
- [ ] **Medical History Export** - Download your data in standard formats

### Advanced Features
- AI-powered symptom checker
- Integration with national emergency systems
- Blockchain-verified medical credentials
- Real-time ambulance tracking
- Mental health crisis support
- Disaster response coordination

---

## 👥 Contributors

### Core Team
- **Project Lead** - [Your Name](https://github.com/yourusername)
- **Backend Developer** - [Name](https://github.com/username)
- **UI/UX Designer** - [Name](https://github.com/username)

### How to Contribute

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Need Help?

- 📧 Email: support@uhailink.com
- 💬 Discord: [Join our community](https://discord.gg/uhailink)
- 📚 Documentation: [docs.uhailink.com](https://docs.uhailink.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/uhai-assist-link/issues)

### Emergency Contacts (Kenya)

- **Emergency Hotline**: 999 / 112
- **Ambulance Services**: 999
- **Police**: 999
- **Red Cross**: +254 703 037 000

---

## 🙏 Acknowledgments

- **Supabase** - For the amazing backend platform
- **Shadcn UI** - For beautiful, accessible components
- **OpenRouter** - For AI model access
- **Lovable** - For the development platform
- **Kenya Red Cross** - For emergency response inspiration

---

<p align="center">
  <strong>Built with ❤️ in Kenya</strong><br>
  <em>Saving lives, one click at a time</em>
</p>

---

## 🔗 Links

- **Live Demo**: [uhailink.vercel.app](https://uhailink.vercel.app)
- **Documentation**: [docs.uhailink.com](https://docs.uhailink.com)
- **GitHub**: [github.com/yourusername/uhai-assist-link](https://github.com/yourusername/uhai-assist-link)
- **Lovable Project**: [lovable.dev/projects/445b02f5-4368-4db3-b0f8-ae275492160b](https://lovable.dev/projects/445b02f5-4368-4db3-b0f8-ae275492160b)
