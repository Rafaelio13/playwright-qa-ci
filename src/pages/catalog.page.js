function catalogPage(page) {
  return {
    searchQuery: page.getByTestId('search-query'),
    searchSubmit: page.getByTestId('search-submit'),
    searchTerm: page.getByTestId('search-term'),
    searchResultCount: page.getByTestId('search-result-count'),
    productNames: page.getByTestId('product-name'),
  };
}

module.exports = { catalogPage };
