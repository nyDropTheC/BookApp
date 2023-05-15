import AsyncStorage from '@react-native-async-storage/async-storage';

import { ASYNCSTORAGE_CONFIGNAME, USE_OPENAI_PROVIDER_SERVER, USER_OPENAI_KEY, REQUIRE_CONFIGURATION_BEFORE_ACCESS } from '@env';

const getConfig = async ( ) => {
    const rawConfig = await AsyncStorage.getItem ( ASYNCSTORAGE_CONFIGNAME );

    const appConfig = rawConfig !== null ? JSON.parse ( rawConfig ) : {
        useMockBackendApi: USE_OPENAI_PROVIDER_SERVER === 'false',
        requireConfigurationBeforeAccess: REQUIRE_CONFIGURATION_BEFORE_ACCESS === 'true',
        userOpenAiKey: USER_OPENAI_KEY,
        remoteBackendPath: '',
        useDarkTheme: true,
    }; // Default vars to initialize with

    console.log ( 'BBBBBBBBBBBBBBBBBB', appConfig )
    
    const saveConfig = async ( ) => {
        try {
            await AsyncStorage.setItem ( ASYNCSTORAGE_CONFIGNAME, JSON.stringify ( appConfig ) );
        } catch ( e ) {
            console.error ( e );
        }
    };

    return {
        config: appConfig,
        save: saveConfig
    };
};

export default getConfig;
