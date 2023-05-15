import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import {
    FIREBASE_APIKEY,
    FIREBASE_AUTHDOMAIN,
    FIREBASE_PROJECTID,
    FIREBASE_STORAGEBUCKET,
    FIREBASE_MESSAGINGSENDERID,
    FIREBASE_APPID,
    FIREBASE_MEASUREMENTID
} from '@env';

const getFirebaseApi = ( ) => {
    const firebaseConfig = {
        apiKey: FIREBASE_APIKEY,
        authDomain: FIREBASE_AUTHDOMAIN,
        projectId: FIREBASE_PROJECTID,
        storageBucket: FIREBASE_STORAGEBUCKET,
        messagingSenderId: FIREBASE_MESSAGINGSENDERID,
        appId: FIREBASE_APPID,
        measurementId: FIREBASE_MEASUREMENTID,
    };

    const app = initializeApp( firebaseConfig );
    const auth = getAuth ( app );

    return {
        app: app,
        auth: auth
    };
};

export default getFirebaseApi;