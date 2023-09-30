# A Few Books And Their Ratings

This program will read a file and update your database with entries for each book. The program ingests all the book ratings data and insert, into the database you create, one row for each book that got at least one rating.

Each row should have:
- Book name (normalized for extra whitespace and capitalization)
- Average rating from all members
- Number of “Favorites”
    - If a member has rated a book 5 stars, we’ll say that’s a favorite of theirs.

When the program finishes, your table should be populated with all the rated books, along with their average ratings and the number of times they were favorited.

### Deterministic

<aside>
💡 This program is **deterministic:** whenever the program is run with the same inputs, the output should be the same (in this case, the database should have the same data in it). The state of the database should only depend on the most recent execution of the program.

</aside>


## How to Run This

Getting Started (following ​​https://developers.notion.com/docs/create-a-notion-integration): 
    1. Let’s first create our new integration in Notion (https://www.notion.so/my-integrations)
        a. Click + New integration
        b. Enter the integration name
        c. (Optional) If you're using the completed sample app with the comment form as well, update the Capabilities to allow comment interactions
        d. Copy the generated “Internal Integration Secret”
    2. Create a database in Notion
        a. Create a new page and select “Table” in the template selection menu
        b. Table columns will be: “Book Title”, “Average Rating”, and “Favorites”
        c. Ensure properties are: title, number, number
    3. To give our integration page permissions
        a. Click on the ... More menu in the top-right corner of the page
        b. Scroll down to + Add Connections
        c. Search for your integration and select it
        d. Confirm the integration can access the page and all of its child pages
    4. Connecting Script to Notion
        a. Create a .env file and follow the structure:
            NOTION_KEY = abc
            NOTION_DATABASE_ID = xyz
    5. Download the CSV file you would like to import into your Notion database
        a. Place this file in the folder of the script
        b. Change line 8 in index.js to match your CSV file's name
    6. Open the Terminal, then type `node index.js` and hit `enter`


## What's in this project?

← `README.md`: That’s this file.

← `index.js`: The only file that really matters in this project.

← `index-nocomments.js`: A version of index.js without all the comments. The code is the same, so you can run this version if you want.

← `test.js`: Unit testing file for index.js unit tests.

← `server.js`: The main server script for your new site. Glitch adds this by default.

← `package.json`: This includes information about the packages we're importing.

## What are some tradeoffs with my approach?

In terms of memory usage, the current approach of storing all the latest ratings in an object can be a double-edged sword. On one hand, it allows for quick lookups and updates, which is beneficial for performance. On the other hand, if the CSV file is extremely large, this could lead to high memory consumption, potentially causing the application to slow down or even crash in extreme cases. I thought about using a streaming approach to read the CSV file line by line and update the database in real-time, but this would mean making an API call for every single line, which is not efficient and could easily hit rate limits.

Another tradeoff is the API calls to Notion. Initially, I made an API call for each book to check if it exists in the database, but this was highly inefficient and could quickly hit API rate limits. I optimized this by fetching all existing books in a single API call, but this too has its downsides. If the Notion database is very large, this single API call could take a long time and consume a lot of memory.

## What are some things missing from my assignment?

One glaring omission is the lack of a main method or entry point that orchestrates the different parts of the code. Right now, the code runs procedurally from top to bottom, which makes it hard to test individual components or reuse them in different contexts. I tried to make the code modular by breaking it down into functions, but it could benefit from further refactoring. For example, the CSV parsing logic, the data aggregation, and the Notion API calls could be separated into different modules or even different npm packages.

Another missing piece is unit tests. While the code performs the basic functionality, it's not tested for edge cases or unexpected inputs. I considered writing mock tests, especially for the Notion API calls, to make the code more robust and maintainable.

## What are some other approaches I considered?

I considered several alternative approaches to improve both memory usage and runtime. One such approach was to process the CSV file row by row, which would be more memory-efficient as it wouldn't require storing the entire file in memory. However, this would mean making an API call for each row to update the Notion database, which would be highly inefficient in terms of runtime and could hit rate limits.

Another approach I thought about was to first go through all the ratings to find the latest rating from each rater for each book. This would eliminate the need for storing all ratings in memory but would require a more complex data structure and algorithm to find the latest rating, thereby increasing the runtime complexity.

In terms of API calls, I initially made a separate API call for each book but quickly realized that this was inefficient. I then switched to making a single API call to fetch all existing books, which reduced the number of API calls but increased the memory usage as all existing books had to be stored in memory for quick lookups. This was a tradeoff I was willing to make to improve the runtime efficiency.

## What could be the next steps in furthering or expanding this project?

One immediate next step could be to refactor the code into a more modular architecture. This would make it easier to add new features, improve testability, and allow for better separation of concerns. For instance, the CSV parsing logic could be separated into its own module, making it reusable for other projects or functionalities. Similarly, the Notion API interactions could be encapsulated in a separate module, allowing for easier mocking and testing.

Another avenue for expansion could be to add a user interface, possibly a web-based dashboard, where users can upload the CSV file and trigger the Notion database update. This would make the tool more accessible to non-technical users and could open up a range of additional functionalities, like data visualization or real-time updates.

I've also considered the possibility of adding more advanced data analytics features. Right now, the code simply calculates the average rating and the number of favorites for each book. However, more complex metrics could be calculated, such as the variance or standard deviation of the ratings, to give a more nuanced view of the data.

In terms of performance optimization, I thought about implementing a caching mechanism for the Notion API calls. This could reduce the number of API calls needed when the program is run multiple times, thereby improving the runtime efficiency. However, this would require a way to invalidate the cache when the Notion database is updated outside of this application, adding another layer of complexity.

Lastly, I considered extending the project to support other types of databases or even other platforms altogether. The core logic of parsing a CSV file and aggregating data could be useful in many different contexts, not just updating a Notion database. By making the code more modular and abstracting away the database interactions, it could be adapted to work with SQL databases, other NoSQL databases, or even other cloud-based platforms like Google Sheets or Airtable.

## What are some things I got stuck on, and how did I resolve it?

Navigating the intricacies of the Notion API was a significant hurdle for me. I had never worked with this API before, and integrating it into my coding environment felt like solving a puzzle with missing pieces. The initial setup was confusing, and I often found myself unsure about how to make the correct API calls or handle the responses.

The Notion API documentation became my lifeline in these moments. I found myself constantly flipping between my code and the documentation, trying to piece together how everything connected. The examples in the documentation were particularly helpful, serving as a practical guide that complemented the more theoretical explanations.

One specific challenge was figuring out how to send query requests and apply filters in Notion. The API's query language was new to me, and I had to spend a good amount of time understanding how to structure my queries correctly. The documentation provided some examples, but it took a few trial-and-error attempts to get it right.

In addition to the documentation, I also sought out introductory videos to get a different perspective on how to work with the API. These videos often provided step-by-step guides that helped me understand the flow of data between my application and Notion.

## Any suggestions for improving the API documentation?

While the Notion API documentation is quite comprehensive, it could be improved by including more code examples. Specifically, examples showcasing complex queries and batch operations would be particularly helpful. These examples can serve as a practical guide, making it easier for developers to understand how to perform specific tasks using the API. This would reduce the learning curve and make the API more accessible to a broader audience.

## Major Open-Source Libraries Used 

Node Readline: For reading the CSV file line by line.
Notion API Client Library: For interacting with the Notion API.
dotenv: For managing environment variables securely.

Working with Databases: https://developers.notion.com/docs/working-with-databases
Notion SDK Sample Integration: https://github.com/makenotion/notion-sdk-js/tree/main/examples/generate-random-data
Intro to Notion's SDK: https://github.com/makenotion/notion-sdk-js/tree/main/examples/intro-to-notion-api
Glitch Notion Pokedex: https://glitch.com/edit/#!/notion-pokedex?path=README.md%3A1%3A0
Notion API Guide: https://radreads.co/notion-api/
Notion API Course: https://www.youtube.com/watch?v=ec5m6t77eYM
Developers Page: https://developers.notion.com/reference/intro
Stack Overflow Reading CSV: https://stackoverflow.com/questions/61288332/how-to-parse-csv-file-in-nodejs

## Appendix (other sources/notes)

Notion API Example: Creating a Pokédex

Course Link: https://www.youtube.com/watch?v=ec5m6t77eYM

Notions APIs: Web app gives a set of tools to the public, push/manipulate data, create pages, and append blocks to existing data

NodeJS: Backend environment to run JavaScript on a server (given by Glitch)

Request Information from PokéAPI (GET request)
If successful, we get a response that we can then wrangle the data, parse, and turn into an object
We inject those objects into an array
Format for notion
Send to Notion API through a POST request
If successful, we get a response that we will log

