const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

exports.admin = admin;

exports.firestore = admin.firestore()

exports.auth = admin.auth()