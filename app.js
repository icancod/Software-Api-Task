/* project by 
    sachindev
sachindev349@gmail.com */

const express = require('express');
const { getDb, connectToDb } = require('./db');
const cors = require('cors');
const app = express();
const path = require('path');  


app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectToDb();
app.use(express.static(__dirname)); 


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html')); 
});

// API to fetch agent call data
app.get('/api/agent-calls', async (req, res) => {
    const db = getDb();
    const start = parseInt(req.query.start);
    const end = parseInt(req.query.end);

    if (!start || !end) {
        return res.status(400).json({ error: 'Invalid start or end timestamp' });
    }

    try {
        const pipeline = [
            {
                $match: {
                    timestamp: { $gte: start, $lte: end } 
                }
            },
            {
                $group: {
                    _id: "$agent_id",
                    connected_calls: {
                        $sum: { $cond: [{ $eq: ["$call_status", "connected"] }, 1, 0] }
                    },
                    not_connected_calls: {
                        $sum: { $cond: [{ $eq: ["$call_status", "not connected"] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "agents",  
                    localField: "_id",
                    foreignField: "_id",
                    as: "agent_info"
                }
            },
            {
                $unwind: "$agent_info"
            },
            {
                $project: {
                    agent_id: "$_id",
                    name: "$agent_info.name",
                    mail:"$agent_info.email",
                    connected_calls: 1,
                    not_connected_calls: 1
                }
            }
        ];

        const results = await db.collection('call_logs').aggregate(pipeline).toArray();
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
