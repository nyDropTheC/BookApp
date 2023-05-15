const getGoogleApi = ( { config: { useMockBackendApi, userGoogleKey, remoteBackendPath } } ) => {
    if ( useMockBackendApi ) {
        return {
            lookupByTerm: term => fetch ( `https://www.googleapis.com/books/v1/volumes?q=${term}&key=${userGoogleKey}` )
        };
    }

    return {};
};

export default getGoogleApi;