const { connectDB, getDb } = require('../config/db');

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
  const db = getDb();
  const categoriesCollection = db.collection('categories');
  const itemsCollection = db.collection('items');
  const transactionsCollection = db.collection('transactions');

  // Check if already seeded
  const count = await categoriesCollection.countDocuments();
  if (count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database with initial data...');

  // Insert categories
  const categoryDocs = seedData.categories.map(cat => ({
    name: cat.name,
    max_capacity: cat.max_capacity,
    current_capacity: 0
  }));
  
  await categoriesCollection.insertMany(categoryDocs);
  console.log('Categories seeded');

  // Get inserted categories
  const categories = await categoriesCollection.find().toArray();
  
  // Insert items for each category
  for (const category of categories) {
    const items = seedData.items[category.name] || [];
    let categoryCapacity = 0;
    
    for (const item of items) {
      const newItem = await itemsCollection.insertOne({
        name: item.name,
        category_id: category._id,
        max_quantity: 100,
        current_quantity: item.quantity
      });
      
      await transactionsCollection.insertOne({
        item_id: newItem.insertedId,
        quantity: item.quantity,
        transaction_type: 'RECEIVE',
        transaction_date: new Date()
      });
      
      categoryCapacity += item.quantity;
    }
    
    await categoriesCollection.updateOne(
      { _id: category._id },
      { $set: { current_capacity: categoryCapacity } }
    );
  }
  
  console.log('Items and transactions seeded');
};

module.exports = seedDatabase;

// Run if called directly
if (require.main === module) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log('Seeding complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
