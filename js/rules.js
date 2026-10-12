// rules.js — the "brain" of the app.
// These functions only work with values: no HTML and no localStorage here,
// so each one can be tested in the browser console.

/* ---------- Technicians ---------- */

// Find a technician by id. Returns undefined if the id is unknown.
function findTechnician(technicianId) {
  return TECHNICIANS.find(function (tech) {
    return tech.id === technicianId;
  });
}

// Technician name for display, or "Unassigned".
function technicianName(technicianId) {
  const tech = findTechnician(technicianId);
  return tech ? tech.name : 'Unassigned';
}

/* ---------- Dates ---------- */

// Number of calendar days between two dates (time of day is ignored).
// Same day = 0, today vs yesterday = 1.
function calendarDaysBetween(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endDay - startDay) / 86400000); // 86,400,000 ms = 1 day
}

/* ---------- Status rules ---------- */

// Check if a ticket may move to newStatus. Returns { ok, message }.
// The checks run in a fixed order so the most helpful message is shown.
function checkStatusChange(ticket, newStatus) {
  if (!STATUSES.includes(newStatus)) {
    return { ok: false, message: 'Unknown status.' };
  }
  if (ticket.status === newStatus) {
    return { ok: false, message: 'Ticket is already ' + newStatus + '.' };
  }
  if (ticket.status === 'Closed') {
    return { ok: false, message: 'Closed tickets cannot be reopened or changed.' };
  }
  const allowed = ALLOWED_TRANSITIONS[ticket.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      ok: false,
      message: 'Cannot change from ' + ticket.status + ' to ' + newStatus +
        '. Allowed next: ' + allowed.join(' or ') + '.'
    };
  }
  if (ticket.status === 'Open' && newStatus === 'In Progress' && !ticket.technicianId) {
    return { ok: false, message: 'Assign a technician before starting work.' };
  }
  return { ok: true, message: 'Status changed from ' + ticket.status + ' to ' + newStatus + '.' };
}

// Change the status if the rules allow it, and update the resolution fields.
// "now" is passed in so tests can use any date. Returns { ok, message }.
function applyStatusChange(ticket, newStatus, now) {
  const result = checkStatusChange(ticket, newStatus);
  if (!result.ok) {
    return result;
  }

  if (newStatus === 'Resolved') {
    ticket.resolvedAt = now.toISOString();
    ticket.resolutionDays = calendarDaysBetween(ticket.createdAt, ticket.resolvedAt);
  }
  if (ticket.status === 'Resolved' && newStatus === 'In Progress') {
    // The fix did not work: the old resolution no longer counts.
    ticket.resolvedAt = null;
    ticket.resolutionDays = null;
  }

  ticket.status = newStatus;
  return result;
}

// Check if a technician may be set on a ticket. technicianId = null means "remove".
function checkAssignment(ticket, technicianId) {
  if (ticket.status === 'Closed') {
    return { ok: false, message: 'Closed tickets cannot be reassigned.' };
  }
  if (!technicianId) {
    if (ticket.status === 'In Progress' || ticket.status === 'Resolved') {
      return { ok: false, message: 'A ticket in progress must keep a technician.' };
    }
    return { ok: true, message: 'Technician removed.' };
  }
  if (!findTechnician(technicianId)) {
    return { ok: false, message: 'Choose a valid technician.' };
  }
  if (ticket.technicianId === technicianId) {
    return { ok: false, message: technicianName(technicianId) + ' is already assigned.' };
  }
  return { ok: true, message: 'Assigned to ' + technicianName(technicianId) + '.' };
}

/* ---------- Validation ---------- */

// Trim a text value and turn runs of spaces into one space.
function tidyText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

// Join first, middle and last name into one full name. The middle name may be empty.
function buildFullName(firstName, middleName, lastName) {
  return [firstName, middleName, lastName].filter(function (part) {
    return part !== '';
  }).join(' ');
}

// Check the Create Ticket form values. Returns { valid, errors, clean }.
// errors = { fieldName: 'message' }, clean = trimmed values plus the full name.
function validateTicketInput(input) {
  const clean = {
    firstName: tidyText(input.firstName),
    middleName: tidyText(input.middleName),
    lastName: tidyText(input.lastName),
    category: String(input.category || '').trim(),
    priority: String(input.priority || '').trim(),
    description: String(input.description || '').trim()
  };
  clean.requesterName = buildFullName(clean.firstName, clean.middleName, clean.lastName);
  const errors = {};

  if (clean.firstName === '') {
    errors.firstName = 'First name is required.';
  } else if (clean.firstName.length < LIMITS.namePartMin || clean.firstName.length > LIMITS.namePartMax) {
    errors.firstName = 'First name must be ' + LIMITS.namePartMin + ' to ' + LIMITS.namePartMax + ' characters.';
  }

  // Middle name is optional: only check the length when something was typed.
  if (clean.middleName.length > LIMITS.namePartMax) {
    errors.middleName = 'Middle name must be at most ' + LIMITS.namePartMax + ' characters.';
  }

  if (clean.lastName === '') {
    errors.lastName = 'Last name is required.';
  } else if (clean.lastName.length < LIMITS.namePartMin || clean.lastName.length > LIMITS.namePartMax) {
    errors.lastName = 'Last name must be ' + LIMITS.namePartMin + ' to ' + LIMITS.namePartMax + ' characters.';
  }

  if (!CATEGORIES.includes(clean.category)) {
    errors.category = 'Choose a category.';
  }

  if (!PRIORITIES.includes(clean.priority)) {
    errors.priority = 'Choose a priority.';
  }

  if (clean.description === '') {
    errors.description = 'Description is required.';
  } else if (clean.description.length < LIMITS.descriptionMin) {
    errors.description = 'Description must be at least ' + LIMITS.descriptionMin + ' characters.';
  } else if (clean.description.length > LIMITS.descriptionMax) {
    errors.description = 'Description must be at most ' + LIMITS.descriptionMax + ' characters.';
  }

  return { valid: Object.keys(errors).length === 0, errors: errors, clean: clean };
}

