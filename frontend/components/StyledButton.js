import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const getIconSize = () => {
    switch (size) {
      case 'large': return 20;
      case 'small': return 14;
      default: return 16;
    }
  };

  const getIconColor = () => {
    if (disabled) return '#A0A0A0';
    if (variant === 'secondary' || variant === 'outline') return '#007AFF';
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

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: '#000',
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
    backgroundColor: '#007AFF',
  },
  button_secondary: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  button_danger: {
    backgroundColor: '#FF3B30',
  },
  button_success: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
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
    color: '#007AFF',
  },
  text_outline: {
    color: '#007AFF',
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