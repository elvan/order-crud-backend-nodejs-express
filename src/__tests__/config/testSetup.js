const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Setup MongoDB Memory Server for testing
let mongoServer;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close and stop the MongoDB Memory Server after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Utility function to create test data
const createTestData = async (model, data) => {
  return await model.create(data);
};

module.exports = { createTestData };