// Check the Add Note form values. Returns { valid, errors, clean }.
function validateNoteInput(input) {
  const clean = {
    text: String(input.text || '').trim(),
    author: String(input.author || '').trim()
  };
  const errors = {};

  if (clean.text === '') {
    errors.text = 'Note text is required.';
  } else if (clean.text.length > LIMITS.noteMax) {
    errors.text = 'Note must be at most ' + LIMITS.noteMax + ' characters.';
  }

  if (clean.author === '') {
    errors.author = 'Author is required.';
  } else if (clean.author.length > LIMITS.authorMax) {
    errors.author = 'Author must be at most ' + LIMITS.authorMax + ' characters.';
  }

  return { valid: Object.keys(errors).length === 0, errors: errors, clean: clean };
}

/* ---------- Creating tickets and notes ---------- */

// Build a new ticket object from already-validated values.
function createTicket(clean, ticketNo, now) {
  return {
    ticketNo: ticketNo,
    firstName: clean.firstName,
    middleName: clean.middleName,
    lastName: clean.lastName,
    requesterName: clean.requesterName, // full name, shown on the Tickets and Details pages
    category: clean.category,
    description: clean.description,
    priority: clean.priority,
    status: 'Open',
    technicianId: null,
    createdAt: now.toISOString(),
    resolvedAt: null,
    resolutionDays: null,
    notes: []
  };
}

// Add a note to a ticket. New notes go to the front so the newest is first.
function addNote(ticket, clean, now) {
  if (ticket.status === 'Closed') {
    return { ok: false, message: 'Closed tickets cannot receive new notes.' };
  }
  ticket.notes.unshift({
    id: 'N' + now.getTime() + '-' + ticket.notes.length,
    text: clean.text,
    author: clean.author,
    createdAt: now.toISOString()
  });
  return { ok: true, message: 'Note added.' };
}

/* ---------- Search, filter and sort ---------- */

// Keep only tickets that match ALL the filled-in criteria.
// criteria = { status, priority, category, technicianId, keyword }; '' means "any".
// technicianId 'unassigned' means tickets with no technician.
function filterTickets(tickets, criteria) {
  const keyword = String(criteria.keyword || '').trim().toLowerCase();

  return tickets.filter(function (ticket) {
    if (criteria.status && ticket.status !== criteria.status) return false;
    if (criteria.priority && ticket.priority !== criteria.priority) return false;
    if (criteria.category && ticket.category !== criteria.category) return false;
    if (criteria.technicianId === 'unassigned' && ticket.technicianId) return false;
    if (criteria.technicianId && criteria.technicianId !== 'unassigned' &&
        ticket.technicianId !== criteria.technicianId) return false;
    if (keyword && !ticket.description.toLowerCase().includes(keyword)) return false;
    return true;
  });
}

// Return a sorted COPY of the tickets (the original list is not changed).
// sortBy: 'priority' (Critical first, then newest), 'newest', or 'oldest'.
function sortTickets(tickets, sortBy) {
  const copy = tickets.slice();

  function byNewest(a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }

  if (sortBy === 'priority') {
    copy.sort(function (a, b) {
      const difference = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      return difference !== 0 ? difference : byNewest(a, b);
    });
  } else if (sortBy === 'oldest') {
    copy.sort(function (a, b) {
      return byNewest(b, a);
    });
  } else {
    copy.sort(byNewest);
  }
  return copy;
}

/* ---------- Dashboard ---------- */

// Count tickets per status, the total, and Open tickets with no technician.
function getDashboardStats(tickets) {
  const stats = { total: tickets.length, openUnassigned: 0, byStatus: {} };
  STATUSES.forEach(function (status) {
    stats.byStatus[status] = 0;
  });

  tickets.forEach(function (ticket) {
    if (stats.byStatus[ticket.status] !== undefined) {
      stats.byStatus[ticket.status]++;
    }
    if (ticket.status === 'Open' && !ticket.technicianId) {
      stats.openUnassigned++;
    }
  });
  return stats;
}
