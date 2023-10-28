import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import { auth, functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";
import { haversineDistance, normalizePhoneNumber } from "./utils";
const LOCATION_TRACKING = "location-tracking";
const BACKGROUND_FETCH_TASK = "background-fetch-task";
import * as NotificationTasks from "./notifications";
import {
	sendPushNotification,
	registerForPushNotificationsAsync,
} from "./notifications";

const getUser = httpsCallable(functions, "getUser");
const getUserContacts = httpsCallable(functions, "getUserContacts");
const searchUserByPhoneNumbers = httpsCallable(
	functions,
	"searchUserByPhoneNumbers"
);
const updateUser = httpsCallable(functions, "updateUser");

const sendNotifications = async (notificationsToSend) => {
    try {
        const token = await registerForPushNotificationsAsync();

        for (let notification of notificationsToSend) {
            const distance = notification.distance;
			let text;

			if (distance < 1) {
				text = `${notification?.user?.name} is less than 1km away from you!`;
			} else {
				text = `${notification?.user?.name} is ${Math.round(distance)}km away from you!`;
			}

            const message = {
                to: token,
                sound: "default",
                title: "Stumbl",
                body: text,
                data: { someData: "goes here" },
            };

            sendPushNotification(message);
        }
    } catch (error) {
        console.error("Failed to send notifications:", error);
    }
};

const checkDistance = async (currentUser, matchedUser) => {
	if (currentUser && matchedUser) {
		const currentUserLocation = currentUser?.lastLocationData;
		const lat1 = currentUserLocation.latitude;
		const lon1 = currentUserLocation.longitude;

		const matchedUserLocations = matchedUser?.lastLocationData;
		const lat2 = matchedUserLocations?.latitude;
		const lon2 = matchedUserLocations?.longitude;

		const distance = haversineDistance(lat1, lon1, lat2, lon2);
		const notificationSettings = currentUser?.notificationSettings?.rules?.home;

		if (distance <= notificationSettings) {
			const userDistance = {
				user: matchedUser,
				distance: distance,
			};
			return userDistance;
		} else {
			return null;
		}
	}
};

const findUserMatches = async (user) => {
	try {
		
		const userContacts = await getUserContacts({ userId: user });

		const contacts = userContacts.data.data;
		// 1. Gather all phone numbers
		let allPhoneNumbers = [];

		for (let contact of contacts) {
			const name = contact?.name;
			let phoneNumbers = contact?.phoneNumbers;
			if (!Array.isArray(phoneNumbers)) {
				console.warn("phoneNumbers is not an array for a contact:", contact);
				continue; // Skip to the next contact
			}

			for (let phoneNumber of phoneNumbers) {

				let digits = phoneNumber.digits.toString(); 

				if (digits.startsWith("00")) {
					digits = digits.replace(/^00/, "+");
				} else if (digits.startsWith("0")) {
					digits = digits.replace(/^0/, "+44");
				} else if (digits.startsWith("44")) {
					digits = digits.replace(/^44/, "+44");
				}

				const normalizedPhoneNumber = normalizePhoneNumber(digits);
				if (normalizedPhoneNumber) { 
					allPhoneNumbers.push({name: name, normalizePhoneNumber: normalizedPhoneNumber});
				} else {
					console.warn("Unable to normalize phone number:", digits);
				}
			}
		}

		const justPhoneNumbers = allPhoneNumbers.map(entry => entry.normalizePhoneNumber)

		const userMatchesResponse = await searchUserByPhoneNumbers({
			phoneNumbers: justPhoneNumbers,
		});

		const userMatches = userMatchesResponse.data.data;

		for (let user of userMatches) {
			const phoneNumber = user?.phoneNumber?.normalizedNumber;
			const name = allPhoneNumbers.find(entry => entry.normalizePhoneNumber === phoneNumber)?.name;
			user.name = name;
		}

		return userMatches;
	} catch (error) {
		console.error("Error fetching user:", error);
	}
};

const updateLocationData = async (latestLocation) => {
	const userId = auth.currentUser?.uid;
	console.log("userId: ", userId);

	try {

		await updateUser({
			userId: userId,
			data: {
				"lastLocationData.latitude": latestLocation.coords.latitude,
				"lastLocationData.longitude": latestLocation.coords.longitude,
			},
		})
			.then((result) => {
				console.log(result.data.message);
			})
			.catch((error) => {
				console.log(error);
			});

		const matches = await findUserMatches(userId);

		const currentUserResponse = await getUser({ userId: userId });
		const currentUser = currentUserResponse.data.data;

		const distances = await Promise.all(
			matches.map((matchedUser) => checkDistance(currentUser, matchedUser))
		);
		const notificationsToSend = distances.filter(Boolean);
	
		sendNotifications(notificationsToSend);
	} catch (error) {
		console.error("Error updating user data:", error);
	}
};

export const startLocationTracking = async () => {
	await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
		accuracy: Location.Accuracy.Low,
		timeInterval: 3600000,
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

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {

	const userId = auth.currentUser?.uid;

	if (!userId) {
		console.warn("No user ID found, aborting location update.");
		return;
	}
	console.log("Running LOCATION_TRACKING task...");
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

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
	const userId = auth.currentUser?.uid;

	if (!userId) {
		console.warn("No user ID found, aborting location update.");
		return;
	}

	console.log("Running BACKGROUND_FETCH task...");
	const receivedNewData = await fetchData(); // you can call your location updates or other data fetching logic here
	return receivedNewData
		? BackgroundFetch.Result.NewData
		: BackgroundFetch.Result.NoData;
});
