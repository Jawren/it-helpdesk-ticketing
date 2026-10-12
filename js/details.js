// details.js — code for details.html only.

const NOTE_FIELDS = { text: "noteText", author: "noteAuthor" };

// Elements that are used in more than one place on this page.
const elements = {
  ticketView: document.getElementById("ticketView"),
  technicianSelect: document.getElementById("technicianSelect"),
  statusSelect: document.getElementById("statusSelect"),
  noteText: document.getElementById("noteText"),
};

// The ticket number comes from the URL, e.g. details.html?id=TKT-0001
const currentTicketNo = new URLSearchParams(window.location.search).get("id");

// Load the list, find this page's ticket, run a change on it, and save.
// change(ticket) must return { ok, message }. Nothing is saved if ok is false.
function updateCurrentTicket(change) {
  const tickets = loadTickets();
  const ticket = findTicket(tickets, currentTicketNo);
  if (!ticket) {
    return {
      ok: false,
      message: "Ticket not found. It may have been removed.",
    };
  }
  const result = change(ticket);
  if (result.ok) {
    saveTickets(tickets);
  }
  return result;
}

// Show the result of an action as a green or red alert, then redraw.
function reportAndRender(result) {
  showAlert(result.message, result.ok ? "success" : "danger");
  renderDetails();
}

// Replace the contents of a badge holder with one new badge.
function setBadge(elementId, text, colourClass) {
  const holder = document.getElementById(elementId);
  holder.innerHTML = "";
  holder.appendChild(makeBadge(text, colourClass));
}

// Hide the ticket and show the "ticket not found" message.
function showNotFound() {
  elements.ticketView.classList.add("d-none");
  document.getElementById("notFound").classList.remove("d-none");
  document.getElementById("notFoundText").textContent = currentTicketNo
    ? 'There is no ticket with the number "' + currentTicketNo + '".'
    : "No ticket number was given in the link.";
}

// Draw everything on the page from the saved ticket.
function renderDetails() {
  const ticket = findTicket(loadTickets(), currentTicketNo);

  if (!ticket) {
    showNotFound();
    return;
  }

  document.title = ticket.ticketNo + " · IT Help Desk";
  elements.ticketView.classList.remove("d-none");
  document.getElementById("ticketTitle").textContent = ticket.ticketNo;

  setBadge("statusBadge", ticket.status, STATUS_BADGE[ticket.status]);
  setBadge(
    "priorityBadge",
    ticket.priority + " priority",
    PRIORITY_BADGE[ticket.priority],
  );

  renderInformation(ticket);
  renderActions(ticket);
  renderNotes(ticket);
}

// Fill the "Ticket information" card.
function renderInformation(ticket) {
  document.getElementById("detailRequester").textContent = ticket.requesterName;
  document.getElementById("detailCategory").textContent = ticket.category;
  document.getElementById("detailTechnician").textContent = technicianName(
    ticket.technicianId,
  );
  document.getElementById("detailCreated").textContent = formatDateTime(
    ticket.createdAt,
  );
  document.getElementById("detailResolved").textContent = formatDateTime(
    ticket.resolvedAt,
  );
  document.getElementById("detailDays").textContent = formatDays(
    ticket.resolutionDays,
  );
  document.getElementById("detailDescription").textContent = ticket.description;
}

// Set up the assign and status forms, and lock them if the ticket is Closed.
function renderActions(ticket) {
  const isClosed = ticket.status === "Closed";
  document.getElementById("closedBanner").classList.toggle("d-none", !isClosed);
  document.getElementById("assignFieldset").disabled = isClosed;
  document.getElementById("statusFieldset").disabled = isClosed;
  document.getElementById("noteFieldset").disabled = isClosed;

  fillSelect(elements.technicianSelect, technicianOptions(), "Unassigned");
  elements.technicianSelect.value = ticket.technicianId || "";

  // All four statuses stay in the list on purpose, so invalid moves can be
  // tried and the rule message is shown. The first allowed move is preselected.
  fillSelect(elements.statusSelect, toOptions(STATUSES));
  const allowed = ALLOWED_TRANSITIONS[ticket.status];
  elements.statusSelect.value = allowed.length > 0 ? allowed[0] : ticket.status;

  document.getElementById("allowedHint").textContent =
    allowed.length > 0
      ? "Allowed next: " + allowed.join(" or ") + "."
      : "No further status changes are allowed.";
}

// Draw the notes list (notes are stored newest first).
function renderNotes(ticket) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  if (ticket.notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-body-secondary mb-0";
    empty.textContent = "No notes yet.";
    list.appendChild(empty);
    return;
  }

  ticket.notes.forEach(function (note) {
    const item = document.createElement("div");
    item.className = "note-item py-2";

    const meta = document.createElement("div");
    meta.className = "small text-body-secondary";
    meta.textContent = note.author + " · " + formatDateTime(note.createdAt);

    const text = document.createElement("div");
    text.className = "preserve-lines";
    text.textContent = note.text;

    item.appendChild(meta);
    item.appendChild(text);
    list.appendChild(item);
  });
}

/* ---------- Form handlers ---------- */

// Assign form: uses checkAssignment() from rules.js.
function handleAssign(event) {
  event.preventDefault();
  const technicianId = elements.technicianSelect.value || null;
  reportAndRender(
    updateCurrentTicket(function (ticket) {
      const check = checkAssignment(ticket, technicianId);
      if (check.ok) {
        ticket.technicianId = technicianId;
      }
      return check;
    }),
  );
}

// Status form: uses applyStatusChange() from rules.js.
function handleStatusChange(event) {
  event.preventDefault();
  const newStatus = elements.statusSelect.value;
  reportAndRender(
    updateCurrentTicket(function (ticket) {
      return applyStatusChange(ticket, newStatus, new Date());
    }),
  );
}

// Note form: uses validateNoteInput() and addNote() from rules.js.
function handleAddNote(event) {
  event.preventDefault();
  const check = validateNoteInput({
    text: elements.noteText.value,
    author: document.getElementById("noteAuthor").value,
  });
  showFieldErrors(check.errors, NOTE_FIELDS);
  if (!check.valid) {
    showAlert("Please fix the note fields.", "danger");
    return;
  }

  const result = updateCurrentTicket(function (ticket) {
    return addNote(ticket, check.clean, new Date());
  });
  if (result.ok) {
    elements.noteText.value = ""; // keep the author for the next note
  }
  reportAndRender(result);
}

renderDetails();
showStorageWarningIfNeeded();
document.getElementById("assignForm").addEventListener("submit", handleAssign);
document
  .getElementById("statusForm")
  .addEventListener("submit", handleStatusChange);
document.getElementById("noteForm").addEventListener("submit", handleAddNote);
