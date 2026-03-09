<!-- Owner: Manideep Reddy Eevuri -->
<!-- GitHub: https://github.com/Maniredii -->
<!-- LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/ -->

# ExpensifyPro Technical Documentation

## Overview
ExpensifyPro is a complete Corporate Expense Management portal built with a modern React (Next.js) frontend and an Express.js/Multer backend for OCR and stable receipt processing.

## 1. Architecture & Tech Stack

- **Frontend:** React (Next.js), CSS variables for easy theming
- **Backend File/OCR Server:** Node.js, Express, Multer, Tesseract.js
- **State Management:** React Context API (`AppContext.js`) 

## 2. API Integration Points

### `POST /api/upload` (Receipt Upload and OCR)
- **URL:** `http://localhost:3001/api/upload`
- **Method:** `POST`
- **Payload:** `multipart/form-data`
  - `receipt`: The File blob (`image/*` or `application/pdf`)
  - `userId`: Identifier for the employee uploading the file
  - `userName`: Employee Name for auditing
- **Behavior:** 
  1. Saves the explicit file to `backend/uploads/{userid}-{username}-{timestamp}-{filename}`.
  2. Runs Tesseract.js (OCR framework) to parse and log the receipt's text contents. 
- **Response:**
  - `fileUrl`: Predictable, static URL string that provides the image to all reviewers.
  - `extractedText`: OCR parsed wording. It is utilized by the frontend to prefill the expense description.

## 3. Database Schema (Simulated State)

The application models its core data in `src/context/AppContext.js` across the following key entities:

### 3.1 `USERS` Table (Employees)
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Unique ID (1-6) |
| `name` | String | Employee Name |
| `role` | String | employee, manager, hod, finance |
| `department` | String | Engineering, Sales, Finance, Executive |
| `grade` | String | A, B, C (Determines limit eligibility) |

### 3.2 `POLICIES` Table (Guardrails)
| Field | Type | Description |
|-------|------|-------------|
| `grade` | String | Linked to Employee Grade |
| `categoryId` | Integer | Category mapping |
| `limit` | Integer | Max monetary spend allowed |
| `period` | String | e.g. "per_expense", "per_month" |

### 3.3 `EXPENSES` Table (Transactions)
| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | e.g. "EXP-1215" |
| `userId` | Integer | The claimant ID |
| `categoryId` | Integer | Type of expense |
| `vendor` | String | Specific merchant |
| `amount` | Float | Claimed Value |
| `description` | String | Justification or OCR snippet |
| `status` | String | pending, approved, rejected, settled |
| `receiptData`| String | `http...` path to backend artifact |
| `settlement` | Object | Txn Reference (`txnRef`), Date, Mode (`NEFT` / `RTGS` / `UPI`) |
| `approvals` | Array[Obj]| Hierarchical checks with timestamps, manager-tier, and comments |

### 3.4 `NOTIFICATIONS` Table (Communication Engine)
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Timestamp ID |
| `userId` | Integer | Internal Recipient |
| `message` | String | Payload generated at checkpoints |
| `type` | String | info, warning, success, error |
| `channels` | Array[Str] | Multi-channel simulants (`['app', 'email', 'sms']`) |

## 4. Business Logic & Approval Matrix

The system routes approval using three "Levels":
1. **Level 1 (Reporting Manager):** Validates the business necessity and generic sum.
2. **Level 2 (Head of Department - HOD):** Finalizes the department budget and allows the expense to progress to the finance team.
3. **Level 3 (Finance Command Centre):** Confirms actual receipt clarity, triggers Bank Settlement (`settleExpense`), allocates the simulated Reference ID, and completes the workflow.

**Policy Guardrails:**
Whenever the component `<SubmitExpense>` triggers `handleChange`, it checks the `POLICIES`. If an employee exceeds their grade's limits (e.g. Grade A attempting to claim 85,000 INR on Local Travel natively limited to 1,000 INR), it pop-ups a `Warning` warning them of standard policy breach while applying automated notification hooks.
