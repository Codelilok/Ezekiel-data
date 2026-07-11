---
name: Support System Architecture
description: How the full customer support/live-chat system is built and persisted
---

## Persistence (all localStorage)
- nsSupportSettings — widget config (enabled, open, name, avatar, messages)
- nsSupportTickets — array of SupportTicket objects
- nsSupportMessages — array of SupportMessage (across all tickets)
- nsAgentStatuses — { [email]: 'online'|'busy'|'offline' }

## Files
- src/lib/supportStore.ts — all read/write helpers, types
- src/components/support/SupportWidget.tsx — draggable floating button (customer)
- src/components/support/CustomerChatPanel.tsx — customer chat UI
- src/pages/SupportAdminPanel.tsx — admin/agent split-view (shared, role prop)
- src/pages/SupportAgentPage.tsx — agent-facing wrapper (/support route)

## Key Behaviors
- Admin sees ALL tickets; agents see only pending + their own accepted tickets
- First-accept wins: acceptTicket() checks assignedHandlerEmail before claiming
- After resolved/closed, customer's next message auto-creates a NEW ticket (fresh conv)
- Customer view: only their conversation + selected order. Admin/Agent: full customer details
- Polling: setInterval 2000ms in useEffect in every component

## Status Pipeline
pending → accepted → in_progress → waiting → resolved → closed / reopened

**Why:** Chosen over WebSocket to avoid adding server infrastructure; consistent with existing localStorage-first architecture.
