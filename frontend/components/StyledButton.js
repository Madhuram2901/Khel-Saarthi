import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const StyledButton = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  icon,
  size = 'medium',
  disabled = false
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const getIconSize = () => {
    switch (size) {
      case 'large': return 20;
      case 'small': return 14;
      default: return 16;
    }
  };

  const getIconColor = () => {
    if (disabled) return '#A0A0A0';
    if (variant === 'secondary' || variant === 'outline') return colors.accent;
    return '#FFFFFF';
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];

    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    } else {
      baseStyle.push(styles[`button_${variant}`]);
    }

    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];

    if (disabled) {
      baseStyle.push(styles.textDisabled);
    } else {
      baseStyle.push(styles[`text_${variant}`]);
    }

    return [...baseStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.icon}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  button_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  button_primary: {
    backgroundColor: colors.accent,
  },
  button_secondary: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  button_danger: {
    backgroundColor: colors.accentRed,
  },
  button_success: {
    backgroundColor: colors.accentGreen,
  },
  buttonDisabled: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: colors.accent,
  },
  text_outline: {
    color: colors.accent,
  },
  text_danger: {
    color: '#FFFFFF',
  },
  text_success: {
    color: '#FFFFFF',
  },
  textDisabled: {
    color: '#A0A0A0',
  },
  icon: {
    marginRight: 8,
  },
});

export default StyledButton;