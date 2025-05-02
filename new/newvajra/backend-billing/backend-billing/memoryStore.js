const currentOrders = {};  // In-memory orders storage
const itemsList = {  // In-memory predefined list of items
  'item-001': { name: 'Burger', unitPrice: 5.00 },
  'item-002': { name: 'Fries', unitPrice: 2.50 },
  'item-003': { name: 'Soda', unitPrice: 1.75 }
};

module.exports = { currentOrders, itemsList };
