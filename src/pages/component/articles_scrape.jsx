import React, { useState, useEffect } from 'react';

const ArticlesScrape = () => {
  const [articles, setArticles] = useState([]);
  const [mostRecentArticle, setMostRecentArticle] = useState(null);
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = 'CgkxxT7s9PckcmY15CVedbNMJIe0zAP1';

  useEffect(() => {
    // First try to load from JSON file (default to 'all' category)
    loadArticlesFromJSON('all').then((hasData) => {
      // If no valid data from JSON, fetch from API
      if (!hasData) {
        loadArticles('all');
      }
    });
  }, []);

  const loadArticlesFromJSON = async (category = 'all') => {
    try {
      // Try to read from category-specific JSON file
      const response = await fetch(`/data/articles-${category}.json`);
      if (response.ok) {
        const data = await response.json();
        const lastUpdated = new Date(data.lastUpdated);
        const now = new Date();
        const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
        
        // If JSON data is less than 1 hour old, use it
        if (hoursDiff < 1 && data.articles.length > 0) {
          setArticles(data.articles);
          setMostRecentArticle(data.articles[0]);
          setLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.log(`Could not load ${category} articles from JSON file, will fetch from API`);
    }
    return false;
  };


  const loadArticles = (category) => {
    setLoading(true);
    setError(null);
    
    const url = `https://api.nytimes.com/svc/news/v3/content/nyt/${category}.json?api-key=${apiKey}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setMostRecentArticle(data.results[0]);
          setArticles(data.results);
          
          // Save articles to JSON file (data is already saved by fetch script)
          console.log(`Loaded ${data.results.length} ${category} articles from API`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading articles:', err);
        setError('Failed to load articles');
        setLoading(false);
      });
  };

  const handleCategoryClick = (category) => {
    // First try to load from category-specific JSON file
    loadArticlesFromJSON(category).then((hasData) => {
      // If no valid data from JSON, fetch from API
      if (!hasData) {
        loadArticles(category);
      }
    });
  };

  const getImageSrc = (article) => {
    return (article.multimedia && article.multimedia.length > 2) 
      ? article.multimedia[2].url 
      : 'src/assets/HomePage/book.png';
  };

  if (loading) {
    return (
      <div className="bg-[#1E242E] rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4 w-1/4"></div>
          <div className="h-40 bg-gray-600 rounded mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1E242E] rounded-xl p-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Articles</h2>
        <div className="text-center text-gray-400 py-8">
          <p>{error}</p>
          <button 
            onClick={() => loadArticles('all')}
            className="mt-4 text-[#007AFF] hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl md:text-2xl font-semibold">Articles</h2>
        
        {/* Navigation */}
        <nav className="hidden sm:flex gap-4">
          <button 
            onClick={() => handleCategoryClick('all')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            All
          </button>
          <button 
            onClick={() => handleCategoryClick('world')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            World
          </button>
          <button 
            onClick={() => handleCategoryClick('business')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Business
          </button>
          <button 
            onClick={() => handleCategoryClick('technology')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Technology
          </button>
          <button 
            onClick={() => handleCategoryClick('science')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Science
          </button>
        </nav>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.slice(0, 12).map((article, index) => (
          <div
            key={index}
            className="bg-[#1E242E] rounded-xl overflow-hidden hover:bg-[#242B38] transition-colors group relative"
          >
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-decoration-none text-inherit"
            >
              <div className="relative">
                <img 
                  src={getImageSrc(article)} 
                  alt={article.title}
                  className="h-36 w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white line-clamp-2">{article.title}</h3>
                <p className="text-gray-400 text-xs mt-1">{article.section || 'General'}</p>
                <p className="text-gray-500 text-xs mt-1">{article.byline || 'Unknown Author'}</p>
              </div>
            </a>
          </div>
        ))}
      </div>

    </section>
  );
};

export default ArticlesScrape;
