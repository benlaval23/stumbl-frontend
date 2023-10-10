// screens/ProfileSetup.js
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Button,
	StyleSheet,
	Switch,
	FlatList,
	Keyboard,
	TouchableOpacity,
	TextInput,
} from "react-native";
import StepIndicator from "../components/StepIndicator";
import { auth, db } from "../firebaseConfig";
import { addDoc, updateDoc, collection, getDoc, doc } from "firebase/firestore";
import CustomButton from "../components/CustomButton";
import * as Notifications from 'expo-notifications';


const ProfileSetup = ({ navigation }) => {
	// For demonstration purposes only: you'll probably want to store these in your component's state or some global state later
	const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
	const [isLocationsEnabled, setIsLocationsEnabled] = useState(false);
	const [connectionDistance, setConnectionDistance] = useState("");
	const [user, setUser] = useState(null);
	const [location, setLocation] = useState(null);
	const [loading, setLoading] = useState(false);

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
			  if (status === 'granted') {
				console.log('Notification permissions granted!');
			  } else {
				console.log('Notification permissions denied!');
			  }
			} catch (error) {
			  console.error('Failed to request notification permission:', error);
			}
		  };

		fetchUserData();
		requestNotificationPermission();

		if (user) {
			setIsLocationsEnabled(user.locationEnabled);
			setIsNotificationsEnabled(user.notificationSettings.enabled);
			setConnectionDistance(user.notificationSettings.rules.home);
		}
	}, [user]);

	const updateUserData = async () => {
		try {
			const userRef = doc(db, "users", auth.currentUser?.uid);
			await updateDoc(userRef, {
				"notificationSettings.enabled": isNotificationsEnabled,
				"notificationSettings.rules.home": connectionDistance,
				locationEnabled: isLocationsEnabled,
				lastLocationData: location,
			});
			console.log("User data updated successfully.");
		} catch (error) {
			console.error("Error updating user data:", error);
		}
	};

	const handleFinishSignUp = async () => {
		setLoading(true);
		await updateUserData();
		navigation.navigate("Home");
		setLoading(false);
	};

	return (
		// <View style={styles.container}>
		// 	<StepIndicator totalSteps={3} currentStep={2} />
		// 	<Text style={styles.title}>Location Permissions</Text>

		// 	{/* <Image
		// 		source={require("../assets/images/locationIconOnMap.png")}
		// 		style={styles.image}
		// 	/> */}
		// 	<Text style={styles.subtitle}>
		// 		Allowing location permissions allows Stumble to notify you when one of
		// 		your contacts are nearby.
		// 	</Text>
		// 	<View style={styles.subMenu}>
		// 		<Text style={styles.subMenuTitle}>Notifications</Text>
		// 		<View style={styles.notificationOption}>
		// 			<Text>Enabled</Text>
		// 			<Switch
		// 				trackColor={{ false: "#767577", true: "#537d88" }}
		// 				thumbColor={isNotificationsEnabled ? "#1b0ffd" : "#f4f3f4"}
		// 				ios_backgroundColor='#3e3e3e'
		// 				value={isNotificationsEnabled}
		// 				onValueChange={(value) => setIsNotificationsEnabled(value)}
		// 			/>
		// 		</View>
		// 		<View style={styles.notificationOption}>
		// 			<Text>Notify me when connections within: </Text>
		// 			<TextInput
		// 				style={styles.input}
		// 				value={connectionDistance}
		// 				keyboardType='numeric'
		// 				onChangeText={(value) => setConnectionDistance(value)}
		// 			/>
		// 			<Text>Km</Text>
		// 		</View>
		// 	</View>
		// 	<CustomButton
		// 		loading={loading}
		// 		style={styles.button}
		// 		text='Finish Setup'
		// 		onPress={handleFinishSignUp}
		// 	/>
		// </View>
		<View style={styles.container}>
		<StepIndicator totalSteps={3} currentStep={3} />
		<Text style={styles.title}>Notifications Setup</Text>
{/* 
		<Image
			source={require("../assets/images/locationIconOnMap.png")}
			style={styles.image}
		/> */}
		<Text style={styles.subtitle}>
			We need your notifications turned on
		</Text>
		<CustomButton
			loading={loading}
			style={styles.button}
			text='Finish set up'
			// onPress={}
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

export default ProfileSetup;
