const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Collections to clean
    const collections = ['transactions', 'draftorders', 'expenses', 'shifts'];

    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`Cleared ${collectionName} collection`);
      } catch (err) {
        console.log(`Collection ${collectionName} might not exist or error:`, err.message);
      }
    }

    console.log('\n✅ Successfully cleaned transaction history (Transactions, Draft Orders, Expenses, Shifts)!');
    console.log('The menus, categories, and user accounts are kept intact.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

cleanDB();
