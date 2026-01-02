# Solution Key - Full Stack Home Assignment

This document contains all intentional issues planted in the codebase for candidates to discover and fix.

## Issue Categories

1. **Security Issues** (4 issues)
2. **Performance Issues** (3 issues)
3. **Type Safety & Code Quality** (2 issues)
4. **User Experience** (2 issues)
5. **Database & Data Integrity** (2 issues)

---

## 1. Missing Input Validation (#1)

### Backend

**File**: `backend/src/controllers/authController.ts`

- **Line 9-10**: Missing input validation in `register` function
- **Line 12**: No validation - accepts any data
- **Line 15**: No validation for empty strings, invalid email format, weak passwords
- **Line 32**: No password strength validation
- **Line 61-62**: Missing input validation in `login` function
- **Line 64**: No validation - accepts any data
- **Line 67**: No validation for empty strings, invalid email format

**File**: `backend/src/controllers/taskController.ts`

- **Line 65**: Missing input validation in `createTask`
- **Line 69**: No validation - accepts any data
- **Line 72**: No validation for required fields, valid status values, etc.
- **Line 94**: Missing input validation in `updateTask`
- **Line 98**: No validation - accepts any data including invalid status values
- **Line 106**: No validation for valid status values

**File**: `backend/src/controllers/commentController.ts`

- **Line 7-8**: Missing input validation
- **Line 13**: No validation - accepts empty comments, invalid taskId

**File**: `backend/src/routes/auth.ts`

- **Line 7**: Missing input validation middleware

**File**: `backend/src/routes/tasks.ts`

- **Line 8**: Missing input validation middleware

**File**: `backend/src/routes/comments.ts`

- **Line 7**: Missing input validation middleware

### Frontend

**File**: `frontend/src/components/TaskForm.tsx`

- **Line 3**: Missing form validation
- **Line 21**: Missing form validation - can submit empty/invalid data
- **Line 24**: No validation for required fields, valid status values, etc.
- **Line 38**: No required attribute, no validation

**File**: `frontend/src/pages/Login.tsx`

- **Line 5**: Missing form validation
- **Line 12**: Missing form validation - no validation for email format, empty fields
- **Line 15**: No validation before submission
- **Line 33**: No required attribute, no validation
- **Line 43**: No required attribute, no validation

**File**: `frontend/src/pages/Register.tsx`

- **Line 5**: Missing form validation
- **Line 25**: Missing form validation - accepts empty fields, invalid email, weak passwords
- **Line 28**: No validation before submission
- **Line 47**: No required attribute, no validation
- **Line 58**: No required attribute, no validation
- **Line 79**: No required attribute, no password strength validation

**File**: `frontend/src/hooks/useAuth.ts`

- **Line 25**: No input validation
- **Line 34**: No input validation

**File**: `frontend/src/hooks/useTasks.ts`

- **Line 27**: No input validation

---

## 2. XSS Vulnerability (#7)

**File**: `frontend/src/components/CommentList.tsx`

- **Line 4**: XSS vulnerability
- **Line 37**: XSS vulnerability - using dangerouslySetInnerHTML with unsanitized content

**File**: `backend/src/controllers/commentController.ts`

- **Line 17**: XSS risk - content not sanitized

**File**: `backend/src/routes/comments.ts`

- **Line 8**: XSS risk in createComment (content not sanitized)

---

## 3. Authentication Bypass (#3)

**File**: `backend/src/routes/tasks.ts`

- **Line 7**: Auth middleware applied incorrectly - authenticate allows requests without token

---

## 4. SQL Injection Risk (#2)

**File**: `backend/src/controllers/taskController.ts`

- **Line 10**: SQL injection risk in search
- **Line 18**: SQL injection risk - using $queryRawUnsafe with string concatenation
- **Line 21**: SQL injection - unescaped user input using string concatenation

**File**: `backend/src/routes/tasks.ts`

- **Line 10**: SQL injection risk in getTasks search

---

## 5. N+1 Query Problem (#8)

**File**: `backend/src/controllers/taskController.ts`

- **Line 7**: N+1 query problem
- **Line 26**: N+1 query problem - fetching tasks first, then related data separately
- **Line 34**: N+1 problem - fetching user data in a loop
- **Line 43**: N+1 problem - fetching assignments separately
- **Line 49**: N+1 problem - fetching user for each assignment
- **Line 133**: Some N+1 queries remain in other methods

**File**: `backend/src/controllers/commentController.ts`

- **Line 40**: N+1 problem - fetching user for each comment

---

## 6. Missing Database Indexes (#9)

**File**: `backend/prisma/schema.prisma`

- **Line 13**: Missing @unique constraint on User.email
- **Line 14**: Missing @unique constraint on User.username
- **Line 29**: Missing index on Task.status
- **Line 31**: Missing index on Task.userId
- **Line 32**: Missing index on Task.createdAt
- **Line 39**: Missing unique constraint on (title, userId)
- **Line 54**: Missing index on Comment.taskId

---

## 7. Unnecessary Re-renders (#10)

