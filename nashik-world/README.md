# Nashik World 🌍

> A modern civic issue reporting and tracking platform for the citizens of Nashik, Maharashtra. Built with Next.js, Firebase, and Google Maps integration.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.7.1-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![GitHub stars](https://img.shields.io/github/stars/yourusername/nashik-world?style=social)](https://github.com/yourusername/nashik-world/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/nashik-world?style=social)](https://github.com/yourusername/nashik-world/network)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/nashik-world)](https://github.com/yourusername/nashik-world/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/nashik-world)](https://github.com/yourusername/nashik-world/pulls)
[![GitHub license](https://img.shields.io/github/license/yourusername/nashik-world)](https://github.com/yourusername/nashik-world/blob/main/LICENSE)

## 🚀 Features

### 📍 Civic Issue Reporting
- **Multi-type Issues**: Report potholes, water leaks, garbage, fallen trees, streetlight issues, disasters, and more
- **Location-based**: Pinpoint exact location using Google Maps integration
- **Photo Upload**: Attach images to issues using Cloudinary
- **Real-time Updates**: Track issue status and progress
- **Community Engagement**: Upvote and comment on issues

### 🗺️ Interactive Map
- **Google Maps Integration**: Visual representation of all civic issues
- **Filtering**: Filter by issue type, status, and urgency
- **Custom Markers**: Color-coded markers for different issue types
- **Responsive Design**: Works seamlessly on mobile and desktop

### 📊 Transparency Dashboard
- **Issue Tracking**: Monitor status, assignments, and resolution timelines
- **Statistics**: View comprehensive analytics and metrics
- **Progress Updates**: Real-time status updates and notifications
- **Resolution Timeline**: Track issue resolution progress

### 🎮 Gamification System
- **Civic Points**: Earn points for reporting and resolving issues
- **Leaderboards**: Compete with other citizens
- **Achievements**: Unlock badges and rewards
- **Community Drives**: Participate in organized civic activities

### 🌐 Multi-language Support
- **Internationalization**: Support for multiple languages
- **Language Switching**: Easy language toggle functionality
- **Localized Content**: Region-specific content and messaging

### 🔐 Authentication & Security
- **Firebase Auth**: Secure user authentication
- **Role-based Access**: Different permissions for citizens and officials
- **Data Protection**: Secure data handling and storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Maps**: Google Maps JavaScript API
- **Image Storage**: Cloudinary
- **State Management**: React Hooks
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nashik-world.git
cd nashik-world
```

> **Note**: Replace `yourusername` with your actual GitHub username in the clone URL.

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore Database, and Storage
3. Copy your Firebase configuration to `.env.local`
4. Set up Firestore security rules (see `firestore.rules`)
5. Configure Storage rules (see `storage.rules`)

### 5. Google Maps Setup

Follow the detailed setup guide in [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)

### 6. Cloudinary Setup

1. Create a Cloudinary account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your `.env.local` file

### 7. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
nashik-world/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── report/           # Issue reporting
│   ├── transparency/     # Transparency dashboard
│   ├── gamification/     # Gamification features
│   └── profile/          # User profile
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── ...              # Feature-specific components
├── lib/                  # Utility functions and configurations
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── public/              # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🌍 Issue Types

The platform supports the following civic issue types:

- 🕳️ **Potholes** - Road surface damage
- 💧 **Water Leaks** - Water supply issues
- 🗑️ **Garbage** - Waste management problems
- 🌳 **Fallen Trees** - Tree-related hazards
- 💡 **Street Lights** - Lighting infrastructure
- ⚠️ **Disasters** - Emergency situations
- 🚌 **Bus Service** - Public transport issues
- 📝 **Other** - Miscellaneous civic issues

## 🎯 Key Features in Detail

### Issue Reporting Flow
1. User selects issue type and location
2. Uploads photos and provides description
3. System assigns urgency level automatically
4. Issue is posted to the community
5. Officials can assign and track progress
6. Users receive updates on resolution

### Gamification System
- **Points System**: Earn points for reporting, upvoting, and resolving issues
- **Leaderboards**: Monthly and all-time leaderboards
- **Achievements**: Badges for milestones and contributions
- **Community Drives**: Organized civic activities with rewards

### Transparency Features
- **Real-time Tracking**: Live updates on issue status
- **Official Assignments**: Track which department is handling each issue
- **Resolution Timelines**: Estimated and actual resolution times
- **Verification System**: Community verification of resolved issues

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Make** your changes
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features

### Issue Reporting

Found a bug or have a feature request? Please [open an issue](https://github.com/yourusername/nashik-world/issues/new) and include:

- **Bug reports**: Steps to reproduce, expected vs actual behavior
- **Feature requests**: Description of the feature and its benefits
- **Environment**: OS, browser, Node.js version

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Firebase** for backend services
- **Google Maps** for location services
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Nashik Municipal Corporation** for civic data support

## 📞 Support

For support and questions:
- 📧 Email: yashvchavan07@gmail.com
- 💬 Discord: [Join our community](https://discord.gg/nashikworld)
- 📱 WhatsApp: +91-9657846967
- 🐛 [GitHub Issues](https://github.com/yourusername/nashik-world/issues) - For bugs and feature requests
- 💡 [GitHub Discussions](https://github.com/yourusername/nashik-world/discussions) - For questions and ideas

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] AI-powered issue classification
- [ ] Integration with municipal systems
- [ ] Advanced analytics dashboard
- [ ] Multi-city expansion
- [ ] Blockchain-based transparency
- [ ] Voice reporting feature
- [ ] AR-powered issue visualization

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/nashik-world)
![GitHub contributors](https://img.shields.io/github/contributors/yourusername/nashik-world)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/yourusername/nashik-world)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/nashik-world&type=Date)](https://star-history.com/#yourusername/nashik-world&Date)

---

<div align="center">

**Made with ❤️ for Nashik by the Nashik World Team**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/nashik-world)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/nashik-world)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/nashikworld)

</div>
