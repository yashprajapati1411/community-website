# SSPV Mandala Community Website

Official digital platform for the **Shree Sorathiya Prajapati Vikas Mandala** (SSPV Mandala), established in 1974. This portal preserves the cultural, genealogical, and architectural heritage of the Sorathiya Prajapati community while streamlining administrative services, events, and hall/hostel facility bookings.

---

## Overview

The SSPV Mandala Community Website serves as a modern Single Page Application (SPA) providing community members with dynamic access to public announcements, event registrations, historical surname databases, and a secured member dashboard. It consolidates trust operations (welfare funds, educational sponsorships, community space reservations) into a single, responsive web presence.

---

## Features

* **Responsive Site Shell**: A sticky header navigation [Navbar.tsx](file:///D:/gemini_cli/src/components/Navbar.tsx) featuring a backdrop blur filter and a mobile responsive drawer sidebar.
* **Auto-Scrolling Announcement Ticker**: The [Marquee.tsx](file:///D:/gemini_cli/src/components/Marquee.tsx) component runs a smooth infinite-loop CSS animation ticker for upcoming events, pausing on mouse hover.
* **Interactive Facility Booking**: The [Booking.tsx](file:///D:/gemini_cli/src/pages/Booking.tsx) page provides details on the Grand Hall and guest hostel rooms alongside an interactive availability calendar for July 2026, date range selectors, and inquiry forms.
* **Ancestral Genealogy Registry**: The [History.tsx](file:///D:/gemini_cli/src/pages/History.tsx) page hosts a searchable list of the 12 primary community branches and their ancestral trades, presented in a parchment-style horizontal scrolling track.
* **Secured Member Dashboard**: The [MemberPortal.tsx](file:///D:/gemini_cli/src/pages/MemberPortal.tsx) page provides credentialed login (`demo@sspv.org` / `demo123`), enabling:
  - Profile customization (saving contact, village, and address details in real-time).
  - A registered family members table.
  - A digital directory drill-down (Surnames $\rightarrow$ Family Heads list $\rightarrow$ Family unit member registers).
  - Annual audits and AGM report downloads.
* **Community Timeline**: The [Events.tsx](file:///D:/gemini_cli/src/pages/Events.tsx) timeline displays upcoming events (Navratri, Samuh Lagan) and registration buttons.
* **Visual Gallery**: The [Gallery.tsx](file:///D:/gemini_cli/src/pages/Gallery.tsx) archive highlights community infrastructure, stepwells, and traditional pottery artifacts.

---

## Technology Stack

The application is built on a clean, modern React developer stack:

* **Frontend Library**: [React 19](file:///D:/gemini_cli/package.json#L14-L15) (using functional components and hooks)
* **Build tool & Server**: [Vite 8](file:///D:/gemini_cli/package.json#L29)
* **Typing System**: [TypeScript 6](file:///D:/gemini_cli/package.json#L27)
* **Design Styling**: Vanilla CSS (utilizing global CSS variables in [index.css](file:///D:/gemini_cli/src/index.css) and scoped components style blocks)
* **Icon Set**: [Lucide React](file:///D:/gemini_cli/package.json#L13)

---

## Folder Structure

```text
D:/gemini_cli/
├── package.json                # Project dependencies and scripts
├── vite.config.ts              # Vite configuration
├── index.html                  # HTML template root
├── public/                     # Static global assets (hall & room images)
└── src/
    ├── main.tsx                # Application bootstrapper
    ├── App.tsx                 # App Shell & custom activeTab state router
    ├── index.css               # Global theme variables, typography, and classes
    ├── components/             # Reusable UI widgets
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── Marquee.tsx
    │   └── VisionMissionGoals.tsx
    └── pages/                  # Route level page views
        ├── Home.tsx
        ├── About.tsx
        ├── Committee.tsx
        ├── Booking.tsx
        ├── Events.tsx
        ├── Gallery.tsx
        ├── History.tsx
        └── MemberPortal.tsx
```

---

## Running the Project

Ensure you have [Node.js](https://nodejs.org) installed on your system.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
3. **Build for Production**:
   ```bash
   npm run build
   ```
4. **Preview Production Build locally**:
   ```bash
   npm run preview
   ```

---

## UI Design Philosophy

The website implements a curated **Heritage Earth Palette** representing the community's ancestral ties to brick masonry, dome construction, and terracotta craftsmanship:

* **Primary Clay Accents**: Terracotta primary (`#9f402d`) and Container (`#e2725b`) values.
* **Secondary Foliage Accents**: Sage Green (`#56642b`) and Container (`#d6e7a1`) tones.
* **Base Backgrounds**: Warm sand (`#fff8f6`) and parchment (`#f4edd9`) textures.
* **Typography**: Traditional literary headings (`'Playfair Display'`) paired with clean modern body lines (`'Inter'`).

---

## Current Status

* **Static Mock Data Setup**: Currently, all member listings, upcoming event dates, and stepwell histories are defined inside static arrays.
* **Authentication**: Simulated local login checks credentials `demo@sspv.org` / `demo123`.
* **State Routing**: Conditional page selection based on React `activeTab` states.

---

## Future Roadmap

1. **Routing Framework Integration**: Transition [App.tsx](file:///D:/gemini_cli/src/App.tsx) state routing to `react-router-dom` to support deep-linking and browser history.
2. **Unified State Management**: Introduce **Zustand** or Context API to centralize profile edits and share booking request information globally.
3. **Styles Optimization**: Refactor duplicate CSS properties (e.g. `.badge` and `.form-group` tags scattered across pages) into utility classes in [index.css](file:///D:/gemini_cli/src/index.css).
4. **Form Schemas**: Incorporate **React Hook Form** with **Zod** for advanced error handling on the Booking and Member Profile inputs.
5. **Backend Services**: Transition the current simulated datasets into a database structure backed by a server layer (Node.js/Express, PostgreSQL, or MongoDB).
