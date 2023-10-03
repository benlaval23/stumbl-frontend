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
import * as Location from "expo-location";

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

		fetchUserData();

		if (user) {
			setIsLocationsEnabled(user.locationEnabled);
			setIsNotificationsEnabled(user.notificationSettings.enabled);
			setConnectionDistance(user.notificationSettings.rules.home);
		}
	}, [user]);

	const handleLocationEnableRequest = async () => {
		if (isLocationsEnabled) {
			setIsLocationsEnabled(false);
		} else {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				return;
			} else {
				let location = await Location.getCurrentPositionAsync({});
				setLocation(location);
				setIsLocationsEnabled(true);
				console.log(location);
			}
		}
	};

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
		<View style={styles.container}>
			<StepIndicator totalSteps={4} currentStep={4} />
			<View style={styles.subMenu}>
				<Text style={styles.subMenuTitle}>Invite friends</Text>
				<Text>https://stumble.app/share/3r3r0he</Text>
				<Button title='Share invite' onPress={() => {}} />
			</View>
			<View style={styles.subMenu}>
				<Text style={styles.subMenuTitle}>Notifications</Text>
				<View style={styles.notificationOption}>
					<Text>Enabled</Text>
					<Switch
						trackColor={{ false: "#767577", true: "#537d88" }}
						thumbColor={isNotificationsEnabled ? "#1b0ffd" : "#f4f3f4"}
						ios_backgroundColor='#3e3e3e'
						value={isNotificationsEnabled}
						onValueChange={(value) => setIsNotificationsEnabled(value)}
					/>
				</View>
				<View style={styles.notificationOption}>
					<Text>Notify me when connections within: </Text>
					<TextInput
						style={styles.input}
						value={connectionDistance}
						keyboardType='numeric'
						onChangeText={(value) => setConnectionDistance(value)}
					/>
					<Text>Km</Text>
				</View>
			</View>
			<View style={styles.subMenu}>
				<Text style={styles.subMenuTitle}>Locations Settings</Text>
				<View style={styles.notificationOption}>
					<Text>Enabled</Text>
					<Switch
						trackColor={{ false: "#767577", true: "#81b0ff" }}
						thumbColor={isLocationsEnabled ? "#537d8d" : "#f4f3f4"}
						ios_backgroundColor='#3e3e3e'
						value={isLocationsEnabled}
						onValueChange={handleLocationEnableRequest}
					/>
				</View>
			</View>
			<CustomButton
				loading={loading}
				style={styles.button}
				text='Finish Setup'
				onPress={handleFinishSignUp}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff", // Soft background color
	},
	title: {
		fontSize: 26,
		textAlign: "center",
		marginBottom: 30,
		color: "#333", // Dark gray for main texts
	},
	subMenu: {
		marginVertical: 10,
		padding: 15,
		borderRadius: 15,
		backgroundColor: "#f0f0f0",
		elevation: 5,
	},
	subMenuTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
		color: "#537d8d", // Color to match the invite button, for consistency.
	},
	notificationOption: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginVertical: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "#aaa",
		borderRadius: 10,
		paddingHorizontal: 10, // More space on sides
		height: 40, // Added height
		width: 70, // Increased width
		marginHorizontal: 10, // More space on sides
		textAlign: "center",
		fontSize: 16,
		color: "#444",
	},
	button: {
		bottom: 40,
		alignSelf: "center",
		position: "absolute",
	},
});

export default ProfileSetup;
