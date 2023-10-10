// screens/SyncInstagram.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import StepIndicator from "../components/StepIndicator";
import CustomButton from "../components/CustomButton";
import { db, auth } from "../firebaseConfig";
import { getDoc, doc, addDoc } from "firebase/firestore";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const LOCATION_TRACKING = "location-tracking";

const SyncInstagram = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

	const [locationStarted, setLocationStarted] = useState(false);

	const startLocationTracking = async () => {
		setLoading(true);

		await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
			accuracy: Location.Accuracy.Highest,
			timeInterval: 3600,
			distanceInterval: 0,
		});
		const hasStarted = await Location.hasStartedLocationUpdatesAsync(
			LOCATION_TRACKING
		);
		setLocationStarted(hasStarted);
		console.log("tracking started?", hasStarted);
		navigation.navigate("ProfileSetup");
		setLoading(false);
	};

	const startLocation = () => {
		startLocationTracking();
	};

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid));
				if (userDoc.exists()) {
					setUser(userDoc.data());
				}
			} catch (error) {
				console.error("Error fetching user:", error);
			}
		};

		const config = async () => {
			let resf = await Location.requestForegroundPermissionsAsync();
			let resb = await Location.requestBackgroundPermissionsAsync();
			if (resf.status != "granted" && resb.status !== "granted") {
				console.log("Permission to access location was denied");
			} else {
				console.log("Permission to access location granted");
			}
		};

		config();
		fetchUserData();
	}, []);

	// const handleLocationEnableRequest = () => {
	// 	setLoading(true)
	// 	startBackgroundLocation(user);
	// 	navigation.navigate("ProfileSetup")
	// 	setLoading(false)
	// }

	return (
		<View style={styles.container}>
			<StepIndicator totalSteps={3} currentStep={2} />
			<Text style={styles.title}>Location Permissions</Text>

			<Image
				source={require("../assets/images/locationIconOnMap.png")}
				style={styles.image}
			/>
			<Text style={styles.subtitle}>
				Allowing location permissions allows Stumble to notify you when one of
				your contacts are nearby.
			</Text>
			<CustomButton
				loading={loading}
				style={styles.button}
				text='Give Location Permissios'
				onPress={startLocation}
			/>
		</View>
	);
};

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
	if (error) {
		console.log("LOCATION_TRACKING task ERROR:", error);
		return;
	}
	if (data) {
		const { locations } = data;
		let lat = locations[0].coords.latitude;
		let long = locations[0].coords.longitude;

		l1 = lat;
		l2 = long;

		console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${long}`);

		if (user) {
			try {
				const locationCollectionRef = collection(
					doc(db, "users", user.uid),
					"locations"
				);
				const docRef = await addDoc(locationCollectionRef, {
					latitude: lat,
					longitude: long,
					timestamp: new Date(),
				});
				console.log("Document added with ID: ", docRef.id);
			} catch (error) {
				console.error("Error adding users location to sub-collection: ", error);
			}
		}
	}
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "white",
	},
	image: {
		width: 340,
		height: 300,
		marginBottom: 40,
	},
	title: {
		fontSize: 32,
		textAlign: "center",
		marginBottom: 10,
		color: "#537d8d",
		fontFamily: "bold",
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 40,
		color: "#666",
		fontFamily: "regular",
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.4)", // Semi-transparent background
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 15,
	},
	button: {
		bottom: 40,
		alignSelf: "center",
		position: "absolute",
	},
});

export default SyncInstagram;
