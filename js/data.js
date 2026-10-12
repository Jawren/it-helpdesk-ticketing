// data.js — fixed lists used everywhere in the app.

const CATEGORIES = ['Hardware', 'Network', 'Software', 'Account'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

// Bigger number = more urgent. Used for sorting (Critical first).
const PRIORITY_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const TECHNICIANS = [
  { id: 'T01', name: 'Juan Dela Cruz' },
  { id: 'T02', name: 'Ana Reyes' },
  { id: 'T03', name: 'Mark Villanueva' }
];

// Only these status moves are allowed. Everything else is rejected.
const ALLOWED_TRANSITIONS = {
  'Open': ['In Progress'],
  'In Progress': ['Resolved'],
  'Resolved': ['Closed', 'In Progress'],
  'Closed': []
};

// Field limits used by validation.
const LIMITS = {
  namePartMin: 2,   // first and last name
  namePartMax: 30,  // first, middle and last name
  descriptionMin: 10,
  descriptionMax: 500,
  noteMax: 300,
  authorMax: 50
};
