import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCw-LQbn2j2Py5tYiQbMaY9EWZl-EqazqQ",
  authDomain: "resumefy-8e8fa.firebaseapp.com",
  projectId: "resumefy-8e8fa",
  storageBucket: "resumefy-8e8fa.appspot.com",
  messagingSenderId: "340638164003",
  appId: "1:340638164003:web:c8aea1ae3ceec9a9313d96",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
