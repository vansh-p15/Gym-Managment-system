# FitSphere Design Document (Main Points)

Version: 3.1  
Date: 09-Apr-2026  
Project: FitSphere Gym Management System

## 1. Modularization Details

### 1.1 High-Level Structure

The project is divided into two major parts:
1. Backend (server logic and database operations)
2. Frontend (user interface and client-side flow)

This split keeps responsibilities clear and makes development easier for a team.

### 1.2 Backend Modules

- server/index.js
  - Entry point of the backend.
  - Initializes middleware, mounts routes, and starts the server.

- server/config/*
  - db.js: MongoDB connection setup.
  - razorpay.js: payment gateway client configuration.
  - mailer.js: email utility for payment confirmations.

- server/middleware/auth.js
  - Verifies JWT tokens.
  - Enforces role-based access (member, trainer, admin).

- server/routes/*
  - auth.js: signup, login, and current user profile.
  - member.js: profile update, attendance, membership, workouts, payment history.
  - trainer.js: assigned members, workout upload, schedule, trainer attendance.
  - admin.js: member and trainer management, plans, reports, attendance, salary operations.
  - payment.js: Razorpay order creation and payment verification.

- server/models/*
  - Mongoose schemas for database entities.
  - Contains validation, enums, defaults, and indexes.

### 1.3 Frontend Modules

- src/App.jsx
  - Main route map for public/member/trainer/admin paths.

- src/components/ProtectedRoute.jsx
  - Prevents unauthorized access.
  - Redirects users to role-appropriate dashboards.

- src/pages/AuthContext.jsx
  - Handles login, signup, logout, and session persistence.

- src/utils/api.js
  - Central API request utility.
  - Adds auth token headers and handles API errors consistently.

- src/components/Layout.jsx, Navbar.jsx, Sidebar.jsx
  - Shared layout and role-based navigation UI.

- src/pages/member/*, src/pages/trainer/*, src/pages/admin/*
  - Feature screens separated by user role.

### 1.4 Why This Modularization Works

- Better readability: each folder has a clear purpose.
- Better maintenance: fixes stay localized to the related module.
- Better collaboration: different developers can work on different roles.
- Better scalability: new features can be added without major restructuring.

---

## 2. Data Integrity and Constraints (Including Database Design)

### 2.1 Main Collections

- users
- plans
- memberships
- payments
- attendances
- trainerattendances
- workouts
- schedules
- trainersalaries

### 2.2 Core Relationships

- One member can have multiple memberships over time.
- One plan can be used in many memberships.
- One member can have multiple payments.
- One member can have only one attendance record per day.
- One trainer can have only one trainer-attendance record per day.
- One trainer can have one salary record per month.
- One trainer can assign workouts to many members.

### 2.3 Key Database Constraints

- users.email must be unique.
- Unique index on attendance: (member, date).
- Unique index on trainer attendance: (trainer, date).
- Unique index on trainer salary: (trainer, month).
- Enum rules:
  - role: member, trainer, admin
  - payment status: paid, pending, failed
  - membership status: active, expired, cancelled
- User password is hashed before save.

### 2.4 Data Integrity Rules

1. Only one active membership is allowed per member.
2. Duplicate attendance entries for the same date are blocked.
3. Payment signature verification is required before activating membership.
4. Trainer can upload workouts only for assigned members.
5. Trainer salary amount is calculated as: presentDays x dailyRate.

### 2.5 Data Quality Notes

- Existing indexes are sufficient for current core workflows.
- A strong improvement would be transaction-based writes for payment verification and membership activation.
- This prevents partial update risk in failure scenarios.

---

## 3. Procedural Design

### 3.1 Authentication Procedure

Signup flow:
1. Validate required fields.
2. Check if email already exists.
3. Create user record.
4. Hash password automatically using schema hook.
5. Return JWT token and user data.

Login flow:
1. Validate email and password.
2. Compare password hash.
3. Return JWT token and user profile.

### 3.2 Member Attendance Procedure

Check-in flow:
1. Get today's date.
2. Check if attendance already exists.
3. If not, create attendance with check-in time.

Check-out flow:
1. Fetch today's attendance record.
2. Reject if no check-in exists.
3. Update check-out time.

### 3.3 Membership Payment Procedure (Razorpay)

Create order flow:
1. Validate selected plan.
2. Create Razorpay order.
3. Store payment as pending.

Verify payment flow:
1. Validate Razorpay signature.
2. Mark payment as paid or failed.
3. Expire any previous active membership.
4. Create new active membership record.

### 3.4 Trainer Salary Procedure

1. Count present attendance days for selected month.
2. Fetch trainer daily rate.
3. Compute salary amount.
4. Manual mode: directly mark salary paid.
5. Online mode: create order, verify signature, then mark paid.

### 3.5 Workout Upload Procedure

1. Trainer selects member and workout day.
2. System verifies trainer-member assignment.
3. Workout is inserted or updated using upsert.

---

## 4. User Interface Design

### 4.1 UI Structure

- Public pages: Home, Login, Signup.
- Protected pages use a shared structure:
  - Navbar
  - Role-based Sidebar
  - Main Content Area
  - Footer

### 4.2 Role-Based Navigation

- Member: Dashboard, Profile, Membership, Workout, Attendance, Payment, Payment History.
- Trainer: Dashboard, Attendance, Members, Workout Upload, Progress, Schedule.
- Admin: Dashboard, Members, Trainers, Plans, Payments, Trainer Payments, Attendance, Reports.

### 4.3 Core UI Patterns

- Dashboard cards for key metrics.
- Tables for records and management views.
- Forms for create/update operations.
- Badges for status indicators (paid/pending, present/absent).

### 4.4 UI States and Feedback

- Loading state with spinner.
- Error state with alert or inline message.
- Empty state when no data exists.
- Success confirmation after actions.

### 4.5 Validation and Usability

- Required fields validated before submission.
- Action buttons disabled during processing.
- Wrong-role users are auto-redirected.
- Layout remains usable on desktop and mobile screens.

---

## 5. Testing and Validations

### 5.1 Unit Testing - Test Case Design

Unit testing focuses on isolated validation of model logic, middleware checks, utility methods, and key frontend helpers.

| Test Case ID | Module | Input | Expected Output |
| --- | --- | --- | --- |
| UT-01 | User model password pre-save hook | Save user with plain password | Stored password is hashed, not plain text |
| UT-02 | User model password compare method | Compare hash with valid and invalid password | Valid returns true and invalid returns false |
| UT-03 | auth middleware (token check) | Send protected request without token | Missing/invalid token returns 401 response |
| UT-04 | auth middleware (role check) | Access admin route using member token | Non-matching role returns 403 response |
| UT-05 | Attendance model unique constraint | Insert same member attendance twice on same date | Duplicate insert for same member and date is rejected |
| UT-06 | TrainerSalary amount calculation logic | presentDays=20 and dailyRate=500 | Computed salary matches expected arithmetic result |
| UT-07 | frontend API utility token header logic | Call API when local token exists | Authorization header is sent when token exists |
| UT-08 | frontend validation utility | Submit form with required field empty | Invalid input is rejected with proper validation message |

### 5.2 Unit Testing - Outcome Report

Reporting cycle: Cycle-1 (13-Apr-2026)

| Test Case ID | Module | Input | Expected Output | Actual Output | Status |
| --- | --- | --- | --- | --- | --- |
| UT-01 | User model password pre-save hook | Save new user with plain password | Password should be hashed before save | Password stored as bcrypt hash | Pass |
| UT-02 | User model password compare method | Compare correct and wrong password | Correct returns true, wrong returns false | Returned expected boolean values | Pass |
| UT-03 | auth middleware (token check) | Call protected route without token | 401 Unauthorized | 401 Unauthorized with error message | Pass |
| UT-04 | auth middleware (role check) | Member token on admin-only route | 403 Forbidden | 401 returned instead of 403 | Fail |
| UT-05 | Attendance model unique constraint | Insert duplicate attendance for same date | Duplicate insert should be rejected | Mongo duplicate key error thrown | Pass |
| UT-06 | TrainerSalary calculation logic | presentDays=20, dailyRate=500 | Salary should be 10000 | Salary computed as 10000 | Pass |
| UT-07 | frontend API utility token header logic | Send request with token in storage | Authorization header should be attached | Header attached in outgoing request | Pass |
| UT-08 | frontend validation utility | Submit whitespace-only name field | Validation message should be shown | Form submitted without message | Fail |

- Total unit test cases executed: 8
- Passed: 6
- Failed: 2

### 5.3 Integration Testing - Test Case Design

Integration testing validates interactions between routes, middleware, database operations, and third-party services.

| Test Case ID | Modules Involved | Input | Expected Output |
| --- | --- | --- | --- |
| IT-01 | Auth route + User model + JWT utility | Submit member signup payload | User created, password hashed, JWT returned |
| IT-02 | Auth login route + password compare + JWT | Submit valid login credentials | Valid credentials return token and profile |
| IT-03 | Member attendance route + Attendance model | First check-in then duplicate check-in | First check-in succeeds, duplicate is rejected |
| IT-04 | Payment route + Razorpay + Payment model | Create payment order for selected plan | Razorpay order created and payment saved as pending |
| IT-05 | Payment verification + Membership model | Submit valid payment signature for verification | Valid signature marks payment paid and creates active membership |
| IT-06 | Trainer route + assignment validation + Workout model | Upload workout for assigned and unassigned members | Workout allowed only for assigned member |

### 5.4 Integration Testing - Outcome Report

Reporting cycle: Cycle-1 (13-Apr-2026)

| Test Case ID | Modules Involved | Input | Expected Output | Actual Output | Status |
| --- | --- | --- | --- | --- | --- |
| IT-01 | Auth route + User model + JWT utility | New member signup request | User created and token returned | User created with token in response | Pass |
| IT-02 | Auth login route + password compare | Valid login credentials | Login success with token and profile | Token and profile returned correctly | Pass |
| IT-03 | Member attendance route + Attendance model | First and duplicate check-in | First success, duplicate rejected | First saved, duplicate blocked | Pass |
| IT-04 | Payment route + Razorpay order + Payment model | Create order for selected plan | Order created and pending payment record saved | Order created and pending row saved | Pass |
| IT-05 | Payment verification + Membership model | Verify payment signature and activate plan | Payment paid and membership active | Payment marked paid but membership not activated | Fail |
| IT-06 | Trainer route + assignment validation + Workout model | Trainer uploads workout for unassigned member | Request should be denied | Workout created for unassigned member | Fail |

- Total integration test cases executed: 6
- Passed: 4
- Failed: 2

### 5.5 System Testing - Test Case Design

System testing validates complete user journeys across frontend, backend, role-based access, and business rules.

| Test Case ID | Scenario | Input | Expected Output |
| --- | --- | --- | --- |
| ST-01 | Complete member onboarding workflow | Signup -> Login -> Dashboard | Member reaches role-correct dashboard successfully |
| ST-02 | Member attendance full workflow | Check-in -> Check-out | Attendance record stores both check-in and check-out correctly |
| ST-03 | Member plan purchase workflow | Select plan -> Pay online -> Verify | Successful payment activates latest membership |
| ST-04 | Trainer workout management workflow | Login -> Upload workout for assigned member | Upload succeeds only for assigned member |
| ST-05 | Admin management workflow | Add/update plan and member records | Changes persist and reflect across relevant pages |
| ST-06 | Wrong-role access control workflow | Member opens admin route | User is redirected/denied based on role |

### 5.6 System Testing - Outcome Report

Reporting cycle: Cycle-1 (13-Apr-2026)

| Test Case ID | Scenario | Input | Expected Output | Actual Output | Status |
| --- | --- | --- | --- | --- | --- |
| ST-01 | Complete member onboarding workflow | Signup -> Login -> Open dashboard | Member lands on role-correct dashboard | Flow completed successfully | Pass |
| ST-02 | Member attendance full workflow | Check-in -> Check-out on same day | Both times saved in one attendance record | Check-in and check-out saved correctly | Pass |
| ST-03 | Member online plan purchase workflow | Buy plan and complete payment | Membership becomes active immediately | Payment success shown but membership remained inactive | Fail |
| ST-04 | Trainer daily workflow | Login -> Upload workout for assigned member | Upload succeeds for assigned member | Upload succeeded and visible to member | Pass |
| ST-05 | Admin operations workflow | Add plan -> Edit member -> View analytics | All updates saved and reflected in UI | CRUD changes reflected in dashboard | Pass |
| ST-06 | Wrong-role access control workflow | Member opens admin URL directly | Access denied and redirected | Admin page briefly rendered before redirect | Fail |

- Total system test cases executed: 6
- Passed: 4
- Failed: 2

---

## 6. Final Summary (Teacher View)

- The project is clearly modularized into backend and frontend responsibilities.
- Database integrity is maintained through unique indexes, enums, and business rules.
- Important operational procedures (auth, attendance, payment, salary, workout) are structured and consistent.
- UI is role-driven, practical, and aligned with backend APIs.
- Recommended next step: introduce transaction-safe financial operations and centralized validation middleware.
