# BookApp - when you think your OpenAI API usecase is too stupid
## Features  
- Storing a list of books using SQLite with an ability to mark them as read
- Summarizing books using OpenAI's chat completion API
- Suggesting new books using the same API
- Potential support for a back-end server to securely serve OpenAI requests
- Using Firebase's Auth API for user verification for said backend

## Known issues
- The OpenAI token *really* should not be stored in AsyncStorage
- I am terrible at design
- And even more so at naming

## Todos
- Better design
- Implementing backend server support
- Implementing a Firebaseless option when going without a remote backend

## Getting ready to build

```
npm install
```
Create an .env file with the following keys:
```
ASYNCSTORAGE_CONFIGNAME // whatever your AsyncStorage key should be for your app config
REQUIRE_CONFIGURATION_BEFORE_ACCESS // true or false, whether or not the user should get the config screen before app access
USE_OPENAI_PROVIDER_SERVER // true or false, currently unimplemented, controls whether or not the app should use a remote backend server
USER_OPENAI_KEY // your OpenAI token, if you're feeling frisky

FIREBASE_APIKEY // Firebase API key
FIREBASE_AUTHDOMAIN // Firebase auth domain
FIREBASE_PROJECTID // Project ID
FIREBASE_STORAGEBUCKET // Storage bucket
FIREBASE_MESSAGINGSENDERID // Whatever that is, copy it from the Firebase config file you got
FIREBASE_APPID // Your Firebase app ID
FIREBASE_MEASUREMENTID // Another value I know nothing about
```

## Testing

```
npx expo start
```

## Building

```
eas secret:push --scope project --env-file .env
```

Create whatever profiles you need in eas.json, then run:

```
eas build -p your-platform --profile your-profile
```