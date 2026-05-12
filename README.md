# ZCAT — AI-Powered Assessment Platform

![ZCAT Banner](https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop)

ZCAT is an enterprise-grade, futuristic assessment and coding platform designed for high-stakes examinations, technical recruitment, and campus hiring. Built with a focus on integrity, scalability, and user experience.

## 🚀 Key Features

- **AI Proctoring**: Real-time face detection, tab monitoring, and audio analysis to ensure exam integrity.
- **Advanced Code Editor**: Full-screen coding environment with multi-language support (Python, JS, Java, C++, C) and real-time execution.
- **Live Monitoring**: Dashboard for recruiters to monitor candidate webcam feeds and violation logs in real-time.
- **AI Interview Prep**: Interactive AI-powered technical interviews with instant behavioral scoring.
- **Comprehensive Analytics**: Skill heatmaps, performance trends, and ranking systems for candidates and admins.
- **Glassmorphism UI**: Ultra-modern, premium dark-neon theme with smooth Framer Motion animations.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Particles**: [tsParticles](https://particles.js.org/)

## 📦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/zcat.git
   cd zcat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

- `src/app/`: Next.js App Router (pages and layouts)
- `src/components/`: Reusable UI components (Shared, Landing, Dashboard)
- `src/lib/`: Utility functions, mock data, and global stores
- `src/types/`: TypeScript interfaces and definitions
- `src/styles/`: Global styles and Tailwind configurations

## 🛡️ Security & Integrity

ZCAT employs multiple layers of security:
- **Browser Lockdown**: Prevents tab switching and copy-paste during exams.
- **Face Tracking**: Detects multiple faces, missing faces, or unrecognized individuals.
- **Activity Logging**: Full audit trail of every candidate action.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the ZCAT Team.
