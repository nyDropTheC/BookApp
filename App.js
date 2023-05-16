import 'react-native-gesture-handler';
// This fixes a problem not present in development mode, but crashing the app in .apk

import { ThemeProvider, createTheme, useThemeMode } from '@rneui/themed';
import { useEffect, useState } from 'react';

import Cover from './src/pages/coverpage';
import Auth from './src/pages/auth';
import BookList from './src/pages/booklist';
import Book from './src/pages/book';
import Suggestions from './src/pages/suggestions';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import getOpenAIAPI from './src/api/openai';
import getFirebaseApi from './src/api/firebase';
import getLibraryApi from './src/api/library';
import getDatabaseApi from './src/api/sqlite';
import getConfig from './src/api/config';

import ApiContext from './src/contexts/apicontext';
import UserContext from './src/contexts/usercontext';
import BookEditorContext from './src/contexts/bookeditorcontext';

// The following is a disgusting hack
// Because I should only pass serializable params in navigation
// I hate this

const theme = createTheme ( { 
	lightColors: {
		primary: '#f2f2f2',
	},

	darkColors: {
		primary: '#121212',
	},

	mode: 'dark'
} );

const Stack = createStackNavigator ( );

const App = () => {
	const [ user, setUser ] = useState ( null );
	const [ apiState, setApi ] = useState ( null );
	const [ bookEditorState, setEditor ] = useState ( {
		addBook: ( ) => { },
		editBookField: ( ) => { },
		deleteBook: ( ) => { }
	} );
	// This is disgusting
	// And I hate it
	// React Navigation can suck... something

	// This is cursed as all hell
	// Please forgive me
	// The gist of the problem is: getConfig *has* to be async to wait for AsyncStorage to read stuff
	// So, getConfig actually returns a *promise*
	// Which is a problem, because top-level await seems to result in some real funky errors on Expo
	// And otherwise we cannot configure stuff properly

	useEffect ( ( ) => {
		getConfig ( )
			.then ( configApi => {
				const OpenAIAPI = getOpenAIAPI ( configApi );
				const FirebaseAPI = getFirebaseApi ( );
				const SQLiteAPI = getDatabaseApi ( );
				const LibraryAPI = getLibraryApi ( );

				setApi ( {
					openai: OpenAIAPI,
					firebase: FirebaseAPI,
					database: SQLiteAPI,
					library: LibraryAPI,
					config: configApi
				} );
			} )
			.catch ( err => console.error ( err ) );
	}, [ ] );

	return (
		<NavigationContainer>
			<ApiContext.Provider value={ apiState }>
				<UserContext.Provider value={ {
					user: user,
					setUser: setUser
				} }>
					<ThemeProvider theme={ theme }>
						<BookEditorContext.Provider value={ {
							bookEditorState: bookEditorState,
							setEditor: setEditor
						} }>
							<Stack.Navigator screenOptions={ {
									gestureEnabled: true,
									headerShown: false
								}
							} initialRouteName="Cover">
								<Stack.Screen name="Cover" component={ Cover }/>
								<Stack.Screen name="Auth" component={ Auth }/>
								<Stack.Screen name="List" component={ BookList }/>
								<Stack.Screen name="Book" component={ Book }/>
								<Stack.Screen name="Suggestions" component={ Suggestions }/>
							</Stack.Navigator>
						</BookEditorContext.Provider>
					</ThemeProvider>
				</UserContext.Provider>
			</ApiContext.Provider>
		</NavigationContainer>
	);
};

export default App;
