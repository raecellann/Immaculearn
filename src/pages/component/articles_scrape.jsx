import React, { useState } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

// Create client (should be in app root in real project)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
    },
  },
});

const apiKey = "CgkxxT7s9PckcmY15CVedbNMJIe0zAP1";

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
        return cached.articles;
      }
    }
  } catch (e) {
    throw e;
  }

  // ===== 2. FALLBACK TO NYT API =====

  const url = `https://api.nytimes.com/svc/news/v3/content/nyt/${category}.json?api-key=${apiKey}`;

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
      }),
    );
  } catch (e) {
    throw e;
  }

  return articles;
};

const ArticlesInner = () => {
  const [category, setCategory] = useState("all");
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const {
    data: articles = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["articles", category],
    queryFn: () => fetchArticles(category),
  });

  const getImageSrc = (article) => {
    return article.multimedia && article.multimedia.length > 2
      ? article.multimedia[2].url
      : "src/assets/HomePage/book.png";
  };

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: currentColors.surface }}
      >
        <div className="animate-pulse">
          <div
            className="h-6 rounded mb-4 w-1/4"
            style={{ backgroundColor: currentColors.border }}
          ></div>
          <div
            className="h-40 rounded mb-4"
            style={{ backgroundColor: currentColors.border }}
          ></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: currentColors.surface }}
      >
        <p style={{ color: currentColors.textSecondary }}>
          Failed to load articles
        </p>
        <button onClick={() => refetch()} style={{ color: "#007AFF" }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h2
          className="text-xl md:text-2xl font-semibold"
          style={{ color: currentColors.text }}
        >
          Articles
        </h2>

        <nav className="hidden sm:flex gap-4">
          {["all", "world", "business", "technology", "science"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-sm transition-colors capitalize ${
                category === c ? "font-semibold" : ""
              }`}
              style={{
                color:
                  category === c
                    ? isDarkMode
                      ? "#60A5FA"
                      : "#007AFF"
                    : currentColors.textSecondary,
              }}
            >
              {c}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.slice(0, 12).map((article, index) => (
          <div
            key={index}
            className="rounded-xl overflow-hidden transition-colors hover:opacity-90 hover-lift"
            style={{
              backgroundColor: currentColors.surface,
              border: isDarkMode ? "none" : "1px solid black",
              animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`,
              opacity: 0,
            }}
          >
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img
                src={getImageSrc(article)}
                alt={article.title}
                className="h-20 w-full object-cover"
              />
              <div className="p-3">
                <h3
                  className="font-medium line-clamp-2 text-xs"
                  style={{ color: currentColors.text }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: currentColors.textSecondary }}
                >
                  {article.section}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: currentColors.textSecondary }}
                >
                  {article.byline}
                </p>
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
