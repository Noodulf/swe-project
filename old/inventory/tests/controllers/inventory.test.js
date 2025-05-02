const request = require('supertest');
const app = require('../../server');
const { sequelize, Inventory, Ingredient } = require('../../models');

describe('Inventory Controller Tests', () => {
  beforeAll(async () => {
    // Sync database before tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection after tests
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear tables before each test
    await Inventory.destroy({ where: {} });
    await Ingredient.destroy({ where: {} });
  });

  describe('GET /inventory', () => {
    it('should return empty array when no inventory exists', async () => {
      const response = await request(app)
        .get('/api/inventory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all inventory items', async () => {
      // Create test ingredient
      const ingredient = await Ingredient.create({
        name: 'Test Ingredient',
        unit: 'kg',
        pricePerUnit: 10.00
      });

      // Create test inventory
      await Inventory.create({
        ingredientId: ingredient.ingredientId,
        currentQuantity: 100,
        thresholdValue: 20
      });

      const response = await request(app)
        .get('/api/inventory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].currentQuantity).toBe(100);
    });
  });

  describe('GET /inventory/:id', () => {
    it('should return 404 for non-existent inventory item', async () => {
      const response = await request(app)
        .get('/api/inventory/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Inventory item not found');
    });

    it('should return inventory item by id', async () => {
      // Create test ingredient
      const ingredient = await Ingredient.create({
        name: 'Test Ingredient',
        unit: 'kg',
        pricePerUnit: 10.00
      });

      // Create test inventory
      const inventory = await Inventory.create({
        ingredientId: ingredient.ingredientId,
        currentQuantity: 100,
        thresholdValue: 20
      });

      const response = await request(app)
        .get(`/api/inventory/${inventory.inventoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentQuantity).toBe(100);
    });
  });

  describe('POST /inventory/update-stock', () => {
    it('should update inventory quantity', async () => {
      // Create test ingredient
      const ingredient = await Ingredient.create({
        name: 'Test Ingredient',
        unit: 'kg',
        pricePerUnit: 10.00
      });

      // Create test inventory
      const inventory = await Inventory.create({
        ingredientId: ingredient.ingredientId,
        currentQuantity: 100,
        thresholdValue: 20
      });

      const response = await request(app)
        .post('/api/inventory/update-stock')
        .send({
          ingredientId: ingredient.ingredientId,
          quantity: 50
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentQuantity).toBe(150);
    });

    it('should not allow negative stock', async () => {
      // Create test ingredient
      const ingredient = await Ingredient.create({
        name: 'Test Ingredient',
        unit: 'kg',
        pricePerUnit: 10.00
      });

      // Create test inventory
      await Inventory.create({
        ingredientId: ingredient.ingredientId,
        currentQuantity: 100,
        thresholdValue: 20
      });

      const response = await request(app)
        .post('/api/inventory/update-stock')
        .send({
          ingredientId: ingredient.ingredientId,
          quantity: -150
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot reduce stock below zero');
    });
  });

  describe('POST /inventory/check-levels', () => {
    it('should identify items below threshold', async () => {
      // Create test ingredient
      const ingredient = await Ingredient.create({
        name: 'Test Ingredient',
        unit: 'kg',
        pricePerUnit: 10.00
      });

      // Create test inventory below threshold
      await Inventory.create({
        ingredientId: ingredient.ingredientId,
        currentQuantity: 5,
        thresholdValue: 20
      });

      const response = await request(app)
        .post('/api/inventory/check-levels')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
}); 