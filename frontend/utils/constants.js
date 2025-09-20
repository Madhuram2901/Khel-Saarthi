// Constants for sports-related data and styling
export const SPORT_IMAGES = {
  'Kabaddi': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
  'Badminton': 'https://images.unsplash.com/photo-1544737151-6e4b6999de49',
  'Cricket': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
  'Football': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d',
  'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
  'Tennis': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8',
  'Running': 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571',
};

export const DEFAULT_SPORT_IMAGE = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211';

export const CATEGORY_ICONS = {
  'All': 'apps',
  'Cricket': 'american-football',
  'Football': 'football',
  'Badminton': 'tennisball',
  'Running': 'walk',
  'Basketball': 'basketball',
  'Tennis': 'tennisball',
  'Kabaddi': 'fitness',
  'Other': 'ellipsis-horizontal',
};

export const CATEGORY_COLORS = {
  'All': '#007AFF',
  'Cricket': '#34C759',
  'Football': '#FF9500',
  'Badminton': '#AF52DE',
  'Running': '#FF3B30',
  'Basketball': '#FF6B35',
  'Tennis': '#5AC8FA',
  'Kabaddi': '#FFCC02',
  'Other': '#8E8E93',
};

export const THEME_COLORS = {
  primary: '#007AFF',
  secondary: '#F2F2F7',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',
  accent: '#FF6B35',
  text: '#1D1D1F',
  textSecondary: '#8E8E93',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E5E5EA',
};

// Utility functions
export const getSportImage = (category, size = 'w=600') => {
  const baseUrl = SPORT_IMAGES[category] || DEFAULT_SPORT_IMAGE;
  return `${baseUrl}?${size}`;
};

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || 'ellipse';

export const getCategoryColor = (category) => CATEGORY_COLORS[category] || THEME_COLORS.primary;

export const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }),
    year: date.getFullYear(),
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    formatted: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
  };
};

export const calculateHoursLeft = (eventDate) => {
  return Math.max(0, Math.floor((new Date(eventDate) - new Date()) / (1000 * 60 * 60)));
};