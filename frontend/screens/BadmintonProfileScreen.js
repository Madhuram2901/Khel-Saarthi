import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import StyledButton from '../components/StyledButton';

const BadmintonProfileScreen = ({ navigation }) => {
    const { user, login } = useContext(AuthContext);
    const { colors } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const badmintonProfile = user.profiles?.badminton || {};

    const [skillLevel, setSkillLevel] = useState(badmintonProfile.skillLevel || '');
    const [playstyle, setPlaystyle] = useState(badmintonProfile.playstyle || '');
    const [height, setHeight] = useState(badmintonProfile.height?.toString() || '');
    const [weight, setWeight] = useState(badmintonProfile.weight?.toString() || '');
    const [experience, setExperience] = useState(badmintonProfile.experience?.toString() || '');

    const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const playstyles = ['Smasher', 'Retriever', 'All-Rounder'];

    const handleSave = async () => {
        try {
            const profileData = {
                skillLevel,
                playstyle,
                height: parseInt(height),
                weight: parseInt(weight),
                experience: parseInt(experience),
            };

            const { data } = await api.put('/users/profile/badminton', profileData);
            await login(user.email, null, data.token);

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error(error.response?.data);
            Alert.alert('Error', 'Could not update profile.');
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 120 }]}>
            <Text style={styles.title}>Edit Badminton Profile</Text>

            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.optionsContainer}>{skillLevels.map(level => (
                <TouchableOpacity key={level} style={[styles.optionButton, skillLevel === level && styles.selectedOption]} onPress={() => setSkillLevel(level)}>
                    <Text style={[styles.optionText, skillLevel === level && styles.selectedOptionText]}>{level}</Text>
                </TouchableOpacity>
            ))}</View>

            <Text style={styles.label}>Playstyle</Text>
            <View style={styles.optionsContainer}>{playstyles.map(style => (
                <TouchableOpacity key={style} style={[styles.optionButton, playstyle === style && styles.selectedOption]} onPress={() => setPlaystyle(style)}>
                    <Text style={[styles.optionText, playstyle === style && styles.selectedOptionText]}>{style}</Text>
                </TouchableOpacity>
            ))}</View>

            <Text style={styles.label}>Height (cm)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />

            <Text style={styles.label}>Years of Experience</Text>
            <TextInput style={styles.input} value={experience} onChangeText={setExperience} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />

            <StyledButton title="Save Profile" onPress={handleSave} style={{ marginTop: 20 }} />
        </ScrollView>
    );
};

const makeStyles = (colors) => StyleSheet.create({
    container: { padding: 20, backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.text },
    input: { height: 40, borderColor: colors.border, borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, borderRadius: 5, backgroundColor: colors.surface, color: colors.text },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10, color: colors.text },
    optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    optionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: colors.surface2, marginRight: 10, marginBottom: 10 },
    selectedOption: { backgroundColor: colors.accent },
    optionText: { color: colors.text },
    selectedOptionText: { color: 'white' }
});

export default BadmintonProfileScreen;