export const notifications = [
  {
    id: '1',
    title: 'Water Supply Maintenance',
    message: 'Routine maintenance work is scheduled in your ward this weekend.',
    date: '08 Apr 2026',
    isNew: true
  },
  {
    id: '2',
    title: 'Streetlight Repair Drive',
    message: 'A night inspection and repair drive will begin from Monday evening.',
    date: '05 Apr 2026',
    isNew: false
  },
  {
    id: '3',
    title: 'Cleanliness Awareness Campaign',
    message: 'Residents are invited to join the local cleanliness campaign on Sunday.',
    date: '02 Apr 2026',
    isNew: false
  }
];

export const complaintStages = [
  { id: 1, title: 'Submitted', active: true },
  { id: 2, title: 'Forwarded to Department', active: true },
  { id: 3, title: 'Acknowledged', active: true },
  { id: 4, title: 'In Progress', active: true },
  { id: 5, title: 'Resolved', active: false }
];
