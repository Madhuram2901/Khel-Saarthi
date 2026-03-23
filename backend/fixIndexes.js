const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Payment = require('./models/paymentModel');

dotenv.config();

async function fixDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        // This drops the old razorpay indexes that are no longer in our mongoose schema
        await Payment.collection.dropIndex('razorpayOrderId_1').catch(e => console.log('Index razorpayOrderId_1 not found/already dropped'));
        await Payment.collection.dropIndex('razorpayPaymentId_1').catch(e => console.log('Index razorpayPaymentId_1 not found/already dropped'));
        
        console.log('Indexes dropped. Syncing new indexes...');
        await Payment.syncIndexes();
        console.log('New indexes synced successfully.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixDB();
