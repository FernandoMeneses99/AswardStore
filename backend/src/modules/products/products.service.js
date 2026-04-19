const productsRepository = require('./products.repository');

class ProductsService {
  async getAllProducts() {
    try {
      return await productsRepository.findAll();
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      const product = await productsRepository.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      // Basic validation
      if (!productData.name || !productData.price || !productData.sku) {
        throw new Error('Missing required fields: name, price, sku');
      }
      return await productsRepository.create(productData);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  async updateProduct(id, productData) {
    try {
      // Check if product exists
      const existingProduct = await productsRepository.findById(id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }
      return await productsRepository.update(id, productData);
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  async deleteProduct(id) {
    try {
      // Check if product exists
      const existingProduct = await productsRepository.findById(id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }
      return await productsRepository.delete(id);
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }
}

module.exports = new ProductsService();