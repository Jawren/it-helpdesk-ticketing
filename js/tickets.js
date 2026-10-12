// tickets.js — code for tickets.html only.

const filterInputs = {
  keyword: document.getElementById('filterKeyword'),
  status: document.getElementById('filterStatus'),
  priority: document.getElementById('filterPriority'),
  category: document.getElementById('filterCategory'),
  technicianId: document.getElementById('filterTechnician'),
  sortBy: document.getElementById('sortBy')
};

// Fill the filter dropdowns and apply any filters passed in the URL
// (the dashboard links to tickets.html?status=Open&technician=unassigned).
function setUpFilters() {
  fillSelect(filterInputs.status, toOptions(STATUSES), 'All statuses');
  fillSelect(filterInputs.priority, toOptions(PRIORITIES), 'All priorities');
  fillSelect(filterInputs.category, toOptions(CATEGORIES), 'All categories');
  fillSelect(filterInputs.technicianId,
    [{ value: 'unassigned', label: 'Unassigned' }].concat(technicianOptions()), 'All technicians');

  const params = new URLSearchParams(window.location.search);
  if (STATUSES.includes(params.get('status'))) {
    filterInputs.status.value = params.get('status');
  }
  if (params.get('technician')) {
    filterInputs.technicianId.value = params.get('technician');
  }
}

// Read the filter bar values.
function readCriteria() {
  return {
    keyword: filterInputs.keyword.value,
    status: filterInputs.status.value,
    priority: filterInputs.priority.value,
    category: filterInputs.category.value,
    technicianId: filterInputs.technicianId.value
  };
}

// Build one table row for a ticket.
function makeTicketRow(ticket) {
  const row = document.createElement('tr');

  function addCell(content, className) {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    if (typeof content === 'string') {
      cell.textContent = content;
    } else {
      cell.appendChild(content);
    }
    row.appendChild(cell);
    return cell;
  }

  addCell(ticket.ticketNo, 'fw-semibold text-nowrap');
  addCell(ticket.requesterName);
  addCell(ticket.category);
  const descriptionCell = addCell(ticket.description, 'description-cell');
  descriptionCell.title = ticket.description;
  addCell(makeBadge(ticket.priority, PRIORITY_BADGE[ticket.priority]));
  addCell(makeBadge(ticket.status, STATUS_BADGE[ticket.status]));
  addCell(technicianName(ticket.technicianId), ticket.technicianId ? '' : 'text-body-secondary');
  addCell(formatDate(ticket.createdAt), 'text-nowrap');

  const link = document.createElement('a');
  link.href = 'details.html?id=' + encodeURIComponent(ticket.ticketNo);
  link.className = 'btn btn-sm btn-outline-primary';
  link.textContent = 'View';
  addCell(link);

  return row;
}

// Filter, sort and draw the table.
function renderTicketList() {
  const allTickets = loadTickets();
  const shown = sortTickets(filterTickets(allTickets, readCriteria()), filterInputs.sortBy.value);

  const body = document.getElementById('ticketTableBody');
  body.innerHTML = '';
  shown.forEach(function (ticket) {
    body.appendChild(makeTicketRow(ticket));
  });

  document.getElementById('resultCount').textContent =
    'Showing ' + shown.length + ' of ' + allTickets.length + ' tickets';

  const emptyMessage = document.getElementById('emptyMessage');
  if (allTickets.length === 0) {
    emptyMessage.textContent = 'No tickets yet. Use "New Ticket" to create one.';
  } else {
    emptyMessage.textContent = 'No tickets match your filters.';
  }
  emptyMessage.classList.toggle('d-none', shown.length > 0);
}

// Reset every filter and the sort order.
function clearFilters() {
  filterInputs.keyword.value = '';
  filterInputs.status.value = '';
  filterInputs.priority.value = '';
  filterInputs.category.value = '';
  filterInputs.technicianId.value = '';
  filterInputs.sortBy.value = 'newest';
  history.replaceState(null, '', 'tickets.html'); // remove filters from the URL
  renderTicketList();
}

setUpFilters();
renderTicketList();
showStorageWarningIfNeeded();

filterInputs.keyword.addEventListener('input', renderTicketList);
['status', 'priority', 'category', 'technicianId', 'sortBy'].forEach(function (name) {
  filterInputs[name].addEventListener('change', renderTicketList);
});
document.getElementById('clearFilters').addEventListener('click', clearFilters);
