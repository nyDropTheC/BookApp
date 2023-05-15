import { Button, Dialog, Input, ListItem, Switch, useTheme } from '@rneui/themed';
import { useContext, useEffect, useState } from 'react';

import ApiContext from '../contexts/apicontext';

import * as Updates from 'expo-updates';

const Config = ( { setActive } ) => {
    const { config: { config, save } } = useContext ( ApiContext );
    const { theme } = useTheme ( );

    const [ viewConfigState, setViewConfig ] = useState ( { ...config } );

    const onApply = ( ) => {
        for ( let fieldName in viewConfigState ) {
            config [ fieldName ] = viewConfigState [ fieldName ];
        }

        save ( )
            .then ( ( ) => Updates.reloadAsync ( ) )
            .catch ( err => console.error ( err ) );
            // I CAN'T MAKE IT RELOAD ON DEV BUILD
            // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa
    };

    const remoteBackendPathElem = <>
        <ListItem.Title>Remote backend path</ListItem.Title>
        <Input
            value={ viewConfigState.remoteBackendPath }
            onChangeText={ text => setViewConfig ( { ...viewConfigState, remoteBackendPath: text } ) }
        />
    </>;

    const userOpenAiTokenElem = <>
        <ListItem.Title>User OpenAI token</ListItem.Title>
        <Input
            value={ viewConfigState.userOpenAiKey }
            onChangeText={ text => setViewConfig ( { ...viewConfigState, userOpenAiKey: text } ) }
            secureTextEntry
        />
    </>;

    useEffect ( ( ) => {
        if ( viewConfigState.requireConfigurationBeforeAccess ) {
            setViewConfig ( { ...viewConfigState, requireConfigurationBeforeAccess: false } );
        } // A quick fix I forgot about
    }, [ ] );

    return <Dialog 
        onBackdropPress={ ( ) => setActive ( false ) }
        overlayStyle={ { backgroundColor: theme.colors.background } }   
    >
        <Dialog.Title
            title='Settings (restarts app upon apply)'
            titleStyle={ { color: theme.colors.black } }
        />
        <ListItem>
            <ListItem.Content>
                <ListItem.Title>Use dark theme</ListItem.Title>
                <Switch 
                    value={ viewConfigState.useDarkTheme } 
                    onValueChange={ v => setViewConfig ( { ...viewConfigState, useDarkTheme: v } ) }
                    color={ theme.colors.secondary }
                />
                <ListItem.Title>Use a mock backend API (user OpenAI token necessary)</ListItem.Title>
                <Switch 
                    value={ viewConfigState.useMockBackendApi } 
                    onValueChange={ v => setViewConfig ( { ...viewConfigState, useMockBackendApi: v } ) }
                    color={ theme.colors.secondary }
                />
                { viewConfigState.useMockBackendApi ? userOpenAiTokenElem : remoteBackendPathElem }

                <Button raised color='secondary' title='Apply' buttonStyle={ { minWidth: '100%' } } onPress={ onApply }/>
            </ListItem.Content>
        </ListItem>
    </Dialog>;
};

export default Config;