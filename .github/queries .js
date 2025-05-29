// Connect to the MongoDB database using the Node.js driver
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI if needed
const client = new MongoClient(uri);

async function run() {
  try {
	await client.connect();
	const db = client.db('plp_bookstoreDB');
	// Your queries go here, using the 'db' object
  } finally {
	await client.close();
  }
}

run().catch(console.dir);

//insert many books
async function insertBooks() {
  const books = [
    { title: 'To Kill a Mockingbird', author: 'Harper Lee',  genre: 'Fiction', published_year: 1960, price: 12.99, in_stock: true, pages: 336, publisher: 'J. B. Lippincott & Co.' },
    { title: '1984', author: 'George Orwell', genre: 'Dystopian', published_year: 1949, price: 10.99, in_stock: true, pages: 328, publisher: 'Secker & Warburg' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', published_year: 1925, price: 9.99, in_stock: true, pages: 180, publisher: 'Charles Scribner\'s Sons' },
    { title: 'Brave New World', author: 'Aldous Huxley', genre: 'Dystopian', published_year: 1932, price: 11.50, in_stock: false, pages: 311, publisher: 'Chatto & Windus' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', published_year: 1937, price: 14.99, in_stock: true, pages: 310, publisher: 'George Allen & Unwin' },
    { title: 'Fahrenheit 451', author: 'Ray Bradbury', genre: 'Dystopian', published_year: 1953, price: 13.50, in_stock: true, pages: 158, publisher: 'Ballantine Books' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance', published_year: 1813, price: 8.99, in_stock: true, pages: 279, publisher: 'T. Egerton' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', genre: 'Fiction', published_year: 1951, price: 10.50, in_stock: true, pages: 277, publisher: 'Little, Brown and Company' },
    { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', genre: 'Fantasy', published_year: 1954, price: 25.00, in_stock: true, pages: 1178, publisher: 'George Allen & Unwin' },
    { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Adventure', published_year: 1988, price: 15.99, in_stock: true, pages: 208, publisher: 'HarperOne' }
  ];
  
  const result = await db.collection('books').insertMany(books);
  console.log(`${result.insertedCount} books were inserted`);
}

// Query to find books in fiction genre
async function findFictionBooks() {
  const fictionBooks = await db.collection('books').find({ genre: 'Fiction' }).toArray();
  console.log('Fiction Books:', fictionBooks);
}

// Query to find books published after 1950
async function findBooksAfter1950() {
  const recentBooks = await db.collection('books').find({ published_year: { $gt: 1950 } }).toArray();
  console.log('Books Published After 1950:', recentBooks);
}

// Query to find books by J.R.R. Tolkien
async function findBooksByTolkien() {
  const tolkienBooks = await db.collection('books').find({ author: 'J.R.R. Tolkien' }).toArray();
  console.log('Books by J.R.R. Tolkien:', tolkienBooks);
}

//update a book's price
async function updateBookPrice(title, newPrice) {
  const result = await db.collection('books').updateOne(
    { title: title },
    { $set: { price: newPrice } }
  );
  console.log(`${result.modifiedCount} book(s) updated`);
}

//delete a book by title
async function deleteBookByTitle(title) {
  const result = await db.collection('books').deleteOne({ title: title });
console.log(`${result.deletedCount} book(s) deleted`);    
}
// Query to find books that are both in stock and published after 2010
async function findInStockBooksAfter2010() {
  const books = await db.collection('books').find({
    in_stock: true,
    published_year: { $gt: 2010 }
  }).toArray();
  console.log('Books in stock and published after 2010:', books);
}

// Example: Find books in stock and published after 2010, projecting only title, author, and price
async function findInStockBooksAfter2010() {
  const books = await db.collection('books').find(
    { in_stock: true, published_year: { $gt: 2010 } },
    { projection: { title: 1, author: 1, price: 1, _id: 0 } }
  ).toArray();
  console.log('Books in stock and published after 2010:', books);
}

// Query to display books sorted by price in ascending order
async function findBooksSortedByPriceAsc() {
  const books = await db.collection('books').find(
    {},
    { projection: { title: 1, author: 1, price: 1, _id: 0 } }
  ).sort({ price: 1 }).toArray();
  console.log('Books sorted by price (ascending):', books);
}

// Query to display books sorted by price in descending order
async function findBooksSortedByPriceDesc() {
  const books = await db.collection('books').find(
    {},
    { projection: { title: 1, author: 1, price: 1, _id: 0 } }
  ).sort({ price: -1 }).toArray();
  console.log('Books sorted by price (descending):', books);
}

// Query to implement pagination (5 books per page) using limit and skip
async function getBooksByPage(pageNumber) {
  const pageSize = 5;
  const books = await db.collection('books').find(
    {},
    { projection: { title: 1, author: 1, price: 1, _id: 0 } }
  )
  .skip((pageNumber - 1) * pageSize)
  .limit(pageSize)
  .toArray();
  console.log(`Books on page ${pageNumber}:`, books);
}

// Aggregation pipeline to calculate the average price of books by genre
async function getAveragePriceByGenre() {
  const result = await db.collection('books').aggregate([
    {
      $group: {
        _id: "$genre",
        averagePrice: { $avg: "$price" }
      }
    },
    {
      $project: {
        _id: 0,
        genre: "$_id",
        averagePrice: { $round: ["$averagePrice", 2] }
      }
    }
  ]).toArray();
  console.log('Average price of books by genre:', result);
}

// Aggregation pipeline to find the author with the most books in the collection
async function getAuthorWithMostBooks() {
  const result = await db.collection('books').aggregate([
    { $group: { _id: "$author", bookCount: { $sum: 1 } } },
    { $sort: { bookCount: -1 } },
    { $limit: 1 },
    { $project: { _id: 0, author: "$_id", bookCount: 1 } }
  ]).toArray();
  console.log('Author with the most books:', result[0]);
}

// Aggregation pipeline to group books by publication decade and count them
async function countBooksByDecade() {
  const result = await db.collection('books').aggregate([
    {
      $addFields: {
        decade: { $concat: [
          { $toString: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] } },
          "s"
        ]}
      }
    },
    {
      $group: {
        _id: "$decade",
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        decade: "$_id",
        count: 1
      }
    },
    { $sort: { decade: 1 } }
  ]).toArray();
  console.log('Books grouped by publication decade:', result);
}

// Create an index on the 'title' field for faster searches
async function createTitleIndex() {
  const result = await db.collection('books').createIndex({ title: 1 });
  console.log('Index created:', result);
}

// Create a compound index on 'author' and 'published_year'
async function createAuthorPublishedYearIndex() {
  const result = await db.collection('books').createIndex({ author: 1, published_year: 1 });
  console.log('Compound index created:', result);
}

// Use the explain() method to demonstrate performance improvement with indexes

// Explain query before and after creating an index on 'title'
async function explainTitleSearch(title) {
  // Explain before index (run this before creating the index)
  const explainBefore = await db.collection('books').find({ title: title }).explain("executionStats");
  console.log('Explain (before index) for title search:', explainBefore.executionStats);

  // Create the index if not already created
  await db.collection('books').createIndex({ title: 1 });

  // Explain after index
  const explainAfter = await db.collection('books').find({ title: title }).explain("executionStats");
  console.log('Explain (after index) for title search:', explainAfter.executionStats);
}

// Explain query before and after creating a compound index on 'author' and 'published_year'
async function explainAuthorYearSearch(author, year) {
  // Explain before index (run this before creating the index)
  const explainBefore = await db.collection('books').find({ author: author, published_year: year }).explain("executionStats");
  console.log('Explain (before index) for author/year search:', explainBefore.executionStats);

  // Create the compound index if not already created
  await db.collection('books').createIndex({ author: 1, published_year: 1 });

  // Explain after index
  const explainAfter = await db.collection('books').find({ author: author, published_year: year }).explain("executionStats");
  console.log('Explain (after index) for author/year search:', explainAfter.executionStats);
}

