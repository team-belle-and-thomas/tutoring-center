---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
date: 2026-02-27
author: team-belle-and-thomas
completedAt: 2026-02-27T00:00:00Z
status: complete
---

# Product Brief: tutoring-center

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

A single-location tutoring center management platform that solves parent churn through transparent progress visibility. Parents purchase credit blocks and can book sessions, but most importantly - they can SEE the ROI through an intuitive dashboard showing their child's progress, performance trends, and session summaries.

---

## Core Vision

### Problem Statement

Parents leave tutoring centers when they don't see measurable progress. Without visibility into how sessions are being used or whether their child is improving, they question the value of continuing.

### Problem Impact

- High parent churn affects revenue stability
- Untracked sessions lead to unbilled hours
- No visibility = no perceived value = cancellations

### Proposed Solution

MVP combines two key features:

1. **ROI Dashboard** - Visual progress tracker showing grades, performance trends, tutor notes, and session summaries so parents can see concrete improvement
2. **Credit-Based Booking** - Parents buy credit blocks and can book sessions, with automatic deduction

### Key Differentiators

- Focused on single-center simplicity first
- Built as a learning experience with AI assistance
- Progress transparency as the primary churn-reduction mechanism

---

## Target Users

### Primary Users

**Parents** (the decision-makers and viewers)

- **Who they are:** Busy parents with children struggling in school who seek grade improvement
- **Their goals:**
  - See measurable improvement in their child's grades
  - Understand where their child started vs. where they are now
  - Book tutoring sessions for their children using their credit balance
  - Feel confident their tutoring investment is working
- **Their pain:** Currently have no visibility into session outcomes or progress
- **"Aha!" moment:** Seeing a clear chart showing "when I started vs. where I'm at" with concrete improvements

### Secondary Users

**Tutors** (content creators for the ROI dashboard)

- **Who they are:** Subject experts who deliver tutoring sessions
- **Their role in MVP:**
  - Fill out session progress reports after each session
  - Log topics covered, student performance (0-5), tutor notes
  - Record homework assigned and student self-reflection notes
  - Add confidence scores and comments via session metrics
- **Key interaction:** Complete progress report form after each session

**Admin** (center operations)

- **Who they are:** Center manager overseeing daily operations
- **Their role in MVP:**
  - Add and manage tutors
  - View and manage all sessions
  - View credit transactions and balances

### User Journey

**Parent Journey (MVP focus):**

1. **Login** → Land on personalized dashboard (assumed auth, not in scope)
2. **Dashboard View** → See widgets showing:
   - Credit balance summary
   - List of children/students
   - Quick access to progress reports
3. **View Progress** → Navigate to ROI dashboard showing:
   - Performance trend chart over time ("when I started vs. now")
   - Recent session summaries with tutor notes
   - Topics covered and homework completion
4. **Book Session** → Select student, choose available tutor/slot, credits auto-deducted
5. **Success** → Parent sees clear improvement → stays engaged → renews credits

**Tutor Journey:**

1. **Login** → See assigned sessions for the day
2. **Complete Session** → Fill out progress report (topics, performance, notes)
3. **Submit** → Data flows to parent's ROI dashboard

---

## Success Metrics

### User Success Metrics

**MVP Success Criteria:**

- Parents can view the ROI dashboard showing their child's progress over time
- Parents can see a clear chart visualizing "when I started vs. where I am now"
- Parents can book tutoring sessions using their credit balance
- Parents can view session summaries with tutor notes and topics covered

**Success Definition:**
The MVP is working if parents can log in and see concrete evidence that their tutoring investment is paying off through visible progress.

### Business Objectives

**Note:** This is a learning project focused on team collaboration and skill-building with AI assistance, not revenue generation.

- Ship a functional MVP within the 2-week timeline
- Validate that progress visibility addresses parent churn concerns
- Learn how AI assistance affects development velocity as a team of 6

### Key Performance Indicators

**MVP Launch Metrics:**

- [ ] ROI Dashboard is functional and displays parent-facing progress data
- [ ] Session booking flow works end-to-end with credit deduction
- [ ] Progress chart shows historical performance data
- [ ] Tutor can submit session progress reports (topics, performance, notes)
- [ ] Admin panel allows managing tutors, sessions, and viewing credits

**Timeline:**

- MVP delivery: 2 weeks from project start (team's "AI week")

**Team Metrics:**

- Team of 6 developers using AI workflows collaboratively
- Goal: Ship working MVP, learn about AI-assisted development

---

## MVP Scope

### Core Features (IN SCOPE)

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

### Out of Scope for MVP

- **Authentication/Login** - Assumed to exist, not built
- **Student-facing views** - Not applicable
- **Real payment processing** - Mock credit purchase only for demo
- **Email notifications** - Future enhancement

### Future Vision

- Full authentication system
- Parent credit purchase with real payment integration
- Email/push notifications for session reminders
- Student-facing mobile app
- Multi-location support
- Advanced analytics for center owners
- Automated progress reports
