// Quick script to verify users and set admin role
// Run this with: node verify-user.js shams92k@gmail.com admin

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mahmud23k:GAp6cJIqG2EHAhob@cluster01.t2pjwpa.mongodb.net/PhishGuard?retryWrites=true&w=majority';

async function updateUser(email, makeAdmin = false) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

    // Build update object
    const updateData = { 
      emailVerified: true 
    };

    if (makeAdmin) {
      updateData.role = 'admin';
    }

    const result = await User.updateOne(
      { email: email.toLowerCase() },
      { $set: updateData }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ User ${email} updated successfully!`);
      console.log(`   - Email verified: ✅`);
      if (makeAdmin) {
        console.log(`   - Role: 👑 ADMIN`);
      }
    } else {
      console.log(`⚠️  User ${email} not found or already updated`);
      console.log(`   Checking if user exists...`);
      
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`✅ User exists:`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Verified: ${user.emailVerified ? '✅' : '❌'}`);
        console.log(`   - Role: ${user.role}`);
      } else {
        console.log(`❌ User not found in database`);
      }
    }

    await mongoose.connection.close();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get arguments from command line
const email = process.argv[2] || 'shams92k@gmail.com';
const makeAdmin = process.argv[3] === 'admin';

if (makeAdmin) {
  console.log(`🔧 Verifying ${email} and setting as ADMIN...\n`);
} else {
  console.log(`🔧 Verifying ${email}...\n`);
}

updateUser(email, makeAdmin);
