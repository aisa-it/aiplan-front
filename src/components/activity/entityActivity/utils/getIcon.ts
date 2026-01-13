export const getIcon = (name: string): string => {
  switch (name) {
    case 'deleted':
      return 'delete';
    case 'created':
      return 'add_circle_outline';
    case 'updated':
      return 'edit';
    default:
      return 'visibility';
  }
};

