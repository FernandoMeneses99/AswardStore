const { pool } = require('../../config/db');

class ProductsRepository {
  async findAll() {
    const query = `
      SELECT id, name, description, price, sku, category, stock, image_url, created_at, updated_at
      FROM products 
      WHERE stock > 0
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT id, name, description, price, sku, category, stock, image_url, created_at, updated_at
      FROM products 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async create(productData) {
    const { name, description, price, sku, category, stock, image_url } = productData;
    
    const query = `
      INSERT INTO products (name, description, price, sku, category, stock, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, description, price, sku, category, stock, image_url, created_at, updated_at
    `;
    
    const values = [name, description, price, sku, category, stock, image_url];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(id, productData) {
    const { name, description, price, sku, category, stock, image_url } = productData;
    
    const query = `
      UPDATE products 
      SET name = $1, description = $2, price = $3, sku = $4, category = $5, stock = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, name, description, price, sku, category, stock, image_url, created_at, updated_at
    `;
    
    const values = [name, description, price, sku, category, stock, image_url, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new ProductsRepository();