// dashboard.js — code for index.html only.

// Put the counts into the dashboard cards.
function renderDashboard() {
  const tickets = loadTickets();
  const stats = getDashboardStats(tickets);

  document.getElementById('countOpen').textContent = stats.byStatus['Open'];
  document.getElementById('countInProgress').textContent = stats.byStatus['In Progress'];
  document.getElementById('countResolved').textContent = stats.byStatus['Resolved'];
  document.getElementById('countClosed').textContent = stats.byStatus['Closed'];
  document.getElementById('countTotal').textContent = stats.total;
  document.getElementById('countOpenUnassigned').textContent = stats.openUnassigned;

  document.getElementById('emptyState').classList.toggle('d-none', stats.total > 0);
  showStorageWarningIfNeeded();
}

renderDashboard();
