---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - { filePath: '_bmad-output/planning-artifacts/product-brief-tutoring-center-2026-02-27.md', type: 'product-brief' }
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
workflowType: 'prd'
scaffoldStatus:
  tutorDetail: 'scaffolded, more or less done'
  studentDetail: 'almost done'
  sessionDetail: 'needs to be done'
classification:
  projectType: web_app
  domain: edtech
  complexity: low
  projectContext: brownfield
---

# Product Requirements Document - tutoring-center

**Author:** team-belle-and-thomas
**Date:** 2026-02-27

## Executive Summary

tutoring-center is a web-based tutoring center management platform that solves parent churn through transparent progress visibility. Parents purchase credit blocks and book sessions, but most importantly — they can SEE the ROI through an intuitive dashboard showing their child's progress, performance trends, and session summaries.

### Target Users

**Primary:** Parents (decision-makers and viewers) — busy parents with children seeking grade improvement who want visibility into tutoring effectiveness.

**Secondary:** Tutors (content creators) — deliver sessions and complete progress reports with topics, performance scores, and notes.

**Admin:** Center operations manager — manages tutors, sessions, and credit transactions.

### Problem Being Solved

Parents leave tutoring centers when they don't see measurable progress. Without visibility into how sessions are being used or whether their child is improving, they question the value of continuing. High parent churn affects revenue stability, untracked sessions lead to unbilled hours, and no visibility equals no perceived value equals cancellations.

## What Makes This Special

**Core Differentiator:** Progress transparency as the primary churn-reduction mechanism.

The "Aha!" moment: Parents seeing a clear chart showing "when I started vs. where I'm at" with concrete improvements.

**Key Differentiators:**

- Single-center simplicity first
- Built as a learning experience with AI assistance
- ROI Dashboard as the central feature showing grades, performance trends, tutor notes, and session summaries
- Credit-based booking with automatic deduction

### Project Context

| Attribute    | Value         |
| ------------ | ------------- |
| Project Type | Web App (SPA) |
| Domain       | EdTech        |
| Complexity   | Low           |
| Context      | Brownfield    |

**Scaffold Status:**

- Tutor detail: scaffolded, more or less done ✓
- Student detail: almost done ✓
- Session detail: needs to be done

---

## Success Criteria

### User Success

- Parents can view the ROI dashboard showing their child's progress over time
- Parents can see a clear chart visualizing "when I started vs. where I am now"
- Parents can book tutoring sessions using their credit balance
- Parents can view session summaries with tutor notes and topics covered
- Parents can track credit balance and view transaction history
- Parents can submit student grades for personalized instruction

### Business Success

- Ship a functional MVP within the 2-week timeline
- Validate that progress visibility addresses parent churn concerns
- Team of 6 developers using AI workflows collaboratively

### Technical Success

- Functional web app with role-based access (Parent, Tutor, Admin)
- ROI Dashboard displays parent-facing progress data
- Session booking flow works end-to-end with credit deduction
- Progress chart shows historical performance data
- Tutor can submit session progress reports (topics, performance, notes)
- Admin panel allows managing tutors, sessions, and viewing credits
- Backend integration with Supabase (real data, not mock)

## Product Scope

### MVP - Minimum Viable Product

1. **Parent ROI Dashboard**
   - Progress chart showing "when I started vs. now"
   - Session summaries with tutor notes
   - Topics covered per session
   - Credit balance display

2. **Session Booking Flow**
   - Parent can select student
   - Parent can choose available tutor/time slot
   - Credits automatically deducted on booking
   - Booking confirmation
   - Mock credit purchase (dummy/demo - no real payment)

3. **Tutor Progress Reports**
   - Form to submit after each session
   - Topics covered
   - Student performance score (0-5)
   - Tutor notes
   - Homework assigned

4. **Admin Panel**
   - Add and manage tutors
   - View and manage all sessions
   - View credit transactions and balances

### Growth Features (Post-MVP)

- Full authentication system
- Parent credit purchase with real payment integration
- Email/push notifications for session reminders
- Student-facing mobile app
- Multi-location support
- Advanced analytics for center owners
- Automated progress reports

### Vision (Future)

- AI-powered learning recommendations
- Predictive performance modeling
- Integration with school grade systems
- Parent-tutor messaging

## User Journeys

### Parent - Booking a Session (Success Path)

**Persona:** Sarah, a busy working mom with two children using the tutoring center

**Opening Scene:** Sarah logs into the tutoring center portal after a long day at work. She's worried about her son Jake's math grades and wants to book another session.

**Rising Action:**

