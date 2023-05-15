import { Button, Card, CheckBox, Dialog, Header, Icon, Image, Input, Text, useTheme } from '@rneui/themed';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import ApiContext from '../contexts/apicontext';
import UserContext from '../contexts/usercontext';
import BookEditorContext from '../contexts/bookeditorcontext';

const Book = ( { navigation, route: { params: { book } } } ) => {
    // OpenAI's Stream support doesn't play nice with the NodeJS library, unfortunately
    // So we can't get a ChatGPT-like effect going on with tokens streaming in
    // Now that I think of it a bit more, 
    // it wouldn't have worked out anyway without things I don't know how to do
    // Cuz I have no idea how to forward the stream from the backend to the device
    // So the software would have to use the user's API key
    // Which I really dislike for REASONS

    const UNGENERATED_SUMMARY_PLACEHOLDER = 'Our well-trained monkeys are writing you a summary, please wait...';
    
    const { theme } = useTheme ( );

    const { user } = useContext ( UserContext );
    const { openai: { generateSummary } } = useContext ( ApiContext );
    const { bookEditorState: { editBookField, deleteBook } } = useContext ( BookEditorContext );

    const [ description, setDescription ] = useState ( UNGENERATED_SUMMARY_PLACEHOLDER );
    const [ fieldStates, setFieldStates ] = useState ( { ...book } );

    const [ editDialogOpen, setEditDialogOpen ] = useState ( false );
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState ( false );

    const onEditData = ( ) => {
        for ( let fieldName of Object.keys ( fieldStates ) ) {
            const originalField = book [ fieldName ];
            const editedField = fieldStates [ fieldName ];

            if ( originalField !== editedField && editedField !== '' ) {
                editBookField ( fieldName, editedField );
            }
        }

        navigation.goBack ( );
    };

    const onDelete = ( ) => {
        deleteBook ( );
        navigation.goBack ( );
    };

    const editDialog = <Dialog 
        isVisible={ editDialogOpen } 
        onBackdropPress={ ( ) => setEditDialogOpen ( false ) }
        overlayStyle={
            { 
                backgroundColor: theme.colors.background
            }
        }
    >
        <Dialog.Title title='Book editor' titleStyle={
            {
                color: theme.colors.black 
            }
        }/>

        <CheckBox
            title={ 'I\'ve read this work' }
            checked={ !!fieldStates.read }
            onPress={ ( ) => setFieldStates ( { ...fieldStates, read: !!fieldStates.read ? 0 : 1 } ) }
            checkedColor={ theme.colors.secondary }
            iconType='material-community'
            checkedIcon='checkbox-marked'
            uncheckedIcon='checkbox-blank-outline'
        />

        <Input
            label='Book name'
            placeholder='Book name'
            value={ fieldStates.bookname }
            onChangeText={ text => setFieldStates ( { ...fieldStates, bookname: text } ) }
        />

        <Input
            label='Author'
            placeholder='Author name(s)'
            value={ fieldStates.author }
            onChangeText={ text => setFieldStates ( { ...fieldStates, author: text } ) }
        />

        <Input
            label='Image URL'
            placeholder='Image URL'
            value={ fieldStates.imageurl }
            onChangeText={ text => setFieldStates ( { ...fieldStates, imageurl: text } ) }
        />

        <Button title='Submit' raised color='secondary' onPress={ onEditData }/>
    </Dialog>;

    const deleteDialog = <Dialog 
        isVisible={ deleteDialogOpen } 
        onBackdropPress={ ( ) => setDeleteDialogOpen ( false ) }
        overlayStyle={ 
            {
                backgroundColor: theme.colors.background
            }
        }
    >
        <Dialog.Title 
            title='Are you sure?'
            titleStyle={
                {
                    color: theme.colors.black
                }
            }
        />
        <Button title='Confirm' onPress={ onDelete } color='error'/>
    </Dialog>;

    const fetchSummary = ( ) => {
        setDescription ( UNGENERATED_SUMMARY_PLACEHOLDER );
        generateSummary ( book, user )
            .then ( resp => {
                const collectedDescription = [ ];

                for ( let { message: { content } } of resp.choices ) {
                    collectedDescription.push ( content );
                }

                setDescription ( collectedDescription.join ( '\n' ) );
            } )
            .catch ( err => console.error ( err ) );
    };

    useEffect ( fetchSummary, [ ] );

    return <View style={ { flex: 1, backgroundColor: theme.colors.background } }>
        <Header
            centerComponent={ { text: `${book.bookname} by ${book.author}`, style: { color: theme.colors.black, fontWeight: 'bold', fontSize: 24 } } }
            elevated
        />
        <View style={ styles.primaryView }>
            { deleteDialog }
            { editDialog }

            <View style={ styles.coverImageSection }>
                { book.imageurl !== null ? <Image
                    style={ styles.coverImage }
                    source={ { uri: book.imageurl } }
                /> : <Icon solid name='subject' size={ 200 } containerStyle={ styles.coverImage }/> }
            </View>

            <View style={ styles.bottomSection }>
                <Text h4 style={ { textAlign: 'center' } }>Summary</Text>
                <ScrollView style={ { marginTop: '2%' } }>
                    <Text style={ { ...styles.textStyle, color: theme.colors.black } } selectable>{ description }</Text>
                </ScrollView>
            </View>

            <View style={ styles.footerSection }>
                <Button onPress={ ( ) => { navigation.navigate ( 'Suggestions', { book: book } ) } }buttonStyle={ styles.buttonStyle } raised color='secondary' title='More'/>
                <Button onPress={ ( ) => setEditDialogOpen ( true ) } raised buttonStyle={ styles.buttonStyle } color='secondary' title='Edit'/>
                <Button onPress={ ( ) => setDeleteDialogOpen ( true ) } raised buttonStyle={ styles.buttonStyle } color='error' title='Delete'/>
            </View>
        </View>
    </View>
};

const styles = StyleSheet.create ( {
    primaryView: {
        flex: 1,
        flexDirection: 'column',
    },

    coverImageSection: {
        flex: 0.33,
        raised: true,
        alignItems: 'center',
        justifyContent: 'center'
    },

    coverImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain'
    },

    bottomSection: {
        flex: 0.55,
        marginLeft: '5%',
        marginRight: '5%',
        marginTop: '1%',
        marginBottom: '1%',
        lineHeight: 1.6,
        raised: true
    },

    footerSection: {
        flex: 0.12,
        marginLeft: '5%',
        marginRight: '5%',
        marginTop: '1%',
        marginBottom: '1%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    buttonStyle: {
        minWidth: '25%'
    },

    summaryButtonStyle: {
        marginTop: '2%',
        marginBottom: '2%'
    },

    textStyle: {
        marginTop: '2%',
        marginBottom: '2%',
        fontSize: 16
    }
} );

export default Book;