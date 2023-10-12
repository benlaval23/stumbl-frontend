// screens/SyncInstagram.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import StepIndicator from "../components/StepIndicator";
import CustomButton from "../components/CustomButton";
import * as Location from "expo-location";
import * as LocationTasks from '../hooks/locationTask'
import { startLocationTracking } from '../hooks/locationTask'



const SyncInstagram = ({ navigation }) => {
	const [loading, setLoading] = useState(false);

	const handleStartLocationTracking = async () => {
		setLoading(true);
		startLocationTracking();
		navigation.navigate("ProfileSetup");
		setLoading(false);
	};

	useEffect(() => {
		const requestLocationPermission = async () => {
			let { status } = await Location.requestBackgroundPermissionsAsync();
			if (status !== 'granted') {
			  console.error('Permission to access location was denied');
			  return;
			}
		};

		requestLocationPermission();
	}, []);

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
				text='Start Location Tracking'
				onPress={handleStartLocationTracking}
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

export default SyncInstagram;
