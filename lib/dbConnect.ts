import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {};
let client: mongoose.mongo.MongoClient | null = null;

const MONGODB_URI: string = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

async function connectDB(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to the database");
        return;
    }

    try {
        const db = await mongoose.connect(MONGODB_URI);
        connection.isConnected = db.connections[0].readyState;
        client = db.connections[0].getClient();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1);
    }
}

// Accessor function to safely get the client after connection
function getClient(): mongoose.mongo.MongoClient {
    if (!client) {
        throw new Error("MongoClient is not initialized. Please call connectDB() first.");
    }
    return client;
}

export { connectDB, getClient };
