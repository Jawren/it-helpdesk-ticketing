// ui.js — small helpers shared by every page.

// Show a Bootstrap alert at the top of the page. type: 'success', 'danger', 'warning', 'info'.
function showAlert(message, type) {
  const area = document.getElementById('alertArea');
  if (!area) return;

  const alert = document.createElement('div');
  alert.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
  alert.setAttribute('role', 'alert');

  const text = document.createElement('span');
  text.textContent = message; // textContent = shown as plain text, never as HTML
  alert.appendChild(text);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'btn-close';
  close.setAttribute('data-bs-dismiss', 'alert');
  close.setAttribute('aria-label', 'Close');
  alert.appendChild(close);

  area.innerHTML = '';
  area.appendChild(alert);
}

// Warn the user if saved data could not be read (set in storage.js).
function showStorageWarningIfNeeded() {
  if (storageWasCorrupted) {
    showAlert('Saved data could not be read, so the ticket list is empty. ' +
      'Creating a new ticket will replace the damaged data.', 'warning');
  }
}

// Format an ISO date for display, e.g. "Oct 12, 2026, 1:35 PM".
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

// Format an ISO date without the time, e.g. "Oct 12, 2026".
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// "0 days (same day)", "1 day", "3 days"
function formatDays(days) {
  if (days === null || days === undefined) return '—';
  if (days === 0) return '0 days (same day)';
  return days + (days === 1 ? ' day' : ' days');
}

// Bootstrap badge colour for each priority and status.
const PRIORITY_BADGE = { Low: 'text-bg-secondary', Medium: 'text-bg-info', High: 'text-bg-warning', Critical: 'text-bg-danger' };
const STATUS_BADGE = { 'Open': 'text-bg-primary', 'In Progress': 'text-bg-warning', 'Resolved': 'text-bg-success', 'Closed': 'text-bg-dark' };

// Create a <span> badge element.
function makeBadge(text, colourClass) {
  const badge = document.createElement('span');
  badge.className = 'badge ' + (colourClass || 'text-bg-secondary');
  badge.textContent = text;
  return badge;
}

// Fill a <select> with options. items = [{ value, label }].
function fillSelect(select, items, placeholder) {
  select.innerHTML = '';
  if (placeholder !== undefined) {
    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    select.appendChild(first);
  }
  items.forEach(function (item) {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = item.label;
    select.appendChild(option);
  });
}

// Turn a simple list of words into { value, label } items for fillSelect.
function toOptions(list) {
  return list.map(function (word) {
    return { value: word, label: word };
  });
}

// Technician options for fillSelect.
function technicianOptions() {
  return TECHNICIANS.map(function (tech) {
    return { value: tech.id, label: tech.name };
  });
}

// Show validation errors under form fields. fieldIds maps error names to input ids.
function showFieldErrors(errors, fieldIds) {
  Object.keys(fieldIds).forEach(function (name) {
    const input = document.getElementById(fieldIds[name]);
    const feedback = document.getElementById(fieldIds[name] + 'Error');
    if (errors[name]) {
      input.classList.add('is-invalid');
      if (feedback) feedback.textContent = errors[name];
    } else {
      input.classList.remove('is-invalid');
      if (feedback) feedback.textContent = '';
    }
  });
}

// Remove all red error styles from a form.
function clearFieldErrors(fieldIds) {
  showFieldErrors({}, fieldIds);
}
