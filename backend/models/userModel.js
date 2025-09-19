const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['participant', 'host'],
            default: 'participant',
        },
        profilePicture: {
            type: String,
            default: '', // Cloudinary image URL
        },
        profilePicturePublicId: {
            type: String,
            default: '', // Cloudinary public_id for deletion/replacement
        },
        profiles: {
            badminton: {
                skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
                playstyle: { type: String, enum: ['Smasher', 'Retriever', 'All-Rounder'] },
                height: { type: Number }, // in cm
                weight: { type: Number }, // in kg
                experience: { type: Number }, // in years
            },
            // You can add more sports here in the future
            // athletics: { ... }
        },
    },
    {
        timestamps: true,
    }
);

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash the password before saving a new user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;

