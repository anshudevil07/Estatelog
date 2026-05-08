# EstateFlow – Real Estate SaaS CRM Dashboard

A modern, production-ready real estate CRM dashboard built with React, Vite, and Tailwind CSS. EstateFlow helps real estate agents and agencies manage properties, track leads, monitor analytics, and close deals efficiently.

![EstateFlow Dashboard](https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)

---

## ✨ Features

### 🏠 Property Management
- Add, edit, and delete properties
- Grid and table view modes
- Advanced filtering (status, type, price)
- Search by name or location
- Image upload with preview
- Property detail modal
- Pagination support

### 👥 Lead Management
- Track and manage leads
- Assign leads to agents
- Lead status tracking (New, Contacted, Interested, Closed)
- Source tracking (Website, Referral, LinkedIn, etc.)
- Lead detail drawer with full information
- Mobile-responsive cards

### 📊 Analytics Dashboard
- Revenue analytics with trend charts
- Property sales tracking
- Lead conversion metrics
- Property type distribution (pie chart)
- Weekly activity monitoring
- Interactive Recharts visualizations

### 🤝 Agent Management
- View all team agents
- Performance metrics (sales, active deals, revenue)
- Agent profiles with contact info
- Specialization and location tracking
- Rating system

### ⚙️ Settings
- Profile management with avatar upload
- Password change
- Notification preferences
- Dark/Light theme toggle
- Appearance customization

### 🎨 UI/UX Features
- **Dark Mode** – Persistent theme with localStorage
- **Responsive Design** – Mobile, tablet, and desktop optimized
- **Smooth Animations** – Hover effects, transitions, skeleton loaders
- **Toast Notifications** – Success, error, info, warning messages
- **Modal & Drawer** – Clean overlays for forms and details
- **Breadcrumbs** – Easy navigation tracking
- **Status Badges** – Visual status indicators
- **Empty States** – User-friendly empty data screens

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router DOM 7 |
| **Charts** | Recharts 2 |
| **Icons** | React Icons (Heroicons) |
| **HTTP Client** | Axios |
| **State Management** | Context API |
| **Backend** | Mock API (simulated async calls) |

---

## 📁 Project Structure

```
estateflow/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Images and static assets
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── Breadcrumbs.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── ChartCard.jsx
│   │   ├── property/        # Property-specific components
│   │   │   ├── PropertyModal.jsx
│   │   │   └── PropertyDetailModal.jsx
│   │   └── leads/           # Lead-specific components
│   │       ├── LeadModal.jsx
│   │       └── LeadDetailDrawer.jsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── data/                # Mock data
│   │   └── mockData.js
│   ├── layouts/             # Layout components
│   │   └── DashboardLayout.jsx
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── PropertiesPage.jsx
│   │   ├── LeadsPage.jsx
│   │   ├── AgentsPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── routes/              # Route protection
│   │   └── ProtectedRoute.jsx
│   ├── services/            # API service layer
│   │   └── api.js
│   ├── utils/               # Utility functions
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── vercel.json              # Vercel deployment config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/estateflow.git
   cd estateflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 🔐 Authentication

The app uses a **mock authentication system** for demo purposes.

**Login Credentials:**
- Email: Any valid email (e.g., `alex@estateflow.com`)
- Password: Any password with 6+ characters (e.g., `demo1234`)

The demo user is stored in `localStorage` for persistent sessions.

---

## 📊 Mock Data

All data is simulated using mock JSON in `src/data/mockData.js`. The API service layer (`src/services/api.js`) simulates async calls with delays.

**To connect a real backend:**
1. Replace mock API calls in `src/services/api.js` with real Axios requests
2. Update endpoints to point to your backend API
3. Handle authentication tokens and error responses

---

## 🎨 Customization

### Change Theme Colors

Edit `src/index.css` and Tailwind config to change the primary color from violet to your brand color.

### Add New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/components/common/Sidebar.jsx`

### Modify Mock Data

Edit `src/data/mockData.js` to change properties, leads, agents, or analytics data.

---

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Production deployment**
   ```bash
   vercel --prod
   ```

The `vercel.json` file ensures proper SPA routing.

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Add `_redirects` file in `public/`:
   ```
   /*    /index.html   200
   ```

---

## 🧪 Testing

Currently, the project does not include automated tests. To add testing:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create test files alongside components (e.g., `Button.test.jsx`).

---

## 🐛 Known Issues

- Large bundle size warning (773 KB) – can be optimized with code splitting
- Mock authentication – replace with real auth for production
- No backend integration – API calls are simulated

---

## 🔮 Future Improvements

- [ ] Add real backend integration (Firebase/Supabase)
- [ ] Implement code splitting for smaller bundles
- [ ] Add unit and integration tests
- [ ] Add property image gallery
- [ ] Implement real-time notifications
- [ ] Add export to PDF/CSV functionality
- [ ] Multi-language support (i18n)
- [ ] Advanced filtering with date ranges
- [ ] Calendar view for appointments
- [ ] Email integration for lead communication

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ by a frontend developer passionate about creating real-world SaaS applications.

---

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com) for property images
- [Heroicons](https://heroicons.com) for beautiful icons
- [Recharts](https://recharts.org) for chart components
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling

---

## 📧 Contact

For questions or feedback, reach out via:
- GitHub Issues
- Email: your.email@example.com

---

**⭐ If you find this project helpful, please give it a star on GitHub!**
