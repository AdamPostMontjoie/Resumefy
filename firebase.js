
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('./resumefy-8e8fa-596b083f089f.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports ={db}