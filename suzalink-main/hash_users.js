const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = 'mongodb+srv://suzalink:123123123@suzalink.ek2dhoa.mongodb.net/?retryWrites=true&w=majority&appName=suzalink'; // <-- Replace with your real MongoDB URI
const dbName = 'suzali_crm';

async function hashPasswords() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  // Find users whose password is not hashed (doesn't start with $2)
  const cursor = users.find({ password: { $not: /^(\$2[aby]?\$)/ } });

  while (await cursor.hasNext()) {
    const user = await cursor.next();
    const plain = user.password;
    const hash = await bcrypt.hash(plain, 10);
    await users.updateOne({ _id: user._id }, { $set: { password: hash } });
    console.log(`Updated user ${user.email}`);
  }

  await client.close();
  console.log('All done!');
}

hashPasswords();