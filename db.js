/* project by 
    sachindev
sachindev349@gmail.com */

const { MongoClient } = require('mongodb');
const uri = "";  

let db;

async function connectToDb() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('Task');  
    console.log('Connected to MongoDB Atlas');
}

function getDb() {
    return db;
}

module.exports = { connectToDb, getDb };

