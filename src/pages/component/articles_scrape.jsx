import React, { useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create client (should be in app root in real project)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
    },
  },
});

const apiKey = 'CgkxxT7s9PckcmY15CVedbNMJIe0zAP1';

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const fetchArticles = async (category) => {

  const storageKey = `articles-${category}`;

  // ===== 1. TRY LOCAL CACHE =====
  try {
    const cachedRaw = localStorage.getItem(storageKey);

    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);

      const lastUpdated = new Date(cached.lastUpdated).toLocaleDateString();
      const now = new Date().toLocaleDateString();

      if (lastUpdated === now && cached.articles?.length > 0) {
        console.log('Loaded from local cache');
        return cached.articles;
      }
    }
  } catch (e) {
    console.log('Cache read failed');
  }

  // ===== 2. FALLBACK TO NYT API =====

  const url =
    `https://api.nytimes.com/svc/news/v3/content/nyt/${category}.json?api-key=${apiKey}`;

  const res = await fetch(url);
  const apiData = await res.json();

  const articles = apiData.results || [];

  // ===== 3. SAVE FOR TODAY =====

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        articles,
      })
    );
  } catch (e) {
    console.log('Cache write failed');
  }

  return articles;
};


const ArticlesInner = () => {
  const [category, setCategory] = useState('all');

  const {
    data: articles = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['articles', category],
    queryFn: () => fetchArticles(category),
  });

  const getImageSrc = (article) => {
    return article.multimedia && article.multimedia.length > 2
      ? article.multimedia[2].url
      : 'src/assets/HomePage/book.png';
  };

  if (isLoading) {
    return (
      <div className="bg-[#1E242E] rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4 w-1/4"></div>
          <div className="h-40 bg-gray-600 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#1E242E] rounded-xl p-6">
        <p className="text-gray-400">Failed to load articles</p>
        <button onClick={() => refetch()} className="text-[#007AFF]">Try Again</button>
      </div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl md:text-2xl font-semibold">Articles</h2>

        <nav className="hidden sm:flex gap-4">
          {['all', 'world', 'business', 'technology', 'science'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="text-gray-400 hover:text-white text-sm transition-colors capitalize"
            >
              {c}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.slice(0, 12).map((article, index) => (
          <div key={index} className="bg-[#1E242E] rounded-xl overflow-hidden hover:bg-[#242B38] transition-colors">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img
                src={getImageSrc(article)}
                alt={article.title}
                className="h-20 w-full object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium text-white line-clamp-2 text-xs">{article.title}</h3>
                <p className="text-gray-400 text-xs mt-1">{article.section}</p>
                <p className="text-gray-500 text-xs mt-1">{article.byline}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

const ArticlesScrape = () => (
  <QueryClientProvider client={queryClient}>
    <ArticlesInner />
  </QueryClientProvider>
);

export default ArticlesScrape;