# 🛍️ PU Marketplace

<div align="center">
  <img src="https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<p align="center">
  <strong>A modern student-to-student marketplace built for Purvanchal University</strong>
</p>

---

## 📖 About The Project

**PU Marketplace** is a fully-featured e-commerce platform designed specifically for Purvanchal University students to buy, sell, and connect with each other. Whether you're looking for second-hand textbooks, electronics, or anything else – this is your go-to marketplace!

Built with modern web technologies and a stunning glassmorphic UI, PU Marketplace delivers a seamless shopping experience with real-time updates, role-based access, and powerful admin controls.

---

## ✨ Key Features

### 🎨 **Beautiful UI/UX**
- Glassmorphic design with smooth animations
- Dark/Light mode support
- Fully responsive across all devices
- Parallax effects and dynamic carousels
- Confetti celebration effects for milestones

### 🛒 **Product Management**
- Advanced search and filter system
- Category-based product browsing
- Product cards with detailed information
- Sponsored product carousel
- Mark products as sold/available

### 👥 **User Roles & Authentication**
- **Public Users**: Browse and search products
- **Sellers**: Create, edit, and manage their own products
- **Admins**: Full control over products, users, carousel, and sponsored items
- Secure authentication via Supabase Auth
- Profile management system

### 📊 **Seller Dashboard**
- Easy product creation and management
- Upload product images (max 1MB)
- Track sales and availability
- First product celebration with confetti 🎉

### 🎯 **Admin Dashboard**
- Manage hero carousel slides
- Control sponsored products
- User role management (public/seller/admin)
- Full platform oversight

### 🎪 **Hero Section & Carousels**
- Dynamic hero carousel with smooth transitions
- Animated marquee banner
- Sponsored products showcase
- Auto-rotating slides with manual controls

---

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing

### **Styling & Animation**
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Unstyled, accessible components

### **Backend & Database**
- **Supabase** - Complete backend solution
  - PostgreSQL Database
  - Real-time subscriptions
  - Authentication & Authorization
  - File storage (product & carousel images)
  - Row Level Security (RLS) policies

### **State Management & Forms**
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### **Additional Libraries**
- **Lucide React** - Beautiful icons
- **React Icons** - Additional icon set
- **Sonner** - Toast notifications
- **Embla Carousel** - Carousel functionality

---

## 🏗️ Architecture

### **Database Schema**

#### **Products Table**
```sql
- id (uuid, primary key)
- title (text)
- description (text)
- price (numeric)
- image_url (text)
- category (text)
- seller_id (uuid, references profiles)
- is_available (boolean)
- is_sponsored (boolean)
- created_at (timestamp)
```

#### **Carousel Table**
```sql
- id (uuid, primary key)
- image_url (text)
- title (text)
- subtitle (text)
- link_url (text)
- display_order (integer)
- is_active (boolean)
- created_at (timestamp)
```

#### **Profiles Table**
```sql
- id (uuid, primary key)
- email (text)
- full_name (text)
- created_at (timestamp)
```

#### **User Roles Table**
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles)
- role (text: 'public' | 'seller' | 'admin')
- created_at (timestamp)
```

### **Authentication Flow**
1. User signs up/logs in via Supabase Auth
2. Profile automatically created in profiles table
3. Default role assigned (public)
4. Admins can promote users to seller/admin roles
5. Role-based access control throughout the app

---

## 📁 Folder Structure

```
pu-marketplace/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── ProductCard.tsx # Product display card
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── ThemeContext.tsx# Theme management
│   ├── pages/               # Page components
│   │   ├── Index.tsx       # Home/marketplace page
│   │   ├── Auth.tsx        # Login/signup page
│   │   ├── SellerDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── constants/           # App constants
│   │   └── categories.ts   # Product categories
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External integrations
│   │   └── supabase/       # Supabase client & types
│   ├── lib/                 # Utility functions
│   ├── index.css           # Global styles
│   └── main.tsx            # App entry point
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase config
├── public/                 # Static assets
└── ...config files
```

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm/bun
- A Supabase account (free tier works!)

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/pu-marketplace.git
cd pu-marketplace
```

### **Step 2: Install Dependencies**
```bash
npm install
# or
bun install
```

### **Step 3: Set Up Environment Variables**

Create a `.env` file in the root directory:

You can start from `.env.example` and fill in your own Supabase values.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

You can find these credentials in your Supabase project settings.

### **Step 4: Set Up Supabase**

1. Create a new project on [Supabase](https://supabase.com)
2. Run the database migrations (found in `supabase/migrations/`)
3. Set up Storage buckets:
   - `product_images` - For product photos
   - `carousel_images` - For hero carousel images
4. Configure Row Level Security (RLS) policies
5. Enable authentication providers (Email)

### **Step 5: Run the Development Server**
```bash
npm run dev
# or
bun dev
```

The app should now be running at `http://localhost:5173` 🎉

---

## 📱 Usage Guide

### **As a Public User**
1. Browse all available products on the homepage
2. Use search bar and filters to find specific items
3. View product details including seller contact
4. Sign up to become a seller

### **As a Seller**
1. Log in to your account
2. Navigate to Seller Dashboard
3. Click "Add Product" to list items
4. Upload images, set prices, and add descriptions
5. Manage your products (edit/delete/mark as sold)
6. Get a confetti celebration for your first product! 🎉

### **As an Admin**
1. Access Admin Dashboard
2. Manage hero carousel slides
3. Toggle sponsored status on products
4. Manage user roles and permissions
5. Full oversight of the marketplace

---

## 🌐 Deployment

### **Build for Production**
```bash
npm run build
# or
bun run build
```

This creates an optimized production build in the `dist/` folder.

### **Deploy Options**
- **Vercel** (Recommended) - Zero config deployment
- **Netlify** - Simple and fast
- **GitHub Pages** - Free static hosting
- **Your own server** - Deploy the `dist/` folder

### **Environment Variables**
Don't forget to set your environment variables in your hosting platform!

---

## 🔮 Future Updates

Here's what's coming next to PU Marketplace:

- [ ] **Real-time Chat System** - Direct messaging between buyers and sellers
- [ ] **Advanced Analytics** - Dashboard with sales insights and trends
- [ ] **Student ID Verification** - Verify PU students for added trust
- [ ] **Rating & Review System** - Let users rate sellers and products
- [ ] **Mobile App** - Native Android/iOS apps
- [ ] **Payment Integration** - Secure online payment options
- [ ] **Wishlist Feature** - Save favorite products
- [ ] **Email Notifications** - Alerts for new messages and sales
- [ ] **Advanced Search** - AI-powered product recommendations
- [ ] **Multi-language Support** - Hindi and English

---

## 📸 Screenshots & Demo

> **UI videos and screenshots are available!**

Check out the live demo or watch the feature walkthrough to see PU Marketplace in action. The glassmorphic design, smooth animations, and intuitive interface make for an amazing user experience.

---

## 🎨 Design System

### **Color Palette**
- Primary: Purple gradient (`#8B5CF6`)
- Background: Dynamic (dark/light mode)
- Glass effects with blur and transparency
- Smooth color transitions

### **Typography**
- Headings: Bold gradient text
- Body: Clean, readable fonts
- Responsive font sizes

### **Animation Principles**
- Smooth page transitions
- Hover effects on interactive elements
- Loading states with shimmer effects
- Celebration animations for milestones

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Happy Pandit**  
*Student, Purvanchal University*

- GitHub: [@happypandit](https://github.com/happypandit)
- Instagram: [@kulbhaskartiwari25](https://instagram.com/kulbhaskartiwari25)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

Special thanks to:
- **Purvanchal University** students who inspired this project
- **Supabase** for the amazing backend platform
- **shadcn** for the beautiful UI components
- **The open-source community** for incredible tools and libraries

---

## 💡 Why I Built This

As a student at Purvanchal University, I noticed that there wasn't a centralized platform for students to buy and sell items within our community. I wanted to create something that would make it easier for students to connect and trade, while also learning modern web development technologies.

This marketplace is built by students, for students. It's more than just a project – it's a tool to help our community thrive.

---

<div align="center">
  <p><strong>Made with ❤️ and lots of ☕ by Happy Pandit</strong></p>
  <p><em>"Keep hustling, your creativity builds your future."</em></p>
  
  <br />
  
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
