// create.js — code for create.html only.

// Form field names (used by validation) mapped to their input ids.
const TICKET_FIELDS = {
  firstName: 'firstName',
  middleName: 'middleName',
  lastName: 'lastName',
  category: 'category',
  priority: 'priority',
  description: 'description'
};

const ticketForm = document.getElementById('ticketForm');
const descriptionInput = document.getElementById('description');
const descriptionCount = document.getElementById('descriptionCount');

// Fill the dropdowns from data.js so the lists are defined in one place.
function setUpCreateForm() {
  fillSelect(document.getElementById('category'), toOptions(CATEGORIES), 'Choose a category…');
  fillSelect(document.getElementById('priority'), toOptions(PRIORITIES), 'Choose a priority…');
}

// Read the current form values.
function readTicketForm() {
  return {
    firstName: document.getElementById('firstName').value,
    middleName: document.getElementById('middleName').value,
    lastName: document.getElementById('lastName').value,
    category: document.getElementById('category').value,
    priority: document.getElementById('priority').value,
    description: descriptionInput.value
  };
}

// Validate, save, and give feedback when the form is submitted.
function handleTicketSubmit(event) {
  event.preventDefault(); // stop the browser from reloading the page

  const check = validateTicketInput(readTicketForm());
  showFieldErrors(check.errors, TICKET_FIELDS);
  if (!check.valid) {
    showAlert('Please fix the highlighted fields.', 'danger');
    return;
  }

  try {
    const tickets = loadTickets();
    const ticket = createTicket(check.clean, getNextTicketNo(), new Date());
    tickets.push(ticket);
    saveTickets(tickets);

    ticketForm.reset();
    updateDescriptionCount();
    showCreatedMessage(ticket.ticketNo);
  } catch (error) {
    console.error(error);
    showAlert('The ticket could not be saved. Please try again.', 'danger');
  }
}

// Success alert with a link to the new ticket.
function showCreatedMessage(ticketNo) {
  showAlert('Ticket ' + ticketNo + ' created with status Open.', 'success');
  const alert = document.querySelector('#alertArea .alert');
  const link = document.createElement('a');
  link.href = 'details.html?id=' + encodeURIComponent(ticketNo);
  link.className = 'alert-link ms-2';
  link.textContent = 'View ticket';
  alert.insertBefore(link, alert.querySelector('.btn-close'));
}

// Show how many characters are typed in the description.
function updateDescriptionCount() {
  descriptionCount.textContent = descriptionInput.value.length;
}

setUpCreateForm();
loadTickets(); // reading once here lets us warn early if saved data is damaged
showStorageWarningIfNeeded();
ticketForm.addEventListener('submit', handleTicketSubmit);
ticketForm.addEventListener('reset', function () {
  clearFieldErrors(TICKET_FIELDS);
  setTimeout(updateDescriptionCount, 0); // wait until the browser has cleared the fields
});
descriptionInput.addEventListener('input', updateDescriptionCount);