- She sees her dashboard with credit balance (12 credits remaining)
- Next scheduled session shows for tomorrow at 4pm
- She clicks to book a new session
- Selects Jake as the student
- Views available tutors and time slots
- Chooses Friday at 3pm with Mr. Thompson
- System shows 2 credits will be deducted

**Climax:** Sarah clicks "Confirm Booking" and sees a success message. Credits are automatically deducted. She feels relief knowing another session is scheduled.

**Resolution:** Jake's session is confirmed. Sarah receives confirmation and can see it on the calendar. She feels proactive about her child's education.

---

### Parent - Viewing Progress (ROI Dashboard)

**Persona:** Sarah (continued)

**Opening Scene:** Sarah logs in specifically to check on Jake's progress after 5 sessions.

**Rising Action:**

- Lands on dashboard showing credit balance and next session
- Clicks on "Progress Overview" widget
- Sees a chart showing "when I started vs. where I am now"
- Performance trend shows improvement from 62% to 78% over 5 sessions
- Clicks into a recent session to see details
- Reads tutor notes: "Jake is showing great progress in algebra. He's mastering linear equations."

**Climax:** Sarah sees the visual proof that tutoring is working. She feels validated in her investment and relieved to see concrete improvement.

**Resolution:** Sarah shares the progress with Jake and encourages him to keep up the great work. She decides to purchase more credits.

---

### Tutor - Completing Progress Report

**Persona:** Mr. Thompson, a math tutor with 5 years experience

**Opening Scene:** Mr. Thompson just finished a 2-hour session with Jake. He needs to log the session results.

**Rising Action:**

- Logs into tutor portal
- Sees today's completed sessions
- Clicks on Jake's session
- Fills out the progress report form:
  - Topics covered: Linear equations, word problems
  - Student performance: 4/5
  - Tutor notes: "Jake showed excellent engagement today. Grasped linear equations by end of session."
  - Homework assigned: Practice problems 5-10 from Chapter 3

**Climax:** Submits the progress report with one click.

**Resolution:** The report is saved and immediately visible to Sarah on the parent dashboard. Mr. Thompson feels his work is valued and communicated effectively.

---

### Admin - Managing Tutors and Sessions

**Persona:** Lisa, center operations manager

**Opening Scene:** Lisa starts her morning checking the dashboard for the day's schedule.

**Rising Action:**

- Views today's sessions: 12 scheduled, 3 completed
- Checks tutor availability for the week
- Adds a new tutor (Dr. Patel, physics specialist)
- Reviews credit transaction history from last week
- Sees a parent has low balance and might need credits

**Climax:** Dr. Patel is now in the system and available for bookings.

**Resolution:** Lisa feels in control of operations and can manage the center efficiently.

---

## Journey Requirements Summary

Based on these journeys, the following capabilities are required:

1. **Dashboard** - Credit balance, upcoming sessions, quick actions
2. **Session Booking** - Student selection, tutor/time selection, credit pre-check, confirmation
3. **ROI Visualization** - Progress charts, performance trends, session summaries
4. **Progress Reports** - Tutor-facing form with topics, performance score, notes, homework
5. **Credit Management** - Balance display, transaction history, purchase flow
6. **Admin Panel** - Tutor management, session overview, credit transactions

## Web App Specific Requirements

### Project-Type Overview

Single Page Application (SPA) - Modern dashboard-based web application with role-based views for Parent, Tutor, and Admin users.

### Technical Architecture Considerations

- **Framework:** Modern SPA framework (React/Next.js based on existing scaffold)
- **Routing:** Client-side routing for dashboard navigation
- **State Management:** Appropriate state management for user sessions, dashboard data
- **API Integration:** RESTful API calls to backend for data retrieval and mutations

### Browser & Platform

- Modern browsers supported (Chrome, Firefox, Safari, Edge)
- No legacy browser support required

### Real-Time & SEO

- SEO not critical (internal dashboard application)
- No real-time features in MVP scope

### Implementation Considerations

- Role-based access control (Parent, Tutor, Admin)
- Responsive design for desktop access
- Credit balance state management
- Session booking with availability checking

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP with polished experience - core functionality first with good UX
**Resource Requirements:** Team of 6 developers, 2-week timeline, AI-assisted development workflow

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

1. Parent booking tutoring sessions with credit deduction
2. Parent viewing ROI Dashboard with progress charts
3. Tutor completing session progress reports
4. Admin managing tutors, sessions, and credit transactions

**Must-Have Capabilities:**

- All 3 roles: Parent, Tutor, Admin
- Full booking flow with credit pre-check and automatic deduction
- ROI Dashboard with performance trends and session summaries
- Progress report form (topics, performance score, notes, homework)
- Admin panel for managing tutors, sessions, credit transactions
- Backend integration with Supabase (real data, not mock)

