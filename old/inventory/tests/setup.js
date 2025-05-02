const { sequelize } = require('../config/database');

// Set up test environment
process.env.NODE_ENV = 'test';

// Global before and after hooks
beforeAll(async () => {
  // Ensure we're using the test database
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run in test environment');
  }
});

afterAll(async () => {
  // Clean up any remaining connections
  await sequelize.close();
}); 