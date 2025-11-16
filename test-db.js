require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Count users
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);
        
        // List all users (without passwords)
        const users = await User.find().select('-password').limit(10);
        console.log('\n👥 Users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} - ${user.email} (Created: ${user.createdAt})`);
        });
        
        if (users.length === 0) {
            console.log('No users found in database.');
        }
        
        await mongoose.connection.close();
        console.log('\n✅ Connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testDB();