### Post-MVP Features

**Phase 2 (Growth):**

- Full authentication system
- Real payment processing for credit purchases
- Email/push notifications for session reminders
- Advanced analytics for center owners

**Phase 3 (Expansion):**

- Student-facing mobile app
- Multi-location support
- AI-powered learning recommendations
- Integration with school grade systems
- Parent-tutor messaging

### Risk Mitigation Strategy

**Technical Risks:** Low complexity web app - standard SPA patterns, minimal technical uncertainty
**Market Risks:** Learning project - focus on validating progress visibility addresses parent churn
**Resource Risks:** 6-developer team with AI assistance - good capacity for MVP scope

## Functional Requirements

### 1. User Management

- FR1: Users can log in with role selection (Parent, Tutor, Admin)
- FR2: Users can access role-specific dashboard with relevant widgets
- FR3: System enforces role-based access control

### 2. Dashboard & Navigation

- FR4: Parents can view dashboard with credit balance, upcoming session, progress overview
- FR5: Parents can navigate via sidebar to Students, Sessions, Credit Transactions, Progress Reports
- FR6: Tutors can view assigned sessions for the day
- FR7: Admins can view daily session overview and tutor availability

### 3. Session Booking

- FR8: Parents can select a student for booking
- FR9: Parents can view available tutors and time slots
- FR10: Parents can select date, time, and tutor for session
- FR11: System displays credit cost before confirmation
- FR12: System validates sufficient credit balance before booking
- FR13: System deducts credits automatically on booking confirmation
- FR14: Parents receive booking confirmation with session details

### 4. Credit Management

- FR15: Parents can view current credit balance
- FR16: Parents can view credit transaction history (purchases, deductions, balance)
- FR17: Parents can purchase credits (mock payment flow)
- FR18: System prevents booking when insufficient credits

### 5. Progress Tracking (ROI Dashboard)

- FR19: Parents can view ROI dashboard with progress visualization
- FR20: Parents can view performance trend chart showing improvement over time
- FR21: Parents can view session summaries with tutor notes
- FR22: Parents can view topics covered per session
- FR23: Parents can view student's overall progress summary

### 6. Progress Reports

- FR24: Tutors can view assigned sessions
- FR25: Tutors can complete progress report after session
- FR26: Tutors can record topics covered in session
- FR27: Tutors can assign student performance score (0-5)
- FR28: Tutors can add tutor notes
- FR29: Tutors can assign homework
- FR30: Progress reports are immediately visible to parents

### 7. Student Management

- FR31: Parents can view all students associated with their account
- FR32: Parents can add new students
- FR33: Parents can view individual student profiles
- FR34: Parents can view individual student performance metrics

### 8. Session Management

- FR35: Parents can view upcoming scheduled sessions
- FR36: Parents can view past session history
- FR37: Parents can view detailed session information (tutor, student, date/time, notes, metrics)
- FR38: Admins can view and manage all sessions
- FR39: Admins can view tutor availability

### 9. Tutor Management

- FR40: Admins can add new tutors
- FR41: Admins can manage tutor profiles
- FR42: Admins can view tutor details and assigned sessions

### 10. Report Card / Grade Submission

- FR43: Parents can submit student grades through a form
- FR44: Parents can provide context for academic performance

### Implementation Status Notes

**Already Implemented:**

- Tutor detail page (full)
- Tutors list page with columns
- Parents (admin view) list and detail
- Login with role selection
- Landing page
- Mock API with role-based access

**Needs Implementation (MVP Priority):**

- Main Dashboard (widgets, credit balance, ROI overview)
- Session Detail page
- Student Detail page
- Sessions List
- Students List
- Credit Transactions
- Progress Reports
- Session Booking flow
- ROI Dashboard with charts

## Non-Functional Requirements

### General Approach

This is a low-complexity internal web application. Standard web development best practices apply. No strict non-functional requirements were specified beyond standard practices.

### Performance

- Standard page load times expected for dashboard applications
- No strict latency requirements for MVP

### Security

- Role-based access control enforced at application level
- Cookie-based session management (1 hour timeout)
- No real payment processing in MVP (mock only)

### Scalability

- Single tutoring center scope - no multi-location requirements in MVP
- Standard web application architecture sufficient

### Accessibility

- Good practice: Follow basic accessibility guidelines (semantic HTML, keyboard navigation)
- No strict WCAG compliance requirements for MVP

### Integration

- Supabase backend for data persistence
- Standard REST API patterns
