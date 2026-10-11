# Final Manual QA Execution Checklist

**Scheduled Execution Date**: October 10, 2026  
**Candidate & Author**: Hassaan Ali Akbar  
**Environment**:
- Frontend: `http://localhost:3000`
- Admin CMS: `http://localhost:3000/#admin`
- Backend API: `http://localhost:5000`
- Database: MySQL 8.0 / `portfolio_db`

---

## 1. Startup & Environment Preparation

Run the following commands in order to prepare the environment:

1. **Verify MySQL 8.0 Daemon**:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="C:\Users\Usama\.gemini\antigravity\mysql8_data" --port=3306 --console
   ```
2. **Start Backend API Server**:
   ```powershell
   cd "e:\Hassaan\My Projects\portfolio 2\server"
   node server.js
   ```
3. **Start Frontend Client**:
   ```powershell
   cd "e:\Hassaan\My Projects\portfolio 2"
   npm run dev
   ```
4. **Open Browser**:
   Navigate to `http://localhost:3000` in Google Chrome or Microsoft Edge.

---

## 2. High-Priority Manual QA Checklist

| Area | Test Step & User Journey | Expected Outcome | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Hero** | 1. Open `http://localhost:3000`<br>2. Check profile name, title, status badges, and social icons. | Displays "Hassaan Ali Akbar", "Full Stack Developer", "Open for Opportunities", "Full-Time". | | 🔲 |
| **Hero Actions** | 1. Click "Explore Work"<br>2. Click "Get In Touch"<br>3. Click "Download Resume" | "Explore Work" scrolls to `#projects`. "Get In Touch" scrolls to `#contact`. Resume opens/downloads PDF. | | 🔲 |
| **About** | 1. Scroll to About section.<br>2. Inspect narrative, metrics cards, Work timeline, and Education timeline. | Displays accurate bio, Ronnie Ridge Technology / FentixTech / Codiveo work items, and VU BS CS education. | | 🔲 |
| **TechStack 3D** | 1. Scroll to TechStack.<br>2. Click play/pause on 3D Solar System.<br>3. Adjust orbit speed slider.<br>4. Click a skill node.<br>5. Click "Switch to Grid View". | Canvas pauses/resumes, orbital planets speed up/slow down, node details display in inspector, Grid view shows structured badge matrix. | | 🔲 |
| **Projects Showcase** | 1. Scroll to Projects.<br>2. Click category filters ("Full-Stack", "Real-Time", "CMS / SaaS", "Management", "Data / Monitoring").<br>3. Verify BrickBeam is #01 Flagship. | Projects filter dynamically without page reload. BrickBeam is elevated with Amber accent. | | 🔲 |
| **Case Study Modal** | 1. Click "View Case Study" on BrickBeam.<br>2. Verify Architecture, Database schema, Decisions, and Challenges.<br>3. Click back button or close modal. | Case study renders deep-dive architectural view with code structure and back navigation. | | 🔲 |
| **Services** | 1. Scroll to Services.<br>2. Hover over each of the 6 cards. | Cards highlight with glassmorphism borders and display clear descriptions with Lucide icons. | | 🔲 |
| **Contact Form** | 1. Scroll to Contact.<br>2. Submit empty form (verify error validation).<br>3. Enter valid Name, Email, Subject, Message.<br>4. Click "Send Message". | Client blocks empty form with red warnings. Valid submission displays green success toast and clears form. | | 🔲 |
| **Footer** | 1. Scroll to Footer.<br>2. Test GitHub, LinkedIn, Instagram links.<br>3. Click "Back to Top" arrow. | Links open correct profile tabs in new windows. "Back to Top" smoothly scrolls viewport to hero. | | 🔲 |
| **Admin Login** | 1. Navigate to `http://localhost:3000/#admin`<br>2. Enter invalid password (verify error toast).<br>3. Enter `admin@hassaan.dev` / `admin123456`. | Invalid password triggers "Invalid administrative credentials." Valid credentials redirect to Admin Dashboard. | | 🔲 |
| **Admin Overview** | 1. Inspect Overview tab in Admin CMS. | Displays metric cards for Total Projects (6), Skills (21), Experience (5), Services (6), and Unread Messages. | | 🔲 |
| **Admin Profile Edit** | 1. Go to Profile tab in Admin CMS.<br>2. Edit Tagline and click Save.<br>3. Open `http://localhost:3000` in new tab. | Save toast confirms update. Public hero section instantly reflects the updated tagline upon refresh. | | 🔲 |
| **Admin Account Security** | 1. Scroll to Section 5 in Profile tab.<br>2. Enter current password.<br>3. Change email or password.<br>4. Click "Update Login Credentials". | Green success toast confirms update. Logging out and logging in with new credentials succeeds. | | 🔲 |
| **Admin Projects CRUD** | 1. Go to Projects tab in Admin CMS.<br>2. Edit a project subtitle or add a new project.<br>3. Test Reorder up/down buttons.<br>4. Test Delete with confirmation modal. | In-app confirmation modal prompts before delete. Public portfolio reflects updated project sequence. | | 🔲 |
| **Admin Skills CRUD** | 1. Go to Skills tab in Admin CMS.<br>2. Add or modify a skill's orbit radius and speed.<br>3. Save and check public 3D TechStack. | 3D Solar System animates the skill with new orbital parameters. | | 🔲 |
| **Admin Messages** | 1. Go to Messages tab in Admin CMS.<br>2. Find the message submitted during public testing.<br>3. Click "Mark as Read".<br>4. Click Delete. | Unread badge clears. Message deletes cleanly after in-app modal confirmation. | | 🔲 |
| **Admin Logout** | 1. Click "Logout" in Admin CMS header.<br>2. Refresh `http://localhost:3000/#admin`. | Session clears immediately. Refreshing `#admin` renders Admin Login form (session cannot be restored after logout). | | 🔲 |
| **Responsive Viewports** | 1. Press F12 in Chrome.<br>2. Test Mobile (375px), Tablet (768px), and Desktop (1440px). | Navigation hamburger toggles cleanly on mobile. Typography and cards wrap without horizontal scrollbar overflow. | | 🔲 |

---

## 3. Test Credentials & Reference Data

- **Admin Portal**: `http://localhost:3000/#admin`
- **Admin Email**: `admin@hassaan.dev`
- **Admin Password**: `admin123456`
- **Flagship Project**: BrickBeam (#01)
- **Primary Accent**: Amber (`#f59e0b` / `#FF9A3D`)
- **Theme Mode**: Monochromatic Dark (`#0f0f0f`)
