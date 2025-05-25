
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvuILIDo5uxxkX4SRo1rkMGN3EVKf_cRQ",
  authDomain: "ecocity-801cc.firebaseapp.com",
  databaseURL: "https://ecocity-801cc-default-rtdb.firebaseio.com",
  projectId: "ecocity-801cc",
  storageBucket: "ecocity-801cc.appspot.com",
  messagingSenderId: "825751292076",
  appId: "1:825751292076:web:11dcde0f9a5d153b64b709",
  measurementId: "G-9NQK92Q42X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in browser environments where it's supported
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics:", error);
  }
}

export { app, analytics };
