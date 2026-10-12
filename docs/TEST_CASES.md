# Test Cases

Type: N = normal, I = invalid, E = edge. Fill in **Actual** and **Result** (PASS / FAIL) only after running each test.

Before testing: DevTools (F12) → Console → `localStorage.clear()` → refresh.

| ID | Scenario | Type | Input / action | Expected result | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | Create a valid ticket | N | First "Maria", Middle "Reyes", Last "Santos", Network, High, description "Wi-Fi in Library 2F keeps disconnecting" → Submit | Saved; alert shows TKT-0001; form clears | | |
| TC-02 | Sequential numbering | N | Create a second ticket | TKT-0002 | | |
| TC-03 | Numbering after refresh | E | Refresh, create a third ticket | TKT-0003 (not TKT-0001 again) | | |
| TC-04 | Missing first and last name | I | Leave first and last name empty → Submit | Errors under first and last name; nothing saved | | |
| TC-05 | Spaces-only first name | E | First name "   " → Submit | Same first-name error as TC-04 | | |
| TC-05b | Middle name left empty | N | First "Ben", Middle empty, Last "Cruz" → Submit | Saved; Tickets page shows "Ben Cruz" | | |
| TC-05c | Full name on list | N | Create TC-01 ticket → open Tickets page | Requester shows "Maria Reyes Santos" | | |
| TC-06 | No category | I | Leave category on "Choose a category…" | Error under category; nothing saved | | |
| TC-07 | No priority | I | Leave priority on "Choose a priority…" | Error under priority; nothing saved | | |
| TC-08 | Description too short | I | Description "pc" | Error: at least 10 characters | | |
| TC-09 | Description too long | E | Paste 501+ characters | Field stops at 500 characters | | |
| TC-10 | HTML typed in a field | E | Description `<b>printer broken</b>` | Tags shown as plain text, not bold | | |
| TC-11 | Default values | N | Open a new ticket's details | Status Open, technician Unassigned, no resolution date | | |
| TC-12 | Assign technician | N | Choose a technician → Save → refresh | Name shown and still there after refresh | | |
| TC-13 | Start work with no technician | I | Unassigned Open ticket → In Progress | Rejected: "Assign a technician before starting work." | | |
| TC-14 | Start work with technician | N | Assigned Open ticket → In Progress | Allowed; status In Progress | | |
| TC-15 | Open to Resolved | I | Open → Resolved | Rejected; message names the allowed next status | | |
| TC-16 | Open to Closed | I | Open → Closed | Rejected | | |
| TC-17 | In Progress to Resolved | N | In Progress → Resolved | Allowed; resolution date and days shown | | |
| TC-18 | In Progress to Open | I | In Progress → Open | Rejected | | |
| TC-19 | In Progress to Closed | I | In Progress → Closed | Rejected | | |
| TC-20 | Reopen a Resolved ticket | N | Resolved → In Progress | Allowed; resolution date and days cleared | | |
| TC-21 | Close a Resolved ticket | N | Resolved → Closed | Allowed; Closed banner; controls disabled | | |
| TC-22 | Resolved to Open | I | Resolved → Open | Rejected | | |
| TC-23 | Reopen a Closed ticket | I | Console: `applyStatusChange(findTicket(loadTickets(),'TKT-0001'),'In Progress',new Date())` on a Closed ticket | `{ ok: false, message: 'Closed tickets cannot be reopened or changed.' }` | | |
| TC-24 | Edit a Closed ticket | E | Try assign / status / note on a Closed ticket | All controls disabled | | |
| TC-25 | Same status | E | In Progress → In Progress | Rejected: "Ticket is already In Progress." | | |
| TC-26 | Add a note | N | Text "Replaced cable", author "Ana Reyes" | Note shows author and date; survives refresh | | |
| TC-27 | Empty note | I | Note text empty → Add note | Error; no note added | | |
| TC-28 | Note with no author | I | Author empty → Add note | Error; no note added | | |
| TC-29 | Note order | N | Add "first", "second", "third" | Shown as third, second, first | | |
| TC-30 | Resolved same day | E | Create and resolve today | "0 days (same day)" | | |
| TC-31 | Resolved after 3 days | E | Move `createdAt` 3 days back (command below), then resolve | "3 days" | | |
| TC-32 | Resolve, reopen, resolve again | E | Resolved → In Progress → Resolved | New resolution date replaces the old one | | |
| TC-33 | Filter by status | N | Status = In Progress | Only In Progress tickets | | |
| TC-34 | Filter by priority | N | Priority = Critical | Only Critical tickets | | |
| TC-35 | Filter by category | N | Category = Hardware | Only Hardware tickets | | |
| TC-36 | Filter by technician | N | Technician = Unassigned, then one name | Only matching tickets each time | | |
| TC-37 | Keyword search | N | Type "PRINTER" when a description says "printer" | Match found (case-insensitive) | | |
| TC-38 | Combined filters | E | Status + priority + keyword | Only tickets meeting all three | | |
| TC-39 | No matches | E | Keyword "zzzz" | "No tickets match your filters."; Clear filters restores all | | |
| TC-40 | Sort by priority | N | Sort = Priority, all 4 priorities present | Critical, High, Medium, Low | | |
| TC-41 | Sort by date | N | Sort = Newest, then Oldest | Order reverses | | |
| TC-42 | Status counts | N | Compare dashboard with list filtered by each status | Every count matches | | |
| TC-43 | Unassigned Open count | N | Note count, assign one Open ticket, reload dashboard | Count drops by 1 | | |
| TC-44 | Empty dashboard | E | Clear storage, open dashboard | All counts 0, "No tickets yet" shown | | |
| TC-45 | Persistence | N | Create, assign, note, change status → refresh every page | All data still shown | | |
| TC-46 | Corrupted storage | E | Console: `localStorage.setItem('helpdesk.tickets','not json')` → refresh | No crash; warning shown; empty list | | |
| TC-47 | Unknown ticket id | E | Open `details.html?id=TKT-9999` | "Ticket not found" with link back | | |

**Console command for TC-31** (moves the first ticket's creation date 3 days back):

```js
const t = JSON.parse(localStorage.getItem('helpdesk.tickets'));
t[0].createdAt = new Date(Date.now() - 3 * 86400000).toISOString();
localStorage.setItem('helpdesk.tickets', JSON.stringify(t));
```
