const admin = require('firebase-admin');

const serviceAccount = require('../../kasa-talk-storage-firebase-adminsdk-i5qka-a07fb905ba.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://kasa-talk-storage.appspot.com',
});

module.exports = admin;
