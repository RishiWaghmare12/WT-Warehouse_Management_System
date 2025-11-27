const { connectDB } = require('../config/db');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

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
  const count = await Category.countDocuments();
  if (count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  const categoryDocs = await Category.insertMany(
    seedData.categories.map(cat => ({
      name: cat.name,
      max_capacity: cat.max_capacity,
      current_capacity: 0
    }))
  );

  for (const category of categoryDocs) {
    const items = seedData.items[category.name] || [];
    let categoryCapacity = 0;

    for (const itemData of items) {
      const newItem = await Item.create({
        name: itemData.name,
        category_id: category._id,
        max_quantity: 100,
        current_quantity: itemData.quantity
      });

      await Transaction.create({
        item_id: newItem._id,
        quantity: itemData.quantity,
        transaction_type: 'RECEIVE',
        transaction_date: new Date()
      });

      categoryCapacity += itemData.quantity;
    }

    await Category.findByIdAndUpdate(category._id, { current_capacity: categoryCapacity });
  }

  console.log('Seeding complete');
};

module.exports = seedDatabase;

if (require.main === module) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
