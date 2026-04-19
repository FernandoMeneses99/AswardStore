const productsService = require('./products.service');

class ProductsController {
  async getAllProducts(req, res) {
    try {
      const products = await productsService.getAllProducts();
      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error in getAllProducts:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ID is a number
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }
      
      const product = await productsService.getProductById(id);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error in getProductById:', error.message);
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async createProduct(req, res) {
    try {
      const productData = req.body;
      
      // Basic validation
      if (!productData.name || !productData.price || !productData.sku) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, price, sku'
        });
      }
      
      // Validate price is a positive number
      if (isNaN(productData.price) || productData.price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number'
        });
      }
      
      // Validate stock is a non-negative integer (if provided)
      if (productData.stock !== undefined && (isNaN(productData.stock) || productData.stock < 0 || !Number.isInteger(productData.stock))) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a non-negative integer'
        });
      }
      
      const product = await productsService.createProduct(productData);
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error in createProduct:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ID is a number
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }
      
      const productData = req.body;
      
      // Validate price is a positive number (if provided)
      if (productData.price !== undefined && (isNaN(productData.price) || productData.price <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number'
        });
      }
      
      // Validate stock is a non-negative integer (if provided)
      if (productData.stock !== undefined && (isNaN(productData.stock) || productData.stock < 0 || !Number.isInteger(productData.stock))) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a non-negative integer'
        });
      }
      
      const product = await productsService.updateProduct(id, productData);
      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error in updateProduct:', error.message);
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ID is a number
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }
      
      await productsService.deleteProduct(id);
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteProduct:', error.message);
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new ProductsController();