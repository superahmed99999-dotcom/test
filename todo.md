# CivicPulse Project TODO

## Phase 1: Database Schema & Migrations
- [x] Migrate issues table schema to drizzle/schema.ts
- [x] Migrate issue_images table schema to drizzle/schema.ts
- [x] Generate and apply database migrations
- [x] Create database query helpers in server/db.ts

## Phase 2: tRPC Procedures & Backend
- [x] Implement tRPC procedure: issues.list (getIssues with pagination)
- [x] Implement tRPC procedure: issues.getById (single issue)
- [x] Implement tRPC procedure: issues.create (protected, with validation)
- [x] Implement tRPC procedure: issues.update (protected, ownership check)
- [x] Implement tRPC procedure: issues.delete (protected, ownership check)
- [x] Implement tRPC procedure: issues.upvote (public)
- [x] Implement tRPC procedure: issues.getByUser (protected, user dashboard)
- [x] Implement tRPC procedure: issues.getCount (home page stats)

## Phase 3: Core Pages
- [x] Build Home/Landing page with hero, stats, features, and CTA
- [x] Build MapPage with Google Maps integration and filters
- [x] Build SubmitIssue page with map location picker
- [x] Build IssueDetail page with full issue info
- [x] Build Dashboard page for user's submitted issues
- [x] Build NotFound 404 page

## Phase 4: Navigation & UI Polish
- [x] Implement Navbar with auth-aware links and user avatar
- [x] Implement responsive design for mobile and desktop
- [x] Apply global styling with Tailwind 4
- [x] Implement color-coded map markers (blue/amber/green)
- [x] Add status and category badges
- [x] Polish spacing, shadows, and typography

## Phase 5: Testing
- [x] Write Vitest tests for issues.list procedure
- [x] Write Vitest tests for issues.getById procedure
- [x] Write Vitest tests for issues.create procedure
- [x] Write Vitest tests for issues.update procedure
- [x] Write Vitest tests for issues.delete procedure
- [x] Write Vitest tests for issues.upvote procedure
- [x] Write Vitest tests for issues.getByUser procedure
- [x] Write Vitest tests for issues.getCount procedure
- [x] Test authentication flows
- [x] Verify all error handling

## Phase 6: Documentation
- [x] Create comprehensive README.md
- [x] Document setup instructions
- [x] Document environment variables
- [x] Document project structure
- [x] Document API procedures
- [x] Add deployment notes

## Phase 7: Delivery
- [x] Verify all features work end-to-end
- [x] Test map functionality with real coordinates
- [x] Test authentication flow
- [x] Create final checkpoint
- [x] Deliver project to user

## Phase 8: Vote Tracking & Geolocation (Current)
- [x] Add user_votes table to database schema
- [x] Generate and apply database migration for user_votes
- [x] Implement protected upvote procedure with vote deduplication
- [x] Update IssueDetail component to use protected upvote
- [x] Integrate browser Geolocation API on Submit Issue page
- [x] Integrate browser Geolocation API on Map page
- [x] Write tests for protected voting system
- [ ] Initialize Git repository and push to GitHub
