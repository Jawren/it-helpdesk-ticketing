# IT Help Desk Ticketing System

A browser-based ticketing app for a campus IT office. Students and staff submit IT support tickets; IT technicians assign, update and resolve them. It replaces paper forms so reports are not lost, urgent issues stand out, and every ticket has a clear owner.

## Features

- Requester name is entered as First, Middle (optional) and Last name; the full name is shown on the Tickets and Details pages
- Create tickets with an automatic sequential number (TKT-0001, TKT-0002, ...); every new ticket starts as **Open**
- Categories: Hardware, Network, Software, Account
- Priorities: Low, Medium, High, Critical
- Three predefined technicians; assign or reassign a technician to a ticket
- Status rules enforced (see below), with a clear message for every rejected change
- Notes with text, author and date, shown newest first
- Resolution date recorded automatically, plus the number of calendar days it took
- Search descriptions and filter by status, priority, category and technician (including Unassigned)
- Sort by priority (Critical first) or by date (newest / oldest)
- Dashboard: tickets per status, total, and Open tickets with no technician
- Input validation with messages under each field
- All data saved in the browser (localStorage) and kept after a refresh

## Status rules

| From | Allowed next | Condition |
| --- | --- | --- |
| Open | In Progress | A technician must be assigned |
| In Progress | Resolved | Records the resolution date and days to resolve |
| Resolved | Closed | — |
| Resolved | In Progress | The fix did not work; clears the resolution date |
| Closed | — | Closed tickets cannot be reopened or changed |

Every other change is rejected with a message, for example *"Cannot change from Open to Resolved. Allowed next: In Progress."*

## Technologies

HTML, CSS, Bootstrap 5.3 (CDN), vanilla JavaScript, browser localStorage, Git and GitHub.

## How to run

1. Download or clone this repository.
2. Double-click `index.html` to open it in a browser. No installation or server is needed.
3. An internet connection is needed the first time to load Bootstrap from the CDN.

To start with empty data: open DevTools (F12) → Console → `localStorage.clear()` → refresh.

## Folder structure

```text
index.html        Dashboard
tickets.html      Ticket list with search, filters and sorting
create.html       Create ticket form
details.html      Ticket details: assign, change status, notes
css/styles.css    Small custom styles on top of Bootstrap
js/data.js        Fixed lists: categories, priorities, statuses, technicians, allowed transitions
js/storage.js     Load and save tickets in localStorage, next ticket number
js/rules.js       Status rules, validation, filtering, sorting, dashboard counts (no HTML)
js/ui.js          Shared page helpers: alerts, badges, date formatting, form errors
js/dashboard.js   Code for index.html
js/tickets.js     Code for tickets.html
js/create.js      Code for create.html
js/details.js     Code for details.html
docs/             AI development log, test cases, screenshots
```

Scripts load in this order on every page: `data.js` → `storage.js` → `rules.js` → `ui.js` → the page's own script. Each file only uses functions from files loaded before it.

## Design decisions

- **Days to resolve** counts calendar days, ignoring the time of day. Resolved on the same day = 0 days.
- **Ticket numbers** come from a separate saved counter, so a number is never reused.
- **Technicians** can be changed until a ticket is Closed, but cannot be removed while it is In Progress or Resolved.
- **Closed tickets** are read-only: no status change, reassignment or new notes.
- **User text** is always displayed with `textContent`, so typed HTML shows as plain text instead of running.
- **Damaged saved data** does not crash the app: the list starts empty and a warning is shown.

## Testing

Test cases and results are in [docs/TEST_CASES.md](docs/TEST_CASES.md).

<!-- Fill in after running the tests: e.g. "47 test cases run: X passed, Y failed." -->

## AI usage

AI tools were used to help generate, debug and refactor code. Every significant interaction (prompt, response, evaluation, changes, tests) is recorded in [docs/AI_LOG.md](docs/AI_LOG.md).

## Known limitations

- Data is stored in one browser on one computer; it is not shared between users or devices.
- There is no login, so roles (requester or technician) are not enforced.
- Tickets cannot be deleted.
