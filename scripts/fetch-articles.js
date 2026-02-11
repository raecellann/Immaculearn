import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = 'CgkxxT7s9PckcmY15CVedbNMJIe0zAP1';

const categories = ['all', 'world', 'business', 'technology', 'science'];

async function fetchArticles(category = 'all') {
  try {
    const url = `https://api.nytimes.com/svc/news/v3/content/nyt/${category}.json?api-key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const articlesData = {
        lastUpdated: new Date().toISOString(),
        articles: data.results
      };
      
      // Save to category-specific JSON file
      const filePath = path.join(__dirname, '..', 'src', 'data', `articles-${category}.json`);
      fs.writeFileSync(filePath, JSON.stringify(articlesData, null, 2));
      
      console.log(`Successfully saved ${data.results.length} ${category} articles to articles-${category}.json`);
      console.log(`Last updated: ${articlesData.lastUpdated}`);
      
      return articlesData;
    } else {
      console.log(`No ${category} articles found`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${category} articles:`, error);
    return null;
  }
}

async function fetchAllCategories() {
  console.log('Fetching articles for all categories...');
  
  for (const category of categories) {
    await fetchArticles(category);
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('All categories fetched successfully!');
}

// Fetch all categories when script is run
fetchAllCategories();
