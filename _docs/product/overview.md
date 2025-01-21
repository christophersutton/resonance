# MVP Overview

This MVP supports an agency-client ticketing portal with core flows:

- **Bug/Incident Reporting**: Capture and track software or service issues.  
- **Maintenance/Retainer Requests**: Handle ongoing tasks or one-off fixes under a retainer agreement.  
- **Consultation/Advice**: Provide strategic or tactical guidance to clients.  

## Key Concepts

1. **Clients and Users**  
   - A _Client_ represents the organization.  
   - _Users_ can be internal (agents, admins, developers) or external (client contacts).  
2. **Tickets**  
   - Each request (bug, maintenance, question, feedback) is a _Ticket_.  
   - _TicketType_ defines the category and can drive specific workflows (e.g., severities for bugs, retainer queue for maintenance, etc.).  
3. **Messaging**  
   - A ticket’s conversation history is captured in _Message_ records.  
4. **Assignments & Status**  
   - Tickets can be assigned to an individual agent, a team, or remain unassigned.  
   - Status transitions track the lifecycle (New → Open → Pending → Resolved → Closed).  

This MVP also provides placeholders for advanced functionality like AI-based suggestions, knowledge base integration, and analytics—but the fundamental structure keeps it simple and flexible.
