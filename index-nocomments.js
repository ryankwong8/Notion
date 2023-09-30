const fs = require('fs')
const readline = require('readline');
const { Client } = require('@notionhq/client')
require('dotenv').config();
const fileName = 'ratings.csv';
const notion = new Client({auth: process.env.NOTION_KEY})
const latestRatings = {};
const aggregatedData = {};
const readInterface = readline.createInterface({
    input: fs.createReadStream(fileName), 
    console: false
});

readInterface.on('line', function(line) {
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    if (parts.length === 3) {
        const title = parts[0].trim().toLowerCase();
        const rater = parts[1].trim().toLowerCase();
        const rating = parseFloat(parts[2].trim());

        if (!latestRatings[title]) {
            latestRatings[title] = {};
        }
        latestRatings[title][rater] = rating;
    } else {
      console.log("FLAG row parsing error: ", row); 
    }
});

readInterface.on('close', function() {
    for (const [title, ratings] of Object.entries(latestRatings)) {
        let sum = 0;
        let count = 0;
        let favorites = 0;

        for (const rating of Object.values(ratings)) {
            sum += rating;  
            count++; 
            if (rating === 5) {
                favorites++;
            }
        }
        const averageRating = sum / count;
        aggregatedData[title] = { averageRating, numberOfFavorites: favorites };
    }
    console.log('CSV file successfully processed');
    createNotionPage();
});

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

async function createNotionPage() {
  const existingBooks = await fetchExistingBooks();
  for (const [title, bookData] of Object.entries(aggregatedData)) {
    const capTitle = await capitalizeWords(title);
    const pageId = existingBooks[title.toLowerCase()];

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
          number: parseFloat(bookData.averageRating.toFixed(2)),
        },
        "Favorites": {
          type: "number",
          number: bookData.numberOfFavorites
        }
      }
    };

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
    await sleep(300);
  }

  console.log(`Operation complete.`);
}

function capitalizeWords(str) {
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

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
