// storage.js — reading and writing tickets in the browser's localStorage.

const TICKETS_KEY = 'helpdesk.tickets';
const NEXT_NUMBER_KEY = 'helpdesk.nextNumber';

// Set to true when saved data could not be read (shown as a warning on the page).
let storageWasCorrupted = false;

// Load all tickets. Returns an empty array if nothing is saved or the data is broken.
function loadTickets() {
  const raw = localStorage.getItem(TICKETS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const tickets = JSON.parse(raw);
    if (!Array.isArray(tickets)) {
      throw new Error('Saved tickets are not a list');
    }
    return tickets;
  } catch (error) {
    console.error('Could not read saved tickets:', error);
    storageWasCorrupted = true;
    return [];
  }
}

// Save the whole ticket list.
function saveTickets(tickets) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

// Find one ticket by its number, e.g. "TKT-0001". Returns undefined if not found.
function findTicket(tickets, ticketNo) {
  return tickets.find(function (ticket) {
    return ticket.ticketNo === ticketNo;
  });
}

// Give out the next ticket number (TKT-0001, TKT-0002, ...) and move the counter up.
// The counter is saved separately so numbers are never reused.
function getNextTicketNo() {
  let next = parseInt(localStorage.getItem(NEXT_NUMBER_KEY), 10);
  if (isNaN(next) || next < 1) {
    next = 1;
  }

  // Safety check: never hand out a number that already exists.
  const tickets = loadTickets();
  tickets.forEach(function (ticket) {
    const used = parseInt(String(ticket.ticketNo).replace('TKT-', ''), 10);
    if (!isNaN(used) && used >= next) {
      next = used + 1;
    }
  });

  localStorage.setItem(NEXT_NUMBER_KEY, String(next + 1));
  return 'TKT-' + String(next).padStart(4, '0');
}
