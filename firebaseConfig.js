import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
	apiKey: process.env.apiKey,
	authDomain: process.env.autnhDomain,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId,
	measurementId: process.env.measuremetId,
};

const app = initializeApp(firebaseConfig);
// const auth = getAuth(app)

const auth = getAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

auth.useDeviceLanguage();

const db = getFirestore(app);

export { app, auth, db };
