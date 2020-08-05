import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAfSqNWMBOushDVKUMDkeMWmY_mfKovnVE",
    authDomain: "react-slack-clone-800c6.firebaseapp.com",
    databaseURL: "https://react-slack-clone-800c6.firebaseio.com",
    projectId: "react-slack-clone-800c6",
    storageBucket: "react-slack-clone-800c6.appspot.com",
    messagingSenderId: "74116302342",
    appId: "1:74116302342:web:123850c6e154ea7978e587"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;