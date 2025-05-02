const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Bill = require('../models/Bill');

// Sales report
router.get('/', async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from && to) {
    where.createdAt = {
      [Op.between]: [new Date(from), new Date(to)]
    };
  }
  const bills = await Bill.findAll({ where });

  const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalOrders = bills.length;

  res.json({ totalOrders, totalRevenue, bills });
});

module.exports = router;
