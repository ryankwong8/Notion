/* Bring in the external packages we'll be using.
Additionally, we bring in the Notion API client so we can make requests to it. 
Modify file name to match the file import */
const fs = require('fs')
const readline = require('readline');
const { Client } = require('@notionhq/client')
require('dotenv').config();
const fileName = 'ratings.csv';

/* Create a new object 'notion' that gives our code access to the Notion
credentials set up in the .env file */
const notion = new Client({auth: process.env.NOTION_KEY})

// Object to store the latest rating from each rater for each book
const latestRatings = {};

// Object to store the aggregated data for each book
const aggregatedData = {};

// Create a read interface to read the CSV file line by line
const readInterface = readline.createInterface({
    input: fs.createReadStream(fileName), 
    console: false
});

// Event handler for each line read from the CSV
readInterface.on('line', function(line) {
    // Split the line into parts based on commas
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Regex to split by commas but ignores commas inside double quotes

    // Check if the line has exactly 3 parts (title, rater, rating)
    if (parts.length === 3) {
        // Normalize the title and rater by trimming and converting to lowercase
        const title = parts[0].trim().toLowerCase();
        const rater = parts[1].trim().toLowerCase();

        // Convert the rating to a float
        const rating = parseFloat(parts[2].trim());

        // Initialize the book object if it doesn't exist
        if (!latestRatings[title]) {
            latestRatings[title] = {};
        }

        // Store the latest rating from the rater
        latestRatings[title][rater] = rating;
    } else {
      console.log("FLAG row parsing error: ", line); // Identifies if line not 3 parts
    }
});

// Event handler for when the file has been fully read
readInterface.on('close', function() {
    // Loop through each book to aggregate the data
    for (const [title, ratings] of Object.entries(latestRatings)) {
        // Initialize variables to keep track of the sum, count, and favorites
        let sum = 0;
        let count = 0;
        let favorites = 0;

        // Loop through each rating for the book
        for (const rating of Object.values(ratings)) {
            sum += rating;  // Update the sum
            count++;  // Update the count

            // Check if the book is a favorite (rated 5 stars)
            if (rating === 5) {
                favorites++;
            }
        }
        // Calculate the average rating
        const averageRating = sum / count;

        // Store the aggregated data for the book
        aggregatedData[title] = { averageRating, numberOfFavorites: favorites };
    }

    // Output the aggregated data
    console.log('CSV file successfully processed');

    // Create Notion Page
    createNotionPage();
});

/* Note how we've defined additional functions below this; these are totally fine to exist below this line because JavaScript "hoists"
function definitions to the top when it actually runs a .js file. Look up "JavaScript Hoisting" to learn more about this.

Create a "wait" function to comply with Notion API rate-limiting. The Notion API only allows ~3 requests per second, so after 
we create each new page in our Notion database, we'll call this sleep function and have it wait for 300ms. This will ensure that 
our app doesn't try to send data to Notion too quickly, which would cause our calls to eventually fail. */
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

// Create a function for sending our data to the Notion API
async function createNotionPage() {
  const existingBooks = await fetchExistingBooks();
  for (const [title, bookData] of Object.entries(aggregatedData)) {
    // Check if the book already exists in the Notion database
    const capTitle = await capitalizeWords(title);
    const pageId = existingBooks[title.toLowerCase()];

    // Prepare the data to be sent to Notion: https://developers.notion.com/docs/working-with-databases
    const data = {
      parent: {
        "database_id": process.env.NOTION_DATABASE_ID
      },
      properties: {
        "Book Title": {
          type: "title", 
          title: [
            {
              type: "text",
              text: {
                content: capTitle,
              },
            },
          ],
        },
        "Average Rating": {
          type: "number",
          number: parseFloat(bookData.averageRating.toFixed(2)),   // Rounds to 2 decimal points
        },
        "Favorites": {
          type: "number",
          number: bookData.numberOfFavorites
        }
      }
    };

    // If the book already exists, update it. Otherwise, create a new page.
    if (pageId) {
      await notion.pages.update({
        page_id: pageId,
        properties: data.properties
      });
      console.log(`Updated ${title} in Notion`);
    } else {
      await notion.pages.create(data);
      console.log(`Created ${title} in Notion`);
    }

    // Sleep for 300ms to respect Notion's rate limit
    await sleep(300);
  }

  console.log(`Operation complete.`);
}

// Capitalizes words (for the book titles) -- edge case: would fail on McCarthy, D'Ante, etc
function capitalizeWords(str) {
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

// Fetch all existing books from Notion database
async function fetchExistingBooks() {
  const existingPages = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
  });
  const existingBooks = {}
  for (const page of existingPages.results) {
    const title = page.properties["Book Title"].title[0]?.text?.content;
    const pageId = page.id;
    if (title && pageId) {
      existingBooks[title.toLowerCase()] = pageId;
    }
  }
  return existingBooks;
}
