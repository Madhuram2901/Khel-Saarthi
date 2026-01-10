import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import StyledButton from '../components/StyledButton';
import { getSportImage } from '../utils/constants';

const EditEventScreen = ({ route, navigation }) => {
    const { eventId } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState(null);
    const [category, setCategory] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [entryFee, setEntryFee] = useState('0');
    const [loading, setLoading] = useState(true);
    const [bannerImage, setBannerImage] = useState(null);
    const [existingBanner, setExistingBanner] = useState('');

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

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${eventId}`);
                setTitle(data.title);
                setDescription(data.description);
                setDate(new Date(data.date).toISOString().split('T')[0]);
                setCategory(data.category);
                setSkillLevel(data.skillLevel);
                setEntryFee(data.entryFee.toString());
                setLocation({
                    latitude: data.location.coordinates[1],
                    longitude: data.location.coordinates[0],
                });
                setExistingBanner(data.bannerImage || '');
                setLoading(false);
            } catch (error) {
                Alert.alert('Error', 'Could not fetch event data.');
            }
        };
        fetchEvent();
    }, [eventId]);

    const pickBannerImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
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

    const handleUpdateEvent = async () => {
        if (!title || !description || !date || !location || !category || !skillLevel) {
            Alert.alert('Error', 'Please fill in all fields.');
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

            // Add new banner image if selected
            if (bannerImage) {
                formData.append('bannerImage', {
                    uri: bannerImage.uri,
                    type: 'image/jpeg',
                    name: 'banner.jpg',
                });
            }

            await api.put(`/events/${eventId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Event updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error(error.response?.data);
            Alert.alert('Error', 'Could not update event.');
        }
    };

    if (loading) return <View style={styles.centered}><Text>Loading Event Data...</Text></View>;

    const displayBanner = bannerImage ? bannerImage.uri : (existingBanner || getSportImage(category));

    return (
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 120 }]}>
            <Text style={styles.title}>Edit Event</Text>

            {/* Banner Image Picker */}
            <View style={styles.bannerSection}>
                <Text style={styles.label}>Event Banner</Text>
                <TouchableOpacity
                    style={styles.bannerPicker}
                    onPress={pickBannerImage}
                >
                    <Image
                        source={{ uri: displayBanner }}
                        style={styles.bannerPreview}
                    />
                    <View style={styles.bannerOverlay}>
                        <Ionicons name="camera" size={32} color="#fff" />
                        <Text style={styles.bannerOverlayText}>Change Banner</Text>
                    </View>
                </TouchableOpacity>
                {(bannerImage || existingBanner) && (
                    <TouchableOpacity
                        style={styles.removeBannerButton}
                        onPress={() => {
                            setBannerImage(null);
                            setExistingBanner('');
                        }}
                    >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                        <Text style={styles.removeBannerText}>Remove Banner (Use Default)</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TextInput style={styles.input} placeholder="Event Title" value={title} onChangeText={setTitle} />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
            />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />

            <Text style={styles.label}>Entry Fee (₹)</Text>
            <TextInput style={styles.input} placeholder="0 for free" value={entryFee} onChangeText={setEntryFee} keyboardType="numeric" />

            <Text style={styles.label}>Category</Text>
            <View style={styles.optionsContainer}>
                {categories.map(cat => (
                    <TouchableOpacity key={cat} style={[styles.optionButton, category === cat && styles.selectedOption]} onPress={() => setCategory(cat)}>
                        <Text style={[styles.optionText, category === cat && styles.selectedOptionText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.optionsContainer}>
                {skillLevels.map(level => (
                    <TouchableOpacity key={level} style={[styles.optionButton, skillLevel === level && styles.selectedOption]} onPress={() => setSkillLevel(level)}>
                        <Text style={[styles.optionText, skillLevel === level && styles.selectedOptionText]}>{level}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Update Event Location</Text>
            <MapView style={styles.map} region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }} onPress={handleMapPress}>
                {location && <Marker coordinate={location} />}
            </MapView>
            <StyledButton title="Update Event" onPress={handleUpdateEvent} style={{ marginTop: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    bannerSection: {
        marginBottom: 20,
    },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10, color: '#333' },
    bannerPicker: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerOverlayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
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
    input: { minHeight: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 5 },
    map: { width: '100%', height: 300, marginBottom: 10 },
    optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    optionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#eee', marginRight: 10, marginBottom: 10 },
    selectedOption: { backgroundColor: '#007AFF' },
    optionText: { color: 'black' },
    selectedOptionText: { color: 'white' }
});

export default EditEventScreen;