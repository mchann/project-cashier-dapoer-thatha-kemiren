const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function wipeDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      
      // Jangan hapus tabel users untuk login
      if (collectionName === 'users') {
        console.log(`Skipping ${collectionName} collection (LOGIN data)`);
        continue;
      }

      try {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`Cleared ${collectionName} collection`);
      } catch (err) {
        console.log(`Error clearing ${collectionName}:`, err.message);
      }
    }

    console.log('\n✅ Successfully wiped all database records EXCEPT users!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

wipeDB();
