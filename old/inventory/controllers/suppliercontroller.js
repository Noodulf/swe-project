// controllers/supplierController.js
const Supplier = require('../models/Supplier');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    return res.status(200).json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
};

// Get a single supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const supplier = await Supplier.create(req.body);
    console.log('Created supplier:', supplier.toJSON());
    return res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Detailed error creating supplier:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error fields:', error.fields);
    return res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactInfo, email, phone } = req.body;
    
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    await supplier.update({
      name: name || supplier.name,
      contactInfo: contactInfo || supplier.contactInfo,
      email: email || supplier.email,
      phone: phone || supplier.phone
    });
    
    return res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    await supplier.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};