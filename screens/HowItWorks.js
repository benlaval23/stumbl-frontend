// screens/HowItWorks.js
import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton";
import StepIndicator from "../components/StepIndicator";

const HowItWorks = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	return (
		<View style={styles.container}>
			<StepIndicator totalSteps={4} currentStep={1} />
			<Text style={styles.title}>How it works</Text>
			<View style={{ marginTop: 40 }}>
				<View style={styles.feature}>
					<Text style={styles.subTitle}>Sync your contacts</Text>
					<Image
						source={require("../assets/images/phoneContacts.png")}
						style={{ width: 180, height: 180 }}
					/>
				</View>
				<View style={styles.feature}>
					<Text style={styles.subTitle}>
						Get notified when old friends are nearby
					</Text>
					<Image
						source={require("../assets/images/locationIconOnMap.png")}
						style={{ width: 180, height: 180 }}
					/>
				</View>
			</View>
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
	title: {
		fontSize: 32,
		textAlign: "center",
		color: "#537d8d",
		fontFamily: "bold",
	},
	feature: {
		flexDirection: "row",
		width: "100%",
		justifyContent: "space-between",
	},
	subTitle: {
		color: "#313334",
		fontFamily: "medium",
		fontSize: 28,
		flex: 1,
	},
	button: {
		bottom: 40,
		alignSelf: "center",
		position: "absolute",
	},
});

export default HowItWorks;
