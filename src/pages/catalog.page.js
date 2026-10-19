function catalogPage(page) {
  return {
    searchQuery: page.getByTestId('search-query'),
    searchSubmit: page.getByTestId('search-submit'),
    searchTerm: page.getByTestId('search-term'),
    searchResultCount: page.getByTestId('search-result-count'),
    productNames: page.getByTestId('product-name'),
    sort: page.getByTestId('sort'),
    noResults: page.getByTestId('no-results'),
    compareButtons: page.getByTestId('compare-btn'),
    comparisonBar: page.getByTestId('comparison-bar'),
    sortingDone: page.getByTestId('sorting_completed'),
    filterDone: page.getByTestId('filter_completed'),
    searchDone: page.getByTestId('search_completed'),
    navCategories: page.getByTestId('nav-categories'),
    navHandTools: page.getByTestId('nav-hand-tools'),
    navContact: page.getByTestId('nav-contact'),
    pageTitle: page.getByTestId('page-title'),
    categoryCheckbox: (id) => page.getByTestId(`category-${id}`),
    brandCheckbox: (id) => page.getByTestId(`brand-${id}`),
  };
}

module.exports = { catalogPage };
