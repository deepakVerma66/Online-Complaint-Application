export const getRouteForRole = (role) => {
  switch (role) {
    case 'citizen':
      return 'Home';
    case 'counselor':
      return 'CounselorHome';
    case 'department':
      return 'DepartmentHome';
    case 'mayor':
      return 'MayorDashboard';
    default:
      return 'Login';
  }
};
