import { initializeApp } from "firebase/app";
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

export { app, auth, db };
