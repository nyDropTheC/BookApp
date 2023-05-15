import { useState, useContext } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Button, Dialog, Icon, Image, ListItem, SearchBar, Text, useTheme } from '@rneui/themed';

import { v4 as uuid } from 'uuid';

import ApiContext from '../contexts/apicontext';

const BookFinder = ( { setActive, addBook } ) => {
    const { theme } = useTheme ( );
    const { library } = useContext ( ApiContext );

    const [ results, setResults ] = useState ( [ ] );
    const [ title, setTitle ] = useState ( '' );

    const runSearch = ( ) => {
        library.lookupByTerm ( title )
            .then ( resp => resp.json ( ) )
            .then ( resp => {
                const worksGrouped = { };
                const workList = [ ];

                for ( let doc of resp.docs ) {
                    if ( !( 'author_name' in doc ) || !( 'seed' in doc ) ) {
                        continue; // yes, this happens
                        // this API is not very nice to users
                    }

                    const reviewRating = doc.ratings_average || 0;
                    const groupScore = ( doc.already_read_count || 0 ) + ( doc.want_to_read_count || 0 ) + reviewRating * 5;

                    const documentObject = {
                        author: doc.author_name.join ( ', ' ),
                        title: doc.title,
                        openlibraryKey: doc.key,
                        imageKey: doc.cover_edition_key || null,
                        readers: ( doc.already_read_count || 0 ),
                        stars: reviewRating,
                        score: groupScore
                    };

                    if ( !( doc.title_sort.toLowerCase ( ) in worksGrouped ) ) {
                        worksGrouped [ doc.title_sort.toLowerCase ( ) ] = documentObject;
                    } else {
                        if ( worksGrouped [ doc.title_sort.toLowerCase ( ) ].score < groupScore ) {
                            worksGrouped [ doc.title_sort.toLowerCase ( ) ] = documentObject;
                        }
                    }
                }

                for ( let work in worksGrouped ) {
                    workList.push ( { ...worksGrouped [ work ], id: uuid ( ) } ); // I despise keyExtractor for making me waste valuable CPU time on UUID generation
                    // Then again, I'm using NodeJS for this lol
                }

                workList.sort ( ( a, b ) => b.score - a.score );
                setResults ( workList );
            } )
            .catch ( err => console.error ( err ) );
    };

    const onBookClick = ( { author, title, imageKey } ) => {
        addBook ( title, author, imageKey !== null ? `https://covers.openlibrary.org/b/olid/${imageKey}-L.jpg` : null );
        setActive ( false );

        // I like how I'm inconsistent between image sizes :)
    };

    const keyExtractor = item => item.id;

    const itemRenderer = ( { item } ) => {
        return <ListItem topDivider bottomDivider onPress={ ( ) => onBookClick ( item ) }>
            <ListItem.Content>
                { item.imageKey !== null ? <Image
                    source={ { uri: `https://covers.openlibrary.org/b/olid/${item.imageKey}-L.jpg` } }
                    style={ styles.listImageStyle }
                /> : <Icon containerStyle={ styles.listImageStyle } size={ 100 } name='bookmark'/> }
            </ListItem.Content>
            <ListItem.Content right>
                <ListItem.Title style={ { fontWeight: 'bold' } }>{ item.title }</ListItem.Title>
                <ListItem.Subtitle>{ `By ${item.author}` }</ListItem.Subtitle>
                <ListItem.Subtitle>{ `${item.readers} readers on OpenLibrary` }</ListItem.Subtitle>
            </ListItem.Content> 
        </ListItem>
    };

    return <Dialog 
        backdropStyle={
            { 
                backgroundColor: theme.colors.background
            }
        }
        
        overlayStyle={
            {
                flex: 0.8,
                backgroundColor: theme.colors.background
            }
        }
    >
        <SearchBar 
            placeholder="Search terms (title, author...)"
            value={ title }
            onChangeText={ text => setTitle ( text ) }
            onSubmitEditing={ ( ) => runSearch ( ) }
            containerStyle={ { backgroundColor: 'transparent' } }
        />

        {
            results.length > 0 &&
                <FlatList 
                    style={ styles.listStyle }
                    keyExtractor={ keyExtractor }
                    renderItem={ itemRenderer }
                    data={ results }
                />
                
        }

        <Button color='error' title='Cancel' onPress={ ( ) => setActive ( false ) }/>
    </Dialog>
};

const styles = StyleSheet.create ( {
    listStyle: {
        marginTop: '2%'
    },

    listImageStyle: {
        width: 120,
        height: 120,
        resizeMode: 'contain'
    }
} );

export default BookFinder;