# Hassaan Ali Rana — Personal Portfolio Website

A premium, monochromatic editorial developer portfolio engineered with **React 18**, **Vite 6**, **Tailwind CSS**, **Framer Motion**, and **Three.js**.

![Portfolio Preview](src/assets/hero-portrait.webp)

---

## 🌟 Overview

This repository contains the source code for my personal software engineering portfolio. The website highlights full-stack web applications, real-time WebSocket systems, IoT telemetry monitoring, and enterprise multi-tenant management platforms built with **Laravel 12**, **React**, **PostgreSQL**, **MySQL**, **MongoDB**, **Redis**, and **Node.js**.

- **Live URL**: [https://hassaan.dev/](https://hassaan.dev/) *(or your deployed domain)*
- **GitHub Repository**: [https://github.com/hassaanrana07/Personal-Portfolio-Website](https://github.com/hassaanrana07/Personal-Portfolio-Website)

---

## ✨ Key Features

- **Monochrome Editorial Aesthetic**: Premium dark theme (`#0f0f0f` background, `#161616` surface, `#f2f2f0` cream typography, `#8a8a8a` secondary grey, thin borders, generous whitespace).
- **Seamless Hero Marquee**: Single horizontal line continuous loop marquee (`Hassaan Ali Rana`) with custom background cutout framing.
- **Sticky Stacking Projects Showcase**: Framer Motion scroll-driven showcase featuring layered depth scaling (`targetScale = 1 - (total - 1 - i) * 0.03`) across 6 featured case studies.
- **Dedicated Project Case Studies (`/projects/:projectSlug`)**: In-depth architectural case studies detailing system overviews, verified folder structures, relational schemas, RBAC rules, and technical challenges.
- **Interactive Tech Stack Grid**: Comprehensive technology matrix with official Devicon and Simple-Icons badges.
- **Services Ticker**: Infinite marquee ticker with hover-pause and click-to-select state management.
- **Accessible & Performant**: Screen reader accessible (`aria-label`), keyboard navigable, 0 dependencies with vulnerabilities (`npm audit`), and 0 build errors.

---

## 🛠️ Project Showcase

The portfolio showcases six full-stack personal engineering projects:

| # | Project Name | Type | Tech Stack | Repository |
|---|---|---|---|---|
| **01** | **RentBro** | Property & Rental Management | Laravel 12, React, MySQL, Tailwind CSS | [GitHub →](https://github.com/hassaanrana07/Rent-Bro-Property-and-Rental-Management-System) |
| **02** | **BrickBeam** | Construction Operations & Resource Management | Laravel 12, React, MySQL, Tailwind CSS | [GitHub →](https://github.com/hassaanrana07/BrickBeam-Construction-Management-System-) |
| **03** | **AirSense** | Real-Time Air Quality & Telemetry Network | React, Node.js, WebSockets, Chart.js | [GitHub →](https://github.com/hassaanrana07/AirSense-Real-Time-Air-Quality-Monitoring---Alert-System) |
| **04** | **Vyra** | Real-Time Social Network Platform | React, Node.js, Express, MongoDB, Socket.IO | [GitHub →](https://github.com/hassaanrana07/vyra-social-network) |
| **05** | **ProjectFlow** | Project & Task Velocity Management | React, TypeScript, Node.js, Express | [GitHub →](https://github.com/hassaanrana07/ProjectFlow-Project-Management-System) |
| **06** | **ContentHub** | Enterprise Headless CMS & Multi-Tenant SaaS | Laravel 12, React, PostgreSQL, Redis, Inertia.js | [GitHub →](https://github.com/hassaanrana07/ContentHub-CMS-Multi-Creator-Platform) |

---

## 🚀 Technologies & Dependencies

- **Frontend Core**: React 18, Vite 6, Tailwind CSS
- **Animations & Graphics**: Framer Motion, Three.js, Lucide React
- **Icons & Typography**: Devicon, Simple Icons, Sora, Inter, JetBrains Mono
- **Build System**: Vite 6, PostCSS, Autoprefixer

---

## 💻 Local Development

Follow these steps to run the portfolio locally:

### 1. Clone the repository
```bash
git clone https://github.com/hassaanrana07/Personal-Portfolio-Website.git
cd Personal-Portfolio-Website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000/](http://localhost:3000/) in your browser.

### 4. Build for production
```bash
npm run build
```
The optimized production bundle will be generated in the `/dist` directory.

---

## 📄 License & Attribution

Designed and developed by **Hassaan Ali Rana**.

- **Portfolio**: [hassaan.dev](https://hassaan.dev)
- **GitHub**: [@hassaanrana07](https://github.com/hassaanrana07)
- **LinkedIn**: [hassaanaliakbar](https://linkedin.com/in/hassaanaliakbar)
- **Email**: [hassaanalee07@gmail.com](mailto:hassaanalee07@gmail.com)
