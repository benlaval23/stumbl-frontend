// screens/Verification.js
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	Image,
	StyleSheet,
	KeyboardAvoidingView,
} from "react-native";
import { auth, functions } from "../firebaseConfig";
import CustomButton from "../components/CustomButton";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

const addUser = httpsCallable(functions, "addUser");

const Verification = ({ navigation, route }) => {
	const [verificationCode, setVerificationCode] = useState("");
	const phoneNumber = route.params[0];
	const verificationId = route.params[1];
	const [loading, setLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleVerification = async () => {
		setLoading(true);

		try {
			const credential = PhoneAuthProvider.credential(
				verificationId,
				verificationCode
			);
			const userCredential = await signInWithCredential(auth, credential);
			const user = userCredential.user;

			await addUser({
				uid: user.uid,
				name: "",
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
			})
				.then((result) => {
					const data = result.data;
					const success = data.success;

					if (success) {
						console.log(data.message);
						navigation.navigate("SyncContacts");
						setLoading(false);
					} else {
						setIsError(true);
						setErrorMessage("Error signing in user (code:2): ", data.message);
						console.log(data.message);
						setLoading(false);
					}
				})
				.catch((error) => {
					setIsError(true);
					setErrorMessage("Error signing in user (code:1): ", error);
					setLoading(false);
				});
		} catch (err) {
			console.log(err);
			setIsError(true);
			setErrorMessage("Incorrect code");
			setLoading(false);
		}
		setLoading(false);
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior='position'
			keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 20}
		>
			<Text style={styles.title}>Verify</Text>
			<Image
				source={require("../assets/images/3PeopleTalking.png")}
				style={styles.image}
			/>
			<Text style={styles.subtitle}>
				We've sent a 6-digit code to you {phoneNumber}. Please enter it below.
			</Text>
			<Text style={styles.info}>Not received code? Resend in 40 seconds.</Text>
			<View style={styles.codeContainer}>
				<TextInput
					style={
						isError & (errorMessage === "Incorrect code")
							? [styles.input, styles.errorStyle]
							: styles.input
					}
					placeholder='000000'
					keyboardType='phone-pad'
					onChangeText={setVerificationCode}
					value={verificationCode}
					maxLength={6}
				/>
			</View>
			<View style={{ marginLeft: 16, marginRight: 16 }}>
				<CustomButton
					loading={loading}
					onPress={handleVerification}
					text='Verify'
				/>
				{isError && <Text style={styles.warningText}>{errorMessage}</Text>}
			</View>
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
		fontSize: 32,
		textAlign: "center",
		marginBottom: 10,
		color: "#537d8d",
		fontFamily: "bold",
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 30,
		color: "#666",
		fontFamily: "regular",
	},
	info: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 10,
		color: "#666",
		fontFamily: "regular",
	},
	input: {
		height: 60,
		minWidth: "100%",
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		color: "#313334",
		textAlign: "center",
		fontSize: 18,
		fontFamily: "regular",
	},
	codeContainer: {
		alignItems: "center",
		justifyContent: "center",
		height: 60,
		width: "100%",
		margin: 20,
	},
	errorStyle: {
		borderWidth: 1,
		borderColor: "#D15859",
	},
	warningText: {
		color: "#D15859",
		marginTop: 10,
		fontSize: 14,
		textAlign: "center",
	},
	image: {
		width: 380,
		height: 300,
		marginBottom: 20,
	},
});

export default Verification;
