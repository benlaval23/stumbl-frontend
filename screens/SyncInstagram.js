// screens/SyncInstagram.js
import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import StepIndicator from "../components/StepIndicator";
import CustomButton from "../components/CustomButton";
import RNKeyboardAvoidingView from "../components/RNKeyboardAvoidingView";

import {
	SafeAreaView,
	SafeAreaProvider,
	SafeAreaInsetsContext,
	useSafeAreaInsets,
} from "react-native-safe-area-context";

const SyncInstagram = ({ navigation }) => {
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.safeArea}>
			<RNKeyboardAvoidingView style={styles.avoidingView}>
				<StepIndicator totalSteps={4} currentStep={3} />
				<View style={styles.titelContainer}>
					<Text style={styles.title}>Sync Your Contacts</Text>
				</View>
				<View style={{ flex: 1 }}></View>
				<View style={styles.buttonContainer}>
					<CustomButton
						// loading={loading}
						style={styles.button}
						text='Sync Contacts'
						onPress={() => navigation.navigate("ProfileSetup")}
					/>
				</View>
				<TextInput placeholder='Phone Number'
					keyboardType='phone-pad'/>
			</RNKeyboardAvoidingView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "white",
	},
	avoidingView: {
		paddingHorizontal: 24,
		paddingTop: 10,
		flex: 1,
	},
	titelContainer: {
		padding: 20,
	},
	title: {
		fontFamily: "bold",
		fontSize: 32,
		color: "#313334",
	},
	buttonContainer: {
		paddingBottom: 0,
	},
});

export default SyncInstagram;
