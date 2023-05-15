import { Button, Dialog, Header, Icon, Image, Input, ListItem, SearchBar, Text, useTheme } from '@rneui/themed';
import { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from 'react-native';

import ApiContext from "../contexts/apicontext";
import BookEditorContext from '../contexts/bookeditorcontext';

import BookFinder from "./bookfinder";
import Config from './userconfig';

const BookList = ( { navigation } ) => {
    const { theme } = useTheme ( );

    const { database } = useContext ( ApiContext );
    const { setEditor } = useContext ( BookEditorContext );

    const [ books, setBooks ] = useState ( [ ] );
    const [ searchedBook, setSearch ] = useState ( '' );

    const [ addDialog, setAddDialog ] = useState ( false );
    const [ customAdd, setCustomAdd ] = useState ( false );

    const [ customBookFields, setCustomFields ] = useState ( {
        bookName: '',
        author: '',
        imgurl: ''
    } );

    const [ configOpen, setConfigOpen ] = useState ( false );

    const updatePresentBooks = ( ) => {
        database.run ( ( context ) => {
            context.executeSql ( 'SELECT id, bookname, author, imageurl, read FROM StoredBooks;', [ ], ( _, { rows } ) => {
                setBooks ( rows._array );
            } );
        }, null );
    };

    const changeField = id => ( fieldName, fieldValue ) => {
        database.run ( ( context ) => {
            context.executeSql ( `UPDATE StoredBooks SET ${fieldName} = (?) WHERE id = (?);`, [ fieldValue, id ] );
        }, updatePresentBooks );
    };

    const removeBook = id => ( ) => {
        database.run ( ( context ) => {
            context.executeSql ( 'DELETE FROM StoredBooks WHERE id = ?;', [ id ] );
        }, updatePresentBooks );
    };

    const addBook = ( bookName, author, imgurl ) => {
        database.run ( ( context ) => {
            context.executeSql ( 'INSERT INTO StoredBooks (bookname, author, imageurl, read) VALUES (?, ?, ?, 0);', [ bookName, author, imgurl ] );
        }, updatePresentBooks );
    };
    
    useEffect ( updatePresentBooks, [ ] );

    // Adding a custom book doesn't require a lot of lines of code 
    // for using OpenLibrary's API and everything
    // So we can do it in this file juuuuuuust fine

    const onAddCustomBook = ( ) => {
        if ( customBookFields.bookName === '' || customBookFields.author === '' ) {
            return;
        }

        addBook ( customBookFields.bookName, customBookFields.author, customBookFields.imgurl === '' ? null : customBookFields.imgurl );
    };

    const onFieldChangeFn = fieldName => text => {
        setCustomFields ( { ...customBookFields, [ fieldName ]: text } );
    };

    const customBookDialog = <Dialog
        isVisible={ customAdd }
        onBackdropPress={ ( ) => setCustomAdd ( false ) }
        overlayStyle={
            {
                backgroundColor: theme.colors.background
            }
        }
    >
        <Dialog.Title titleStyle={ { color: theme.colors.black } } title='Custom book adder'/>
        
        <Input
            label='Book name'
            placeholder='Book name'
            value={ customBookFields.bookName }
            onChangeText={ onFieldChangeFn ( 'bookName' ) }
            errorMessage={ customBookFields.bookName === '' ? 'The book name cannot be empty!' : null }
        />

        <Input
            label='Author'
            placeholder='Author(s)'
            value={ customBookFields.author }
            onChangeText={ onFieldChangeFn ( 'author' ) }
            errorMessage={ customBookFields.author === '' ? 'The author name cannot be empty!' : null }
        />

        <Input
            label='Image URL'
            placeholder='Image URL'
            value={ customBookFields.imgurl }
            onChangeText={ onFieldChangeFn ( 'imgurl' ) }
        />

        <Button onPress={ onAddCustomBook } raised title='Confirm' color='secondary'/>
    </Dialog>

    const viewStyle = { ...styles.viewStyle, backgroundColor: theme.colors.background };

    // Nicely visualizing books and stuff

    const keyExtractor = item => item.id.toString ( );

    const onClick = ( book ) => {
        setEditor ( {
            editBookField: changeField ( book.id ),
            deleteBook: removeBook ( book.id ),
            addBook: addBook
        } );

        navigation.navigate ( 'Book', { book: book } );
    };

    const itemRenderer = ( { item } ) => {
        const itemContents = <>
            <ListItem.Content>
                { item.imageurl !== null ? <Image
                    style={ styles.imageStyle }
                    source={ { uri: item.imageurl } }
                /> : <Icon solid name='book' size={ 100 } containerStyle={ styles.imageStyle }/> }
            </ListItem.Content>
            <ListItem.Content right>
                <ListItem.Title style={ { fontWeight: 'bold' } }>{ item.bookname }</ListItem.Title>
                <ListItem.Subtitle style={ { fontStyle: 'italic' } }>{ `By ${item.author}` }</ListItem.Subtitle>
                { item.read === 0 && <ListItem.Subtitle style={ { color: 'red', fontWeight: 'bold' } }>{ '\nNot read yet!' }</ListItem.Subtitle> }
                <ListItem.Subtitle>{ '\n' }</ListItem.Subtitle>
                <ListItem.Subtitle style={ 
                    { fontSize: 11, fontStyle: 'italic' }
                }>Swipe for quick actions!</ListItem.Subtitle>
            </ListItem.Content>
        </>

        const leftContent = item.read === 0 ? reset => <Button
            title='Mark as read'
            buttonStyle={ {
                minHeight: '100%',
                backgroundColor: theme.colors.success
            } }
            onPress={ ( ) => {
                changeField ( item.id ) ( 'read', 1 );
                reset ( ); 
            } }
        /> : null;

        const rightContent = reset => <Button
            title='Delete'
            buttonStyle={ {
                minHeight: '100%',
                backgroundColor: theme.colors.error
            } }
            onPress={ ( ) => {
                removeBook ( item.id ) ( );
                reset ( );
            } }
        />

        return <ListItem.Swipeable 
            topDivider 
            bottomDivider 
            onLongPress={ ( ) => onClick ( item ) }
            leftContent={ leftContent }
            rightContent={ rightContent }
        >
            { itemContents }
        </ListItem.Swipeable>
    };

    return <View style={ viewStyle }>
            <View style={ { flex: .95 } }>
                <Header
                    centerComponent={
                        {
                            text: `${books.length} books listed`,
                            style: {
                                color: theme.colors.black,
                                fontWeight: 'bold',
                                fontSize: 24
                            }
                        }
                    }
                    rightComponent={ 
                        <Icon
                            solid
                            name='settings'
                            color={ theme.colors.black }
                            onPress={ ( ) => setConfigOpen ( true ) }
                        />
                    }
                    elevated
                />
                <SearchBar
                    placeholder="Filter name by..."
                    onChangeText={ text => setSearch ( text ) }
                    value={ searchedBook }
                    containerStyle={ { backgroundColor: theme.colors.background } }
                />

                { books.length === 0 && <Text style={ { textAlign: 'center' } } h3>No books found yet! Consider adding some?</Text> }
                { addDialog && <BookFinder addBook={ addBook } setActive={ setAddDialog }/> }
                { customBookDialog }
                { configOpen && <Config setActive={ setConfigOpen }/> }
                <FlatList
                    data={ searchedBook.length > 0 ? books.filter ( book => book.bookname.toLowerCase ( ).includes ( searchedBook.toLowerCase ( ) ) ) : books }
                    keyExtractor={ keyExtractor }
                    renderItem={ itemRenderer }
                />
            </View>
            <View style={ styles.footerStyle }>
                <Button buttonStyle={ styles.buttonStyle } color="secondary" title='Look up a book' onPress={ ( ) => setAddDialog ( true ) }/>
                <Button buttonStyle={ styles.buttonStyle } color='secondary' title='Add a custom book' onPress={ ( ) => setCustomAdd ( true ) }/>
            </View>
        </View>
};

const styles = StyleSheet.create ( {
    viewStyle: {
        flex: 1,
    },

    imageStyle: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center'
    },

    footerStyle: {
        flex: .05,
        margin: '5%',
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },

    buttonStyle: {
        width: 175
    }
} );

export default BookList;