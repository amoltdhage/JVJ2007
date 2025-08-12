// firebase.js
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyBSnj0-wVR1T_Bc3kXRJMhRf61iD65Mvok",
//   authDomain: "jvj-reconnect.firebaseapp.com",
//   projectId: "jvj-reconnect",
//   storageBucket: "jvj-reconnect.appspot.com", // ✅ fixed
//   messagingSenderId: "478388620074",
//   appId: "1:478388620074:web:abf3106aac12aaaef9ec53",
//   measurementId: "G-X13DBNVYW9" // can keep, doesn't break anything
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const db = getFirestore(app);

// firebase.js
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export { auth, firestore };
