import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = { 
  apiKey : process.env.NEXT_PUBLIC_FIREBASE_apiKey , 
  authDomain : process.env.NEXT_PUBLIC_FIREBASE_authDomain , 
  databaseURL : process.env.NEXT_PUBLIC_FIREBASE_databaseURL , 
  projectId : process.env.NEXT_PUBLIC_FIREBASE_projectId , 
  storageBucket : process.env.NEXT_PUBLIC_FIREBASE_storageBucket , 
  messagingSenderId : process.env.NEXT_PUBLIC_FIREBASE_messagingSenderId , 
  appId : process.env.NEXT_PUBLIC_FIREBASE_appId , 
  measurementId : process.env.NEXT_PUBLIC_FIREBASE_measurementId
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const rtDb = getDatabase(app);