// screens/ProfileSetup.js
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
} from "react-native";
import StepIndicator from "../components/StepIndicator";
import { auth, db, functions } from "../firebaseConfig";
import { updateDoc, getDoc, doc } from "firebase/firestore";
import RNPickerSelect from "react-native-picker-select";
import CustomButton from "../components/CustomButton";
import * as Notifications from "expo-notifications";
import { httpsCallable } from "firebase/functions";

const updateUser = httpsCallable(functions, "updateUser");

const options = [
	{
		label: "0.5km",
		value: 0.5,
	},
	{
		label: "1km",
		value: 1,
	},
	{
		label: "2km",
		value: 2,
	},
	{
		label: "3km",
		value: 3,
	},
	{
		label: "5km",
		value: 5,
	},
	{
		label: "7.5km",
		value: 7.5,
	},
	{
		label: "10km",
		value: 10,
	},
	{
		label: "20km",
		value: 20,
	},
];

const ProfileSetup = ({ navigation }) => {
	// For demonstration purposes only: you'll probably want to store these in your component's state or some global state later
	const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
	const [connectionDistance, setConnectionDistance] = useState(1);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

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

		const requestNotificationPermission = async () => {
			try {
				const { status } = await Notifications.requestPermissionsAsync();
				if (status === "granted") {
					console.log("Notification permissions granted!");
					setIsNotificationsEnabled(true);
				} else {
					console.log("Notification permissions denied!");
				}
			} catch (error) {
				console.error("Failed to request notification permission:", error);
			}
		};

		fetchUserData();
		requestNotificationPermission();
	}, []);

	const handleFinishSignUp = async () => {
		setLoading(true);
		const userRef = doc(db, "users", auth.currentUser?.uid);

		await updateUser({userId: userRef, data: {
					"notificationSettings.enabled": isNotificationsEnabled,
					"notificationSettings.rules.home": connectionDistance,
				} }).then((result) => {
					const data = result.data;
					const success = data.success;

					if (success) {
						console.log(data.message);
						navigation.navigate("Home");
						setLoading(false);
					} else {
						setIsError(true);
						console.log(data.message);
						setLoading(false);
					}
				})
				.catch((error) => {
					setIsError(true);
					console.log(error);
					setLoading(false);
				});
		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<StepIndicator totalSteps={3} currentStep={3} />
			<Text style={styles.title}>Notifications Setup</Text>
			
		<Image
			source={require("../assets/images/bellOnAMap.png")}
			style={styles.image}
		/>
			<Text style={styles.subtitle}>Get notified when your connections are within...</Text>
			<View style={styles.selectContainer} >
				<RNPickerSelect
					style={{
						inputIOS: styles.select,
						inputAndroid: styles.select,
						// ... any other platform specific styles you want
					}}
					items={options}
					onValueChange={setConnectionDistance}
					value={connectionDistance}
				/>
			</View>
			<CustomButton
				loading={loading}
				style={styles.button}
				text='Finish set up'
				onPress={handleFinishSignUp}
			/>
		</View>
	);
};

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
		marginBottom: 20,
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
	selectContainer: {
		height: 60,
		width: "100%",
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	select: {
		color: "#313334",
		textAlign: "center",
		fontSize: 18,
		fontFamily: "regular",
	},
	button: {
		bottom: 40,
		alignSelf: "center",
		position: "absolute",
	},
});

export default ProfileSetup;
