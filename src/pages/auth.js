import { useContext, useEffect, useState } from 'react';

import { Button, Dialog, Input, ListItem, useTheme } from '@rneui/themed';
import { View } from 'react-native';

import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import ApiContext from '../contexts/apicontext';
import UserContext from '../contexts/usercontext';

const SignupForm = ( { setVisible, onSignup } ) => {
    const { theme } = useTheme ( );

    const [ email, setEmail ] = useState ( '' );
    const [ password, setPassword ] = useState ( '' );

    const emailValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test ( email );
    const passwordValid = password.length >= 6;

    // lol
    // I genuinely don't care
    // Alas, Firebase does

    const onSubmit = ( ) => {
        if ( emailValid && passwordValid ) {
            setVisible ( false );
            onSignup ( email, password );
        }
    };

    return <Dialog
        onBackdropPress={ ( ) => setVisible ( false ) }
        overlayStyle={ { backgroundColor: theme.colors.background } }
    >
        <Dialog.Title title='Sign up' titleStyle={ { color: theme.colors.black, fontWeight: 'bold', fontSize: 16 } }/>
        <Input
            label='Email'
            placeholder='Email'
            onChangeText={ text => setEmail ( text ) }
            value={ email }
            renderErrorMessage
            autoComplete='email'
            inputMode='email'
            errorMessage={ !emailValid && email.length > 0 ? 'Invalid email' : null }
        />

        <Input
            label='Password'
            placeholder='Password'
            onChangeText={ text => setPassword ( text ) }
            value={ password }
            secureTextEntry
            renderErrorMessage
            autoComplete='new-password'
            errorMessage={ !passwordValid ? 'Password has to be at least 6 chars' : null }
        />

        <Button raised color='secondary' title='Submit' onPress={ onSubmit }/>
    </Dialog>
};

const Auth = ( { navigation } ) => {
    const { firebase: { auth } } = useContext ( ApiContext );
    const { setUser } = useContext ( UserContext );

    const { theme } = useTheme ( );

    const [ email, setEmail ] = useState ( '' );
    const [ password, setPassword ] = useState ( '' );

    const [ signupFormVisible, setSignup ] = useState ( false );
    const [ failureData, setFailureData ] = useState ( { failed: false, details: { message: '' } } );

    const failureDialog = <Dialog
        overlayStyle={ { backgroundColor: theme.colors.background } }
        onBackdropPress={ ( ) => setFailureData ( { ...failureData, failed: false } ) }
        isVisible={ failureData.failed }
    >
        <ListItem>
            <ListItem.Content>
                <ListItem.Title style={ { marginBottom: '2%', fontWeight: 'bold', color: theme.colors.error } }>Something went wrong!</ListItem.Title>
                <ListItem.Subtitle>{ failureData.details.message }</ListItem.Subtitle>
            </ListItem.Content>
            { /* ListItem is actually a pretty good wrapper*/ }
            
        </ListItem>
    </Dialog>;

    const onAuthError = err => {
        const codeToMessageCollection = {
            'auth/missing-password': 'Missing password (have you considered not ignoring error messages?)',
            'auth/wrong-password': 'User not found, maybe you misspelled email/password?',
            'auth/user-not-found': 'User not found, maybe you misspelled email/password?'
        };

        setFailureData ( {
            failed: true,
            details: {
                message: codeToMessageCollection [ err.code ] || `No message, code ${err.code}`
            }
        } );
    };

    const onUserCredentialReceived = userCredential => {
        setUser ( userCredential.user );

        navigation.reset ( {
            index: 0,
            routes: [ { name: 'List' } ]
        } );
    };

    const loginProcess = request => request
        .then ( onUserCredentialReceived )
        .catch ( onAuthError );
    
    const onLogin = ( ) => {
        loginProcess ( signInWithEmailAndPassword ( auth, email, password ) );
    };

    const onSignup = ( userEmail, userPassword ) => {
        // Seeing as this is passed into a separate component, 
        // we need the args

        loginProcess ( createUserWithEmailAndPassword ( auth, userEmail, userPassword ) );
    };

    return <View style={ {
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.background
            } }>
            <Input
                label='Email'
                placeholder='Email'
                onChangeText={ text => setEmail ( text ) }
                autoComplete='email'
                inputMode='email'
                value={ email }
            />

            <Input
                label='Password'
                placeholder='Password'
                onChangeText={ text => setPassword ( text ) }
                value={ password }
                secureTextEntry
                renderErrorMessage
                autoComplete='current-password'
                errorMessage={ password.length === 0 ? 'Specify a password' : null }
            />

            { failureDialog }
            { signupFormVisible && <SignupForm setVisible={ setSignup } onSignup={ onSignup }/> }

            <Button raised color='secondary' title='Log in' onPress={ onLogin }/>
            <Button raised color='secondary' title="Don't have an account? Sign up!" onPress={ ( ) => setSignup ( true ) }/>
    </View>
};

export default Auth;