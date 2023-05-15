import { Button, Header, ListItem, useTheme } from '@rneui/themed';
import { useState, useContext, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import ApiContext from '../contexts/apicontext';
import UserContext from '../contexts/usercontext';
import BookEditorContext from '../contexts/bookeditorcontext';

import { v4 as uuid } from 'uuid';

const ListRenderer = ( { bookData, setBookData } ) => {
    /*
    schema: {
        author: author name
        description: short desc
        name: book name
    }
    */

    const { bookEditorState: { addBook } } = useContext ( BookEditorContext );

    const authorsWeProbablyShouldntLetUsersAdd = { 'AI': true, 'Trained monkeys at the developers': true };
    // lol
    // lmao

    const keyExtractor = book => book.id;

    const itemRenderer = ( { item } ) => {
        const itemContent = <ListItem.Content>
            <ListItem.Title>{ item.name }</ListItem.Title>
            <ListItem.Title>{ `By ${item.author}` }</ListItem.Title>
            <ListItem.Subtitle style={ styles.descriptionStyle }>{ item.description }</ListItem.Subtitle>
        </ListItem.Content>

        if ( authorsWeProbablyShouldntLetUsersAdd [ item.author ] ) {
            return <ListItem topDivider bottomDivider>
                { itemContent }
            </ListItem>;
        }

        const onSwipeToAdd = ( ) => {
            addBook ( item.name, item.author, null );
            setBookData ( bookData.filter ( book => book.id !== item.id ) );
        };
        
        return <ListItem.Swipeable 
            topDivider 
            bottomDivider
            onSwipeEnd={ onSwipeToAdd }
            leftContent={ <View/> }
            rightContent={ <View/> }
        >
            { itemContent }
            <ListItem.Subtitle style={ styles.descriptionStyle }>Swipe to add to library!</ListItem.Subtitle>
        </ListItem.Swipeable>
    }

    return <FlatList
        data={ bookData }
        keyExtractor={ keyExtractor }
        renderItem={ itemRenderer }
    />
};

const Suggestions = ( { navigation, route: { params: { book } } } ) => {
    const { theme } = useTheme ( );

    const { user } = useContext ( UserContext );
    const { openai: { generateSuggestions } } = useContext ( ApiContext );

    const [ suggestionResults, setSuggestionResults ] = useState ( [ ] );
    const [ generated, setGenerated ] = useState ( false );

    const fetchSuggestions = ( ) => {
        setSuggestionResults ( [ {
            author: 'AI',
            id: 'generation',
            name: 'Generating suggestions...',
            description: 'Please wait...'
        } ] );

        setGenerated ( false );

        const concatenatedMessages = [ ]; 
        
        // I know it probably shouldn't be here
        // But screw it
        // It makes for easy debugging

        generateSuggestions ( book, user )
            .then ( resp => {
                setGenerated ( true );

                for ( let { message: { content } } of resp.choices ) {
                    concatenatedMessages.push ( content );
                }

                const obj = JSON.parse ( concatenatedMessages.join ( '\n' ) )
                    .map ( data => ( { ...data, id: uuid ( ) } ) );

                setSuggestionResults ( obj )
            } )
            .catch ( err => {
                console.error ( err );
                setSuggestionResults ( [ {
                    author: 'Trained monkeys at the developers',
                    id: 'err',
                    name: 'Something went wrong',
                    description: `Contact the developers`
                }, { 
                    author: 'Trained monkeys at the developers',
                    id: 'err2',
                    name: 'Error details',
                    description: `${err}`
                }, {
                    author: 'Trained monkeys at the developers',
                    id: 'err3',
                    name: 'More details',
                    description: `ChatGPT said: ${concatenatedMessages.join ( '\n' )}`
                } ] );
            } );
    };

    useEffect ( fetchSuggestions, [ ] );

    const viewStyle = { ...styles.viewStyle, backgroundColor: theme.colors.background };

    return <View style={ viewStyle }>
        <Header 
            elevated 
            centerComponent={ 
                {
                    text: `Similar to ${book.bookname}`, 
                    style: { color: theme.colors.black, fontWeight: 'bold', fontSize: 24 } 
                } 
            }
        />
        <View style={ styles.textSectionStyle }>
            <ListRenderer bookData={ suggestionResults } setBookData={ setSuggestionResults }/>
            { generated && <Button raised title='Regenerate' color='secondary' onPress={ fetchSuggestions }/> }
        </View>
    </View>
};

const styles = StyleSheet.create ( {
    viewStyle: {
        flex: 1
    },

    textSectionStyle: {
        flex: 0.9,
        margin: '5%',
        lineHeight: 1.8
    },

    descriptionStyle: {
        marginTop: '4%'
    }
} );

export default Suggestions;