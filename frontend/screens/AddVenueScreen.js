import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import StyledButton from '../components/StyledButton';
import AuthContext from '../context/AuthContext';

const AddVenueScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pricePerHour, setPricePerHour] = useState('');
    const [sportTypes, setSportTypes] = useState(''); // Comma separated for now
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Basic amenities state
    const [amenities, setAmenities] = useState({
        parking: false,
        washroom: false,
        lights: false,
        drinkingWater: false
    });

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        if (!name || !address || !city || !pricePerHour || !image) {
            Alert.alert('Error', 'Please fill required fields and add an image');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('address', address);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('pricePerHour', pricePerHour);

            // Convert comma separated string to array
            const sportsArray = sportTypes.split(',').map(s => s.trim()).filter(s => s);
            formData.append('sportTypes', JSON.stringify(sportsArray));

            // Default location for now (Mumbai center) - In real app use Geolocation
            formData.append('location', JSON.stringify({ type: 'Point', coordinates: [72.8777, 19.0760] }));

            formData.append('amenities', JSON.stringify(amenities));

            // Append Image
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('images', { uri: image, name: filename, type });

            await api.post('/venues', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Venue Created Successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Could not create venue');
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (key) => {
        setAmenities(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={styles.imageSection}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="camera" size={40} color="#ccc" />
                            <Text style={styles.placeholderText}>Add Venue Image</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Venue Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. City Sports Complex" />

                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="Describe your venue..." />

                <Text style={styles.label}>Address *</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street Address" />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>City *</Text>
                        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>State</Text>
                        <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="State" />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Price/Hour (₹) *</Text>
                        <TextInput style={styles.input} value={pricePerHour} onChangeText={setPricePerHour} keyboardType="numeric" placeholder="1000" />
                    </View>
                </View>

                <Text style={styles.label}>Sports (Comma separated) *</Text>
                <TextInput style={styles.input} value={sportTypes} onChangeText={setSportTypes} placeholder="Cricket, Football, Badminton" />

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

                <StyledButton title="Create Venue" onPress={handleCreate} disabled={loading} style={{ marginTop: 20 }} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    imageSection: { height: 200, backgroundColor: '#f0f0f0' },
    imagePicker: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center' },
    placeholderText: { color: '#999', marginTop: 10 },
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

export default AddVenueScreen;
