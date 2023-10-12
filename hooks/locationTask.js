import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import { auth, db } from "../firebaseConfig";

const LOCATION_TRACKING = "location-tracking";
const BACKGROUND_FETCH_TASK = "background-fetch-task";

const updateLocationData = async (latestLocation) => {
	const user = auth.currentUser?.uid;
	if (user) {
		console.log(locations);

		const userRef = db.collection("users").doc(user);
		await userRef.update({
			lastLocationData: {
				latitude: latestLocation.coords.latitude,
				longitude: latestLocation.coords.longitude,
			},
		});
	} else {
		console.log("no user found when trying to updateLocationData()");
	}
};

export const startLocationTracking = async () => {
	await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
		accuracy: Location.Accuracy.Balanced,
		timeInterval: 360000,
		distanceInterval: 0,
		showsBackgroundLocationIndicator: true,
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
