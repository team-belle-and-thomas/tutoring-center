# Story 1.2: Sessions List Page with Supabase Data

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Admin/Parent,
I want to view a list of sessions with student/tutor details,
So that I can track upcoming and past sessions.

## Acceptance Criteria

**Given** I am logged in as an Admin or Parent
**When** I navigate to the Sessions page
**Then** I see a DataTable displaying all sessions from Supabase with joins
**And** each row shows: Student Name, Tutor Name, Subject, Date, Units, Status, Actions

**Given** I am logged in as a Parent
**When** I view the Sessions page
**Then** I only see sessions for my children (filtered by parent_id)

**Given** I am logged in as an Admin
**When** I view the Sessions page
**Then** I see all sessions in the system

**Given** I specify a filter (e.g., kind=upcoming)
**When** the page loads
**Then** only sessions matching the filter are displayed

## Tasks / Subtasks

- [x] Task 1: Create Supabase data layer for sessions (AC: #1, #4)
  - [x] Subtask 1.1: Create `lib/data/sessions.ts` with `getSessions(kind?)` function using Supabase joins
  - [x] Subtask 1.2: Add proper TypeScript types matching existing data layer patterns
  - [x] Subtask 1.3: Implement role-based filtering (admin sees all, parent sees own)
- [x] Task 2: Update Sessions page to use Supabase data (AC: #1)
  - [x] Subtask 2.1: Replace mock-api calls with data layer calls
  - [x] Subtask 2.2: Update columns.tsx to match new Session type
  - [x] Subtask 2.3: Support filter parameter (upcoming/past/all)
- [x] Task 3: Handle loading and empty states
  - [x] Subtask 3.1: Add loading skeleton component
  - [x] Subtask 3.2: Add empty state handling

## Dev Notes

- Use existing pattern from `lib/data/students.ts` - same architecture, similar patterns
- Supabase client: `createSupabaseServiceClient()` from `@/lib/supabase/serverClient`
- Types: Use `SESSION_SELECT_WITH_JOINS` from `@/lib/supabase/types`
- Validators: Follow pattern from `lib/validators/students.ts`
- Use `server-only` import for data layer functions

### Project Structure Notes

- **Data Layer**: `lib/data/sessions.ts` (create)
- **Page**: `app/dashboard/sessions/page.tsx` (update existing)
- **Columns**: `app/dashboard/sessions/columns.tsx` (update existing)
- **Types**: `lib/supabase/types.ts` (extend if needed)
- **Validators**: `lib/validators/sessions.ts` (create if needed)

### Architecture Alignment

- Follow exact patterns from `lib/data/students.ts`:
  - Error handling with user-friendly messages
  - Role validation
  - Supabase service client for server-side operations
  - Zod validators for data validation
  - Type-safe responses
- Need to join: students, tutors, subjects tables
- Parent filter: filter by parent_id through student relationship
- Admin sees all sessions

### Testing Standards

- Test with real Supabase data if available
- Verify role-based access (non-admin should not see all)
- Test parent filter (only see own children's sessions)
- Test filter parameter (upcoming/past)
- Test loading states

### References

- Source: \_bmad-output/planning-artifacts/epics.md#Story-1.2-Sessions-List-Page-with-Supabase-Data
- Pattern: lib/data/students.ts, lib/data/tutors.ts (from story 1-1)

## Dev Agent Record

### Agent Model Used

anthropic/claude-3.7-sonnet

### Debug Log References

- Fixed type issues with parsing nested objects from SessionWithJoins in lib/data/sessions.ts
- Used type assertions to safely handle potentially null or undefined user data
- Ensured proper mapping between session.slot_units and units in the UI

### Completion Notes List

- ✅ Created Supabase data layer for sessions with proper TypeScript types following the pattern from students.ts
- ✅ Implemented role-based filtering (admin sees all sessions, parent sees only their children's sessions)
- ✅ Updated sessions page to use real Supabase data instead of mock API
- ✅ Added filtering support (all/upcoming/past) with filter buttons in the UI
- ✅ Updated columns.tsx to work with the new SessionRow type
- ✅ Added loading skeleton component using Suspense
- ✅ Added proper error handling with user-friendly messages
- ✅ Created unit tests for getSessions functionality
- ✅ Enhanced UI with badge components for session status

### File List

- lib/data/sessions.ts (created)
- app/dashboard/sessions/page.tsx (updated)
- app/dashboard/sessions/columns.tsx (updated)
- tests/lib/data/sessions.test.ts (created)

### Change Log

- Implemented Sessions List Page with Supabase Integration (Date: Tue Mar 03 2026)
