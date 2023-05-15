import { TouchableOpacity } from 'react-native';
import { Text, useTheme, useThemeMode } from '@rneui/themed';

import { useContext, useEffect, useState } from 'react';
import ApiContext from '../contexts/apicontext';
import Config from './userconfig';

const Cover = ( { navigation } ) => {
    const { theme } = useTheme ( );
    const { setMode } = useThemeMode ( );

    const api = useContext ( ApiContext );

    const [ displayConfiguration, setDisplayConfiguration ] = useState ( false );

    const onPress = ( ) => {
        // If api hasn't bothered initializing yet, we probably shouldn't let the user move to Auth
        // This is cursed
        
        if ( api !== null ) {
            navigation.navigate ( 'Auth' );
        }
    };
    
    useEffect ( ( ) => {
        if ( api !== null ) {
            // Kill me for this
            // Unironically
            // This is completely disgusting
            const { config: { config: { useDarkTheme, requireConfigurationBeforeAccess } } } = api;

            if ( requireConfigurationBeforeAccess ) {
                setDisplayConfiguration ( true );
            } else {
                const darkThemeModeOption = useDarkTheme ? 'dark' : 'light';
                setMode ( darkThemeModeOption );
            }
        }
    }, [ api ] );

    return <TouchableOpacity style={ {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
        backgroundColor: theme.colors.background
	} } onPress={ onPress }>
        { displayConfiguration && <Config setActive={ ( ) => { } }/> /* you ain't getting away lolz */ } 
        <Text h1={ true }>Welcome to BookApp!</Text>
        <Text h4={ true }>{ api === null ? 'Please wait' : 'Tap the screen to log in' }</Text>
    </TouchableOpacity>
};

export default Cover;