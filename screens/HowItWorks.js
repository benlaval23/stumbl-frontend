// screens/HowItWorks.js
import React, { useState } from "react";
import { View, Text, Image, Button, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton";
import StepIndicator from "../components/StepIndicator";
import { auth } from "../firebaseConfig";

const HowItWorks = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	return (
		<View style={styles.container}>
			<StepIndicator totalSteps={4} currentStep={1} />
			<Text style={styles.title}>How it works</Text>
			<Image
				source={require("../assets/images/groupSocializingFun.png")}
				style={styles.image}
			/>

			<Text style={styles.explainer}>Short explainer for the first image.</Text>
			<Text style={styles.explainer}>
				Logged in as {auth.currentUser?.uid}{" "}
			</Text>

			<Text style={styles.explainer}>
				Short explainer for the second image.
			</Text>
			<CustomButton
				loading={loading}
				style={styles.button}
				text='Next'
				onPress={() => {
					setLoading(true);
					navigation.navigate("SyncContacts");
					setLoading(false);
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
	},
	image: {
		width: 320,
		height: 200,
		margin: 16,
	},
	explainer: {
		marginBottom: 30,
		textAlign: "center",
	},
	title: {
		fontSize: 24,
		textAlign: "center",
		marginBottom: 20,
	},
	button: {
		bottom: 40,
		alignSelf: "center",
		position: "absolute",
	},
});

export default HowItWorks;
