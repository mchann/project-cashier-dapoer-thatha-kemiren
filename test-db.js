const mongoose = require('mongoose');
const env = require('dotenv');
env.config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const txs = await db.collection('transactions').find({}).sort({createdAt: -1}).limit(2).toArray();
  console.log(JSON.stringify(txs, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
