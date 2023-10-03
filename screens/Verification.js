// screens/Verification.js
import React, { useState, useEffect } from "react";
import {
	View,
	AppState,
	Text,
	TextInput,
	Button,
	StyleSheet,
	KeyboardAvoidingView,
} from "react-native";
import { addDoc, collection, getDoc, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import CustomButton from "../components/CustomButton";
import * as Clipboard from "expo-clipboard";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";

import CustomTextInput from "../components/CustomTextInput";

const Verification = ({ navigation, route }) => {
	const [verificationCode, setVerificationCode] = useState("");
	const phoneNumber = route.params[0];
	const verificationId = route.params[1];
	const [loading, setLoading] = useState(false);

	const handleVerification = async () => {
		// Handle the verification logic here
		setLoading(true);
		console.log("verification id " + verificationId);

		try {
			const credential = PhoneAuthProvider.credential(
				verificationId,
				verificationCode
			);
			const userCredential = await signInWithCredential(auth, credential);
			const user = userCredential.user;

			// Check if user already exists in Firestore
			const userDoc = await getDoc(doc(db, "users", user.uid));
			if (!userDoc.exists()) {
				console.log("Adding user to DB");
				// If user does not exist, add them to Firestore
				await setDoc(doc(db, "users", user.uid), {
					uid: user.uid,
					name: "", // Default to an empty name, update later as necessary
					phoneNumber: user.phoneNumber,
					enabled: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					notificationSettings: {
						enabled: false,
						homeCountry: "",
						rules: {
							home: 5,
							abroad: 50,
						},
					},
					locationEnabled: false,
					exclusionList: [],
				});
			}

			console.log("verified");
			navigation.navigate("HowItWorks");
			setLoading(false);
		} catch (err) {
			// showMessage({ text: `Error: ${err.message}`, color: 'red' });
			console.log(err);
		}
		setLoading(false);
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
		>
			<Text style={styles.title}>Enter Verification Code</Text>
			<Text style={styles.subtitle}>
				We've sent a 6-digit code to you {phoneNumber}. Please enter it below.
			</Text>
			<Text style={styles.info}>Not received code? Resend in 40 seconds.</Text>
			<View style={styles.codeContainer}>
				<TextInput
					style={styles.input}
					placeholder='code'
					keyboardType='phone-pad'
					onChangeText={setVerificationCode}
					value={verificationCode}
					maxLength={6}
				/>
			</View>
			<CustomButton
				loading={loading}
				onPress={handleVerification}
				text='Verify'
			/>
		</KeyboardAvoidingView>
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
		fontSize: 24,
		textAlign: "center",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 30,
		color: "#666",
	},
	info: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 10,
		color: "#666",
	},
	input: {
		flex: 1,
		height: 60,
		minWidth: 200,
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		color: "#313334",
		textAlign: "center",
		fontSize: 24,
	},
	codeContainer: {
		alignItems: "center",
		justifyContent: "center",
		height: 60,
		marginTop: 20,
		marginBottom: 30,
	},
});

export default Verification;
