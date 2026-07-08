# Career-Bridge

Career-Bridge is a modern, responsive Human Resources (HR) application prototype designed to streamline HR processes, enhance employee engagement, and provide actionable insights for management. Built with cutting-edge web technologies, it offers a seamless user experience and robust performance.

## 🚀 Features

- **Admin Dashboard**: Comprehensive overview of HR metrics, employee statistics, and recent activities.
- **Employee Management**: Efficient tools for tracking and managing employee profiles and data.
- **Analytics & Reporting**: Interactive charts and data visualizations for informed decision-making.
- **Modern UI/UX**: Clean, intuitive interface with smooth animations and responsive design.
- **Secure Authentication**: Integrated Firebase authentication for safe access control.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Emotion
- **UI Components**: Shadcn UI (Radix UI) & Material UI
- **Icons**: Lucide React & MUI Icons
- **Animations**: Framer Motion
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form
- **Data Visualization**: Recharts
- **Backend/BaaS**: Firebase (Authentication, Firestore, Storage)

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MahmoudGamal-AI/Career-Bridge.git
   cd Career-Bridge
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Firebase configuration and other necessary secrets.
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## 🏗️ Project Structure

```
src/
├── assets/        # Static assets like images and global styles
├── components/    # Reusable UI components (common, layout, etc.)
├── pages/         # Application pages/routes (HomePage, AdminDashboard, etc.)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and library configurations (Firebase, etc.)
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
└── main.tsx       # Entry point
```

## 📜 Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Firebase](https://firebase.google.com/)