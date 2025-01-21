# Detailed User Flows

Below are the primary user flows (“epics”) in the MVP:

## 0. Client Onboarding & User Invites

### Admin Flow

1. **Create New Client Organization**
   - Admin fills in client details (name, contact info, notes)
   - System generates unique clientId

2. **Generate User Invites**
   - Admin enters email addresses for client contacts
   - System generates secure invite links with expiry
   - Invites sent via email with setup instructions
   - Each invite tracks intended role (e.g., CLIENT_CONTACT)

3. **Monitor & Manage Access**
   - Admin can view pending invites
   - Dashboard shows successful registrations

### Client User Flow

1. **Accept Invite**
   - User receives email with secure invite link
   - Clicks link to access registration form
   - System validates invite is unused and not expired

2. **Complete Registration**
   - User creates password and fills profile
   - Automatically associated with correct clientId
   - Assigned proper role (CLIENT_CONTACT)

3. **Initial Portal Access**
   - Guided through brief product tour
   - Can immediately begin creating tickets
   - Access to client-specific dashboards


## 1. Report a Bug or Incident

### Client Flow

1. **Initiate Bug Report**  
   - Client selects "Bug/Incident" ticket type.  
   - Fills in Title, Description, Severity, Environment, etc.  
   - Optionally attaches logs or screenshots.  
2. **Review & Submit**  
   - Client confirms details and submits.  
   - Receives a unique Ticket ID and can track the ticket in the portal.  
   - If “Critical,” triggers immediate notifications to internal teams.  

### Admin/Backend Flow

1. **Ticket Creation & Triage**  
   - System auto-assigns or suggests an assignment based on severity (e.g., DevOps for Critical).  
2. **Agent Assessment**  
   - Agent investigates, adds internal notes, and may request more info from the client.  
3. **Resolution & Closure**  
   - Once fixed, the ticket status is set to _Resolved_ and the client is notified.  
   - If client confirms the fix, status is _Closed_.  

## 2. Request Ongoing Maintenance / Retainer Work

### Client Flow

1. **Submit Maintenance Request**  
   - Client chooses “Maintenance” ticket type.  
   - Provides Title, Description, optional attachments, priority setting.  
2. **Track**  
   - Receives a Ticket ID.  
   - For urgent tasks, priority is set to “High” or “Urgent.”  

### Admin/Backend Flow

1. **Ticket Ingestion**  
   - Labeled as “Maintenance” and possibly queued separately for retainer tasks.  
2. **Assignment & Scheduling**  
   - A PM or admin checks retainer hours or monthly SOW.  
3. **Execution & Billing**  
   - Developer completes the work, logs progress.  
   - The ticket moves to _Resolved_ and eventually _Closed_.  

## 3. Ask a Question (Consultation / Guidance / Tactical Updates)

### Client Flow

1. **Open a “Consultation” Ticket**  
   - Client chooses either Strategy Advice or Tactical Update.  
   - Provides context or question.  
2. **(Optional) Self-Service**  
   - Future expansion: the system suggests FAQ or knowledge base articles.  
3. **Finalize Submission**  
   - Receives a Ticket ID to track the inquiry.  

### Admin/Backend Flow

1. **Auto-Suggestions (Optional, Future)**  
   - An AI module might propose an immediate response if confidence is high.  
2. **Human Review & Follow-Up**  
   - Consultant or strategist replies with details or schedules a call.  
   - If resolved quickly, the ticket is closed. Otherwise, it remains open for back-and-forth discussion.  

## 4. Request Update / Feedback on Documents

### Client Flow

1. **Upload Document / Provide Link**  
   - Client attaches or links a document (e.g., proposal, design draft).  
2. **Describe Feedback Requirements**  
   - Specific questions or timeline for feedback.  
3. **Submit & Track**  
   - Ticket is created and the client can monitor status.  

### Admin/Backend Flow

1. **Ticket Intake & Assignment**  
   - The system categorizes it as “Document Feedback.”  
   - Assigned to the relevant PM, strategist, or designer.  
2. **Feedback & Iteration**  
   - Agent comments directly in the document or provides notes.  
   - If multiple rounds are needed, the same ticket stays open; otherwise set to _Resolved_/_Closed_.  

## Variation & Priority Handling

- **Severity** (Minor, Major, Critical) mainly for Bug/Incident.  
- **Priority** (Low, Normal, High, Urgent) for any ticket.  
- **AI Involvement** (future feature) with auto-suggestions or knowledge base references.  
- **Immediate vs. Scheduled** (some tasks need quick turnaround, others enter a backlog).