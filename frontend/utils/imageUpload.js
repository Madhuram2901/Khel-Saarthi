import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Request camera permissions
 */
export const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            return false;
        }
    }
    return true;
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async () => {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Media library permission is required to select photos');
            return false;
        }
    }
    return true;
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square for team logos
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0];
        }
        return null;
    } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to pick image');
        return null;
    }
};

/**
 * Take photo with camera
 */
export const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    try {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0];
        }
        return null;
    } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo');
        return null;
    }
};

/**
 * Upload image to Cloudinary
 * @param {Object} imageAsset - Image asset from ImagePicker
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadImageToCloudinary = async (imageAsset, folder = 'team_logos') => {
    try {
        const formData = new FormData();

        // Create file object for upload
        const file = {
            uri: imageAsset.uri,
            type: 'image/jpeg',
            name: `team_logo_${Date.now()}.jpg`,
        };

        formData.append('file', file);
        formData.append('upload_preset', 'team_logos'); // You'll need to create this in Cloudinary
        formData.append('folder', folder);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/image/upload`;

        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = await response.json();

        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Show image picker options
 */
export const showImagePickerOptions = () => {
    return new Promise((resolve) => {
        Alert.alert(
            'Upload Team Logo',
            'Choose an option',
            [
                {
                    text: 'Take Photo',
                    onPress: async () => {
                        const photo = await takePhoto();
                        resolve(photo);
                    },
                },
                {
                    text: 'Choose from Gallery',
                    onPress: async () => {
                        const image = await pickImageFromGallery();
                        resolve(image);
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => resolve(null),
                },
            ],
            { cancelable: true }
        );
    });
};
