import * as SQLite from 'expo-sqlite';

const getDatabaseApi = ( ) => {
    const database = SQLite.openDatabase ( 'BookAppData.db' );

    const databaseErrorHandler = console.error.bind ( this, 'SQLite DB error: ' );

    const api = {
        db: database,
        run: ( closure, success ) => {
            database.transaction ( closure, databaseErrorHandler, success );
        }
    };

    const createDatatables = ( ) => {
        api.run ( context => {
            context.executeSql ( 'CREATE TABLE IF NOT EXISTS StoredBooks (id INTEGER PRIMARY KEY, bookname TEXT NOT NULL, author TEXT, imageurl TEXT, read INTEGER NOT NULL);' );
        }, null );
    };

    createDatatables ( );

    return api;
};

export default getDatabaseApi;
