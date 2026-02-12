const getKey = (category) => `articles-${category}`;

export const readLocalArticles = (category) => {
  try {
    const raw = localStorage.getItem(getKey(category));
    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const writeLocalArticles = (category, articles) => {
  const payload = {
    lastUpdated: new Date().toISOString(),
    articles,
  };

  localStorage.setItem(getKey(category), JSON.stringify(payload));
};
