/**
 * Get emoji based on sport name
 * @param {string} sportName - Name of the sport
 * @returns {string} Emoji corresponding to the sport
 */
export const getSportEmoji = (sportName) => {
  if (!sportName) return '⋯';

  const sport = sportName.toLowerCase().trim();
  const emojiMap = {
    cricket: '🏏',
    football: '⚽',
    badminton: '🏸',
    running: '🏃',
    basketball: '🏀',
    tennis: '🎾',
    kabaddi: '🤼',
  };

  return emojiMap[sport] || '⋯';
};

/**
 * Get skill level label based on numeric value (0-100)
 * @param {number} level - Skill level (0-100)
 * @returns {string} Label for the skill level
 */
export const getSkillLevelLabel = (level) => {
  if (level === undefined || level === null) return 'Beginner';
  
  const numLevel = parseInt(level);
  
  if (numLevel <= 30) return 'Beginner';
  if (numLevel <= 70) return 'Intermediate';
  return 'Advanced';
};