**File**: `frontend/src/components/TaskList.tsx`

- **Line 4**: Unnecessary re-renders - no React.memo
- **Line 11**: Unnecessary re-renders - this component re-renders on every parent state change
- **Line 124**: XSS vulnerability - rendering description without sanitization

**File**: `frontend/src/pages/Dashboard.tsx`

- **Line 9**: Unnecessary re-renders
- **Line 17**: Unnecessary re-renders - parent state changes trigger child re-renders

---

## 8. Excessive Any Types (#14)

**File**: `frontend/src/types/index.ts`

- **Line 1**: Excessive any types
- **Line 18**: Using any for related data
- **Line 30**: Using any for user
- **Line 34**: API responses typed as any

**File**: `frontend/src/components/TaskForm.tsx`

- **Line 4**: Excessive any types
- **Line 13**: Form event handlers use any

**File**: `frontend/src/pages/Register.tsx`

- **Line 6**: Excessive any types
- **Line 17**: Form event handlers use any

**File**: `frontend/src/hooks/useAuth.ts`

- **Line 5**: Excessive any types

**File**: `frontend/src/hooks/useTasks.ts`

- **Line 5**: Excessive any types

**File**: `backend/src/controllers/authController.ts`

- **Line 10**: Excessive any types
- **Line 62**: Excessive any types

**File**: `frontend/src/services/api.ts`

- **Line 1**: Some any types remain for flexibility, but improved error handling

---

## 9. Missing Error Handling (#15)

**File**: `backend/src/controllers/taskController.ts`

- **Line 8**: Missing error handling
- **Line 61**: Missing error handling - no try-catch

**File**: `backend/src/controllers/authController.ts`

- **Line 18**: Missing error handling - no try-catch
- **Line 68**: Missing error handling - no try-catch

**File**: `backend/src/controllers/commentController.ts`

- **Line 8**: Missing error handling
- **Line 14**: Missing error handling - no try-catch
- **Line 26**: Missing error handling
- **Line 30**: Missing error handling - no try-catch
- **Line 51**: Missing error handling
- **Line 55**: Missing error handling - no try-catch

**File**: `frontend/src/components/CommentList.tsx`

- **Line 5**: Missing error handling
- **Line 15**: Missing error handling - unhandled promise rejection

**File**: `frontend/src/pages/Login.tsx`

- **Line 16**: Missing error handling

**File**: `frontend/src/pages/Register.tsx`

- **Line 29**: Missing error handling

**File**: `frontend/src/hooks/useAuth.ts`

- **Line 4**: Missing error handling
- **Line 13**: Missing error handling - unhandled promise rejection
- **Line 24**: Missing error handling - no try-catch
- **Line 33**: Missing error handling - no try-catch

**File**: `frontend/src/hooks/useTasks.ts`

- **Line 4**: Missing error handling
- **Line 17**: Missing error handling - unhandled promise rejection
- **Line 26**: Missing error handling - no try-catch
- **Line 34**: Missing error handling - no try-catch
- **Line 41**: Missing error handling - no try-catch

---

## 10. Missing Form Validation (#32)

**File**: `frontend/src/components/TaskForm.tsx`

- **Line 3**: Missing form validation (see details in Missing Input Validation section)

**File**: `frontend/src/pages/Login.tsx`

- **Line 5**: Missing form validation (see details in Missing Input Validation section)

**File**: `frontend/src/pages/Register.tsx`

- **Line 5**: Missing form validation (see details in Missing Input Validation section)

---

## 11. No Error Boundaries (#23)

**File**: `frontend/src/components/TaskList.tsx`

- **Line 5**: Missing error boundary

---

## 12. Missing Pagination (#11)

**File**: `backend/src/controllers/taskController.ts`

- **Line 9**: Missing pagination
- **Line 15**: Missing pagination - returns all tasks

**File**: `frontend/src/pages/Dashboard.tsx`

- **Line 8**: Missing pagination
- **Line 18**: Missing pagination - loads all tasks at once
- **Line 66**: Missing pagination controls

**File**: `frontend/src/hooks/useTasks.ts`

- **Line 6**: Missing pagination
- **Line 18**: Missing pagination - loads all tasks

**File**: `backend/src/routes/tasks.ts`

- **Line 9**: Missing pagination in getTasks

---

## 13. Missing Unique Constraints (#27)

**File**: `backend/prisma/schema.prisma`

- **Line 13**: Missing @unique constraint on User.email
- **Line 14**: Missing @unique constraint on User.username
- **Line 39**: Missing unique constraint on (title, userId) for Task

---

## Summary

Total Issues: 13 categories

- Security: 4 issues (Input Validation, XSS, Auth Bypass, SQL Injection)
- Performance: 3 issues (N+1 Queries, Missing Indexes, Unnecessary Re-renders)
- Code Quality: 2 issues (Excessive Any Types, Missing Error Handling)
- UX: 2 issues (Missing Form Validation, No Error Boundaries)
- Database: 2 issues (Missing Pagination, Missing Unique Constraints)
