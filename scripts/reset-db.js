const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function resetDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Collections to keep
    const collectionsToKeep = ['users', 'settings']; 
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    let clearedCount = 0;

    for (let collection of collections) {
      if (collectionsToKeep.includes(collection.name)) {
        console.log(`[SKIP] Keeping data in collection: ${collection.name}`);
        continue;
      }
      
      console.log(`[CLEAR] Deleting all documents from collection: ${collection.name}...`);
      // Hapus isi (dokumen) di dalam collection tanpa menghapus collection-nya
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      clearedCount++;
    }

    console.log(`\n✅ Database reset completed successfully. Cleared data from ${clearedCount} collections.`);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

resetDB();
