import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import StyledButton from '../components/StyledButton';
import AuthContext from '../context/AuthContext';

const EditVenueScreen = ({ route, navigation }) => {
    const { venueId } = route.params;
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pricePerHour, setPricePerHour] = useState('');
    const [sportTypes, setSportTypes] = useState('');
    const [image, setImage] = useState(null); // Current image URL
    const [newImage, setNewImage] = useState(null); // New selected image URI

    const [amenities, setAmenities] = useState({
        parking: false,
        washroom: false,
        lights: false,
        drinkingWater: false
    });

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const { data } = await api.get(`/venues/${venueId}`);
                setName(data.name);
                setDescription(data.description);
                setAddress(data.address);
                setCity(data.city);
                setState(data.state);
                setPricePerHour(data.pricePerHour.toString());
                setSportTypes(data.sportTypes.join(', '));
                setImage(data.images[0]);
                setAmenities(prev => ({ ...prev, ...data.amenities }));
            } catch (error) {
                Alert.alert('Error', 'Could not fetch venue details');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetchVenue();
    }, [venueId]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setNewImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('address', address);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('pricePerHour', pricePerHour);

            const sportsArray = sportTypes.split(',').map(s => s.trim()).filter(s => s);
            formData.append('sportTypes', JSON.stringify(sportsArray));
            formData.append('amenities', JSON.stringify(amenities));

            if (newImage) {
                const filename = newImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('images', { uri: newImage, name: filename, type });
            }

            // Note: We need a PUT endpoint for this. Assuming it exists or I'll create it.
            await api.put(`/venues/${venueId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Venue Updated Successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Could not update venue');
        } finally {
            setUpdating(false);
        }
    };

    const toggleAmenity = (key) => {
        setAmenities(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={styles.imageSection}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    <Image source={{ uri: newImage || image }} style={styles.previewImage} />
                    <View style={styles.overlay}>
                        <Ionicons name="camera" size={24} color="#fff" />
                        <Text style={{ color: '#fff', marginLeft: 5 }}>Change Image</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Venue Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={3} />

                <Text style={styles.label}>Address</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>City</Text>
                        <TextInput style={styles.input} value={city} onChangeText={setCity} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>State</Text>
                        <TextInput style={styles.input} value={state} onChangeText={setState} />
                    </View>
                </View>

                <Text style={styles.label}>Price/Hour (₹)</Text>
                <TextInput style={styles.input} value={pricePerHour} onChangeText={setPricePerHour} keyboardType="numeric" />

                <Text style={styles.label}>Sports</Text>
                <TextInput style={styles.input} value={sportTypes} onChangeText={setSportTypes} />

                <Text style={styles.label}>Amenities</Text>
                <View style={styles.amenitiesContainer}>
                    {Object.keys(amenities).map(key => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.amenityChip, amenities[key] && styles.amenityChipSelected]}
                            onPress={() => toggleAmenity(key)}
                        >
                            <Text style={[styles.amenityText, amenities[key] && styles.amenityTextSelected]}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <StyledButton title="Update Venue" onPress={handleUpdate} disabled={updating} style={{ marginTop: 20 }} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    imageSection: { height: 200, backgroundColor: '#f0f0f0' },
    imagePicker: { flex: 1 },
    previewImage: { width: '100%', height: '100%' },
    overlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
    textArea: { height: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    amenitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
    amenityChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', marginRight: 8, marginBottom: 8 },
    amenityChipSelected: { backgroundColor: '#007AFF' },
    amenityText: { color: '#333' },
    amenityTextSelected: { color: '#fff' }
});

export default EditVenueScreen;
