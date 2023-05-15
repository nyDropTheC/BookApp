const getLibraryApi = ( ) => {
    return {
        lookupByTerm: term => fetch ( `https://openlibrary.org/search.json?q=${term.toLowerCase ( ).split ( ' ' ).join ( '+' )}` )
    };
};

export default getLibraryApi;

// This is a lot simpler than the Google Books version - while not necessitating an API key