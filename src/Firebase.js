// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeK6MCVdVtA0v_EVLF4Jhi2NrgfZQRt3E",
  authDomain: "brainwave-4eee0.firebaseapp.com",
  projectId: "brainwave-4eee0",
  storageBucket: "brainwave-4eee0.appspot.com",
  messagingSenderId: "307574608534",
  appId: "1:307574608534:web:60b22ece714e5d6dcd28b7",
  measurementId: "G-D3TT2RTDFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);


const auth = getAuth(app);

export {db, auth, storage};

