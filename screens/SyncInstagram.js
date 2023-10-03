// screens/SyncInstagram.js
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import StepIndicator from "../components/StepIndicator";

const SyncInstagram = ({ navigation, route }) => {
	const user = route.params;

	return (
		<View style={styles.container}>
			<StepIndicator totalSteps={4} currentStep={3} />
			<Text style={styles.title}>Sync Instagram Contacts</Text>
			<Text style={styles.subtitle}>
				Sync your Instagram contacts to discover and connect with them on
				Re-connect.
			</Text>
			<Button
				style={styles.button}
				title='Proceed to Profile Setup'
				onPress={() => navigation.navigate("ProfileSetup", user)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: "center",
		backgroundColor: "white",
	},
	title: {
		fontSize: 24,
		textAlign: "center",
		marginBottom: 20,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 40,
		color: "#666",
	},
	phoneInput: {
		flex: 6,
		marginLeft: 10,
		height: 60,
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		color: "#313334",
		fontSize: 16,
		marginTop: 0,
	},
	button: {
		bottom: 40,
		alignSelf: "center",
		position: "absolute",
	},
});

export default SyncInstagram;
