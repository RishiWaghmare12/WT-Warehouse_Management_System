const { pool } = require('../config/db');

const seedData = {
  categories: [
    { name: 'Electronics', max_capacity: 500 },
    { name: 'Appliances', max_capacity: 500 },
    { name: 'Furniture', max_capacity: 500 },
    { name: 'Clothing', max_capacity: 500 },
    { name: 'Books', max_capacity: 500 }
  ],
  items: {
    'Electronics': [
      { name: 'Laptop', quantity: 45 },
      { name: 'Smartphone', quantity: 75 },
      { name: 'Tablet', quantity: 30 },
      { name: 'Headphones', quantity: 50 },
      { name: 'Smartwatch', quantity: 40 }
    ],
    'Appliances': [
      { name: 'Refrigerator', quantity: 15 },
      { name: 'Microwave', quantity: 25 },
      { name: 'Washing Machine', quantity: 10 },
      { name: 'Air Conditioner', quantity: 20 },
      { name: 'Vacuum Cleaner', quantity: 30 }
    ],
    'Furniture': [
      { name: 'Office Chair', quantity: 20 },
      { name: 'Desk', quantity: 15 },
      { name: 'Bookshelf', quantity: 10 },
      { name: 'Sofa', quantity: 12 },
      { name: 'Coffee Table', quantity: 18 }
    ],
    'Clothing': [
      { name: 'T-Shirts', quantity: 60 },
      { name: 'Jeans', quantity: 40 },
      { name: 'Jackets', quantity: 25 },
      { name: 'Dresses', quantity: 35 },
      { name: 'Sweaters', quantity: 45 }
    ],
    'Books': [
      { name: 'Fiction', quantity: 80 },
      { name: 'Non-Fiction', quantity: 65 },
      { name: 'Technical', quantity: 50 },
      { name: 'Children', quantity: 70 },
      { name: 'Educational', quantity: 55 }
    ]
  }
};

const seedDatabase = async () => {
  const categoriesCount = await pool.query('SELECT COUNT(*) FROM categories');
  
  if (parseInt(categoriesCount.rows[0].count) > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database with initial data...');

  // Insert categories
  const categoryValues = seedData.categories
    .map((cat, i) => `('${cat.name}', ${cat.max_capacity}, 0)`)
    .join(', ');
  
  await pool.query(`
    INSERT INTO categories (name, max_capacity, current_capacity) 
    VALUES ${categoryValues}
  `);
  console.log('Categories seeded');

  // Get inserted categories
  const categories = await pool.query('SELECT * FROM categories');
  
  // Insert items for each category
  for (const category of categories.rows) {
    const items = seedData.items[category.name] || [];
    let categoryCapacity = 0;
    
    for (const item of items) {
      const newItem = await pool.query(`
        INSERT INTO items (name, category_id, max_quantity, current_quantity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [item.name, category.category_id, 100, item.quantity]);
      
      await pool.query(`
        INSERT INTO transactions (item_id, quantity, transaction_type)
        VALUES ($1, $2, $3)
      `, [newItem.rows[0].item_id, item.quantity, 'RECEIVE']);
      
      categoryCapacity += item.quantity;
    }
    
    await pool.query(`
      UPDATE categories
      SET current_capacity = $1
      WHERE category_id = $2
    `, [categoryCapacity, category.category_id]);
  }
  
  console.log('Items and transactions seeded');
};

module.exports = seedDatabase;
