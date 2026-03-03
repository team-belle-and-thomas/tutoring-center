# Story 2.2: Session Detail Page

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Admin/Parent/Tutor,
I want to view detailed session information including tutor, student, notes, and metrics,
So that I can review session details and track progress.

## Acceptance Criteria

**Given** I am logged in as Admin, Parent, or Tutor
**When** I click on a session in the Sessions list
**Then** I navigate to the session detail page `/dashboard/sessions/[id]`
**And** I see the session info: Date, Time, Duration, Subject, Status

**Given** I am on the session detail page
**When** the page loads
**Then** I see the tutor's name and contact info
**And** I see the student's name and parent info

**Given** I am on the session detail page
**When** the session has a progress report
**Then** I see: Topics covered, Homework assigned, Tutor notes
**And** I see performance metrics: Confidence score, Performance 1-5, Homework completion

**Given** I am on the session detail page
**When** the session has no progress report yet
**Then** I see a message "Progress report not yet submitted"

## Tasks / Subtasks

- [x] Task 1: Create data layer for session detail (AC: #1, #2)
  - [x] Subtask 1.1: Add `getSession(id)` function to `lib/data/sessions.ts`
  - [x] Subtask 1.2: Include tutor and student info with joins
  - [x] Subtask 1.3: Include progress report if available
  - [x] Subtask 1.4: Include session metrics if available
- [x] Task 2: Build Session detail page (AC: #1, #2, #3, #4)
  - [x] Subtask 2.1: Display session info (date, time, duration, subject, status)
  - [x] Subtask 2.2: Display tutor info
  - [x] Subtask 2.3: Display student info
  - [x] Subtask 2.4: Display progress report if available
  - [x] Subtask 2.5: Display metrics if available
  - [x] Subtask 2.6: Handle empty/no-report state

## Dev Notes

- Extend the `lib/data/sessions.ts` created in story 1-2
- Need to join: students, tutors, subjects, session_progress, session_metrics tables
- Handle role-based access (all roles can view)

### Project Structure Notes

- **Data Layer**: `lib/data/sessions.ts` (extend from story 1-2)
- **Page**: `app/dashboard/sessions/[id]/page.tsx` (update existing)

### Architecture Alignment

- Follow same patterns as previous stories
- Include all related data in single query using joins

### Testing Standards

- Test with valid session ID
- Test with invalid session ID (should show 404)
- Test with progress report
- Test without progress report
- Test with metrics
- Test without metrics

### References

- Source: \_bmad-output/planning-artifacts/epics.md#Story-2.2-Session-Detail-Page
- Depends on: Story 1.2 (Sessions List Page)

## Dev Agent Record

### Agent Model Used

anthropic/claude-3.7-sonnet

### Debug Log References

- Extended lib/data/sessions.ts to add getSession function for fetching single session detail
- Added proper type handling for nested Supabase responses (tutor, student, parent, subjects)
- Handled session_progress and session_metrics as arrays from Supabase joins
- Fixed type casting for progress and metrics arrays

### Completion Notes List

- ✅ Added getSession function to lib/data/sessions.ts with comprehensive joins
- ✅ Included tutor info (name, email, phone)
- ✅ Included student info (name, parent_name, parent_email)
- ✅ Included progress report data (topics, homework_assigned, public_notes)
- ✅ Included session metrics (confidence_score, session_performance, homework_completed, tutor_comments)
- ✅ Built complete session detail page with cards for each section
- ✅ Handled empty/no-report state gracefully with "Progress report not yet submitted" message
- ✅ Added proper loading skeleton with Suspense
- ✅ Formatted dates and times using date-fns
- ✅ Added badge for session status with appropriate variants

### File List

- lib/data/sessions.ts (extended)
- app/dashboard/sessions/[id]/page.tsx (updated)

### Change Log

- Implemented Session Detail Page with Supabase Integration (Date: Tue Mar 03 2026)
