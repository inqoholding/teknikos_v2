# Coreveta — Product Requirements Document (PRD)

**Version:** 1.0 (Final) · **Status:** Active Development · **Project:** TeknikOS Rebranding to Coreveta

---

## 1. Executive Summary

### 1.1 The Problem
Over 800,000 technical service businesses in Indonesia (AC repair, plumbing, electrical contractors) rely on fragmented tools: WhatsApp groups for dispatching, handwritten notes for invoices, and spreadsheets for inventory. This leads to **double-bookings, lost revenue from missed routine services, and a lack of professional image.**

### 1.2 The Solution
**Coreveta** is a mobile-first, B2B SaaS platform specifically designed as a "Digital Operating System" for technical teams. It provides a centralized dashboard for owners and a simplified mobile interface for technicians to manage the entire job lifecycle — from dispatch to invoice — with integrated WhatsApp updates and technician GPS tracking.

---

## 2. Market Context & Personas

### 2.1 Target Market
*   **Primary Segment**: Small to medium technical service providers (bengkel/kontraktor) with 3–15 field technicians.
*   **Industries**: HVAC (AC), Plumbing, Electrical, Solar, and General Maintenance.

### 2.2 User Personas

| Persona | Role | Primary Pain Point | Goal in Coreveta |
|---------|------|--------------------|------------------|
| **Budi (Owner)** | Decision Maker | "I don't know where my technicians are or if we're forgetting invoice collection." | Visibility, cash flow management, and professional branding. |
| **Andi (Technician)** | Field User | "I have to keep scrolling WhatsApp to find the customer's address and job details." | Clear instructions, navigation, and easy photo/note uploads. |
| **Sinta (Admin)** | Operations | "Creating 20 manual invoices a day and following up on service contracts is exhausting." | Automation of billing and recurring service reminders. |

---

## 3. Product Roadmap

### 🚀 Phase 1: Foundations (Current State)
*   User Authentication (BetterAuth) and Multi-tenant Business Onboarding.
*   Job Order Management (List/Kanban views).
*   Customer CRM & Asset History.
*   Basic Invoicing (PDF generation).
*   Technician Management & Basic Status Tracking.

### 📈 Phase 2: Operational Excellence (Q2 2026)
*   **WhatsApp Integration (WAHA)**: Automated status updates to customers.
*   **GPS Live Tracking**: Real-time technician location on a map.
*   **Inventory Management**: Spare parts tracking tied to job orders.
*   **Recurring Service Contracts**: Automated reminders for routine maintenance.

### 🏢 Phase 3: Scale & Analytics (Q3 2026)
*   Advanced Revenue Analytics & Business Intelligence.
*   Multi-branch Support.
*   Payment Gateway Integration (Midtrans/Xendit) for direct customer payments.
*   Native Mobile App for Technicians.

---

## 4. Functional Requirements

### 4.1 Job Order Lifecycle
*   **Creation**: Staff can create jobs with customer details, photos, and priority.
*   **Dispatch**: Drag-and-drop assignment to available technicians (Kanban).
*   **Lifecycle**: `Pending` → `Assigned` → `On the Way` → `In Progress` → `Done` → `Paid`.
*   **Documentation**: Technicians upload "Before/After" photos and digital signatures.

### 4.2 Automated Invoicing
*   Generate professional PDF invoices with the business logo instantly upon job completion.
*   Automatic calculation of labor, spare parts (from inventory), and taxes.
*   **WhatsApp Delivery**: One-click send invoice via WA.

### 4.3 Recurring Service Contracts
*   Store maintenance schedules (e.g., 3-month AC cleaning).
*   Automated dashboard alerts for upcoming service dates.
*   Customer "Service Passport": A digital record accessible via QR code for each maintenance unit.

### 4.4 Technician Monitoring
*   Live dashboard showing active/idle technicians.
*   GPS breadcrumbs to verify arrival at customer sites.
*   Performance metrics: jobs completed, average duration, and customer rating.

---

## 5. Design System: Coreveta Identity

Coreveta uses a high-end, professional "Emerald Technical" aesthetic.

*   **Primary Color**: `#1D9E75` (Coreveta Green) — evokes trust, stability, and growth.
*   **Typography**: `Plus Jakarta Sans` — modern, readable, and technical.
*   **UI Principles**: 
    *   **Flat & Clean**: Minimal shadows, using 8px/16px radius.
    *   **High Contrast**: Status colors (Amber for urgent, Blue for active, Green for done).
    *   **PWA-First**: Mobile-responsive as the primary use case for technicians.

---

## 6. Technical Architecture

### 6.1 The Stack
*   **Frontend**: Vite + React 19 + TypeScript (State: Zustand, Fetching: TanStack Query).
*   **Styling**: TailwindCSS v4 with a custom Emerald design token system.
*   **Backend**: Node.js + Express + BetterAuth.
*   **Database**: SQLite with DrizzleORM (Fast, portable, and reliable for specialized SME workloads).
*   **Infrastructure**: Nginx reverse proxy on VPS with PM2 for process management.

### 6.2 Key Integrations
| Service | Purpose |
|---------|---------|
| **WAHA** | WhatsApp HTTP API for customer notifications. |
| **Google Maps API** | Geocoding and route visualization. |
| **Lucide Icons** | Consistent UI iconography. |

---

## 7. Success Metrics (KPIs)
*   **Engagement**: Number of jobs processed through Coreveta per business/month.
*   **Efficiency**: Average time reduction from "Job Start" to "Invoice Paid".
*   **Retention**: Renewal rate of the 'Pro' and 'Business' monthly plans.
*   **Impact**: Percentage of recovered revenue from recurring service reminders.

---

> [!NOTE]
> This document is a living artifact. Technical implementation details can be found in [Coreveta_PRD_v2.md](file:///Users/nsrr/Documents/teknikos_v2/Coreveta_PRD_v2.md) and deployment steps in [DEPLOY_COREVETA_VPS.md](file:///Users/nsrr/Documents/teknikos_v2/DEPLOY_COREVETA_VPS.md).
