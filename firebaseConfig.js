import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_apiKey,
	authDomain: process.env.EXPO_PUBLIC_authDomain,
	projectId: process.env.EXPO_PUBLIC_projectId,
	storageBucket: process.env.EXPO_PUBLIC_storageBucket,
	messagingSenderId: process.env.EXPO_PUBLIC_messagingSenderId,
	appId: process.env.EXPO_PUBLIC_appId,
	measurementId: process.env.EXPO_PUBLIC_measurementId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);
const functions = getFunctions(app);

// if (__DEV__) {
// 	connectFunctionsEmulator(functions, "localhost", 5001);
// 	console.log("functions emulator connected");
// } 

export { app, auth, db, functions };
