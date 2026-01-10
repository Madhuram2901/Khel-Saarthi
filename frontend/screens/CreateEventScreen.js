import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import StyledButton from '../components/StyledButton';

const CreateEventScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState(null);
    const [category, setCategory] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [entryFee, setEntryFee] = useState('0');
    const [bannerImage, setBannerImage] = useState(null);

    const categories = ['Cricket', 'Football', 'Badminton', 'Running', 'Other'];
    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

    // Request permissions
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions to upload banner images');
            }
        })();
    }, []);

    const pickBannerImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9], // Banner aspect ratio
                quality: 0.8,
            });

            if (!result.canceled) {
                setBannerImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleMapPress = (e) => {
        setLocation(e.nativeEvent.coordinate);
    };

    const handleCreateEvent = async () => {
        if (!title || !description || !date || !location || !category || !skillLevel) {
            Alert.alert('Error', 'Please fill in all fields and select a location, category, and skill level.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('date', date);
            formData.append('location', JSON.stringify({
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            }));
            formData.append('category', category);
            formData.append('skillLevel', skillLevel);
            formData.append('entryFee', entryFee);

            // Add banner image if selected
            if (bannerImage) {
                formData.append('bannerImage', {
                    uri: bannerImage.uri,
                    type: 'image/jpeg',
                    name: 'banner.jpg',
                });
            }

            await api.post('/events', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Event created successfully!');
            navigation.goBack();
        } catch (error) {
            console.error(error.response?.data);
            Alert.alert('Error', 'Could not create event.');
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 120 }]}>
            <Text style={styles.title}>Create New Event</Text>

            {/* Banner Image Picker */}
            <View style={styles.bannerSection}>
                <Text style={styles.label}>Event Banner (Optional)</Text>
                <TouchableOpacity
                    style={styles.bannerPicker}
                    onPress={pickBannerImage}
                >
                    {bannerImage ? (
                        <Image
                            source={{ uri: bannerImage.uri }}
                            style={styles.bannerPreview}
                        />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <Ionicons name="image-outline" size={48} color="#999" />
                            <Text style={styles.bannerPlaceholderText}>
                                Tap to upload banner
                            </Text>
                            <Text style={styles.bannerHint}>
                                Recommended: 1600x900px (16:9)
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
                {bannerImage && (
                    <TouchableOpacity
                        style={styles.removeBannerButton}
                        onPress={() => setBannerImage(null)}
                    >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                        <Text style={styles.removeBannerText}>Remove Banner</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TextInput
                style={styles.input}
                placeholder="Event Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
            />
            <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
            />

            <Text style={styles.label}>Entry Fee (₹)</Text>
            <TextInput
                style={styles.input}
                placeholder="0 for free"
                value={entryFee}
                onChangeText={setEntryFee}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.optionsContainer}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.optionButton, category === cat && styles.selectedOption]}
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={[styles.optionText, category === cat && styles.selectedOptionText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.optionsContainer}>
                {skillLevels.map(level => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.optionButton, skillLevel === level && styles.selectedOption]}
                        onPress={() => setSkillLevel(level)}
                    >
                        <Text style={[styles.optionText, skillLevel === level && styles.selectedOptionText]}>{level}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Select Event Location</Text>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 23.2599,
                    longitude: 77.4126,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
            >
                {location && <Marker coordinate={location} />}
            </MapView>
            <StyledButton title="Create Event" onPress={handleCreateEvent} style={{ marginTop: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    bannerSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
        color: '#333',
    },
    bannerPicker: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    bannerPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    bannerPlaceholderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    bannerHint: {
        marginTop: 5,
        fontSize: 12,
        color: '#999',
    },
    removeBannerButton: {
        marginTop: 10,
        padding: 12,
        backgroundColor: '#ff3b30',
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    removeBannerText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        minHeight: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 5,
    },
    map: {
        width: '100%',
        height: 300,
        marginBottom: 10,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginRight: 10,
        marginBottom: 10
    },
    selectedOption: {
        backgroundColor: '#007AFF'
    },
    optionText: {
        color: 'black'
    },
    selectedOptionText: {
        color: 'white'
    }
});

export default CreateEventScreen;