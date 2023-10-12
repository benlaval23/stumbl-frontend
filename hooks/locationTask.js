import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import { auth, db } from "../firebaseConfig";
import {
	updateDoc,
	doc,
	collection,
	getDocs,
	getDoc,
	query,
	where,
} from "firebase/firestore";
import { haversineDistance } from "./distance";

const LOCATION_TRACKING = "location-tracking";
const BACKGROUND_FETCH_TASK = "background-fetch-task";

const checkDistance = async (user, matchedUser) => {
	try {
		const userDoc = await getDoc(doc(db, "users", user));
		if (userDoc.exists()) {
			const currentUser = userDoc.data();

			const currentUserLocation = currentUser?.lastLocationData;
			const lat1 = currentUserLocation.latitude;
			const lon1 = currentUserLocation.longitude;

			const matchedUserLocations = matchedUser?.lastLocationData;
			const lat2 = matchedUserLocations?.latitude;
			const lon2 = matchedUserLocations?.longitude;

			const distance = haversineDistance(lat1, lon1, lat2, lon2);

			const notificationSettings =
				currentUser?.notificationSettings?.rules?.home;

			if (distance <= notificationSettings) {
				const userDistance = {
					user: matchedUser,
					distance: distance,
				};
				console.log("checkDistance()", userDistance);
				return userDistance;
			} else {
				return null;
			}
		} else {
			return null;
		}
	} catch (e) {
		console.log(e);
		return null;
	}
};

const findUserMatches = async (user) => {
	let userMatches = [];

	try {
		const contactsRef = collection(doc(db, "users", user), "contacts");
		const contactsSnapshot = await getDocs(contactsRef);
		const contactsDocs = contactsSnapshot.docs;

		// 1. Gather all phone numbers
		let allPhoneNumbers = [];
		for (let contact of contactsDocs) {
			let phoneNumbers = contact.data()?.phoneNumbers;
			for (let phoneNumber of phoneNumbers) {
				allPhoneNumbers.push(phoneNumber.digits);
			}
		}
		console.log(allPhoneNumbers);

		// 2. Batched queries
		for (let i = 0; i < allPhoneNumbers.length; i += 10) {
			const batch = allPhoneNumbers.slice(i, i + 10);
			const usersRef = collection(db, "users");

			try {
				const userQuery = query(usersRef, where("phoneNumber", "in", batch));
				const snapshot = await getDocs(userQuery);
				// 3. Iterate through results

				snapshot.docs.forEach((doc) => {
					const docData = doc.data();
					console.log(docData);

					const matchedUser = { id: doc.id, ...docData };
					userMatches.push(matchedUser);
				});
			} catch (e) {
				console.log("error with findin phone nmber iin batch", e);
			}
		}
	} catch (error) {
		console.error("Error fetching user:", error);
	}

	console.log("findUserMatches()", userMatches);
	return userMatches;
};

const updateLocationData = async (latestLocation) => {
	// const user = auth.currentUser?.uid;
	// for testing
	const user = "zqCYH3a8dQPKItEvASScmQEirQ13";
	console.log(latestLocation);

	try {
		const userRef = doc(db, "users", user);
		await updateDoc(userRef, {
			lastLocationData: {
				latitude: latestLocation.coords.latitude,
				longitude: latestLocation.coords.longitude,
			},
		});
		console.log("User location data uploaded successfully.");
		const matches = await findUserMatches(user);

		const distances = await Promise.all(
			matches.map((matchedUser) => checkDistance(user, matchedUser))
		);
		console.log(distances);
		const notificationsToSend = distances.filter(Boolean);

		console.log("notifications to send: ", notificationsToSend);
	} catch (error) {
		console.error("Error updating user data:", error);
	}
};

export const startLocationTracking = async () => {
	await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
		accuracy: Location.Accuracy.Balanced,
		timeInterval: 360000,
		distanceInterval: 0,
	});

	await registerBackgroundFetch();

	console.log(await TaskManager.getRegisteredTasksAsync());

	const hasStarted = await Location.hasStartedLocationUpdatesAsync(
		LOCATION_TRACKING
	);

	console.log("tracking started?", hasStarted);
};

const registerBackgroundFetch = async () => {
	await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
		minimumInterval: 3600, // seconds
		stopOnTerminate: false,
		startOnBoot: true,
	});
};

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
	if (error) {
		console.log("LOCATION_TRACKING task ERROR:", error);
		return;
	}
	if (data) {
		const { locations } = data;
		const latestLocation = locations[locations.length - 1];
		updateLocationData(latestLocation);
	}
});

async function fetchData() {
	try {
		const latestLocation = await Location.getCurrentPositionAsync({});
		console.log("fetchData()" + location);
		updateLocationData(latestLocation);
	} catch (error) {
		console.error(error);
		return false; // Indicates no new data.
	}
}

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
	const receivedNewData = await fetchData(); // you can call your location updates or other data fetching logic here
	return receivedNewData
		? BackgroundFetch.Result.NewData
		: BackgroundFetch.Result.NoData;
});
