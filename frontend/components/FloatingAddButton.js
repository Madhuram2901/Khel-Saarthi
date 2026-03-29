import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FloatingAddButton = ({ onPress }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    return (
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
            <Ionicons name="add" size={26} color="#FFF" />
        </TouchableOpacity>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    button: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FloatingAddButton;
