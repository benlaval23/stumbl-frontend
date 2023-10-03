import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Button,
	Image,
	KeyboardAvoidingView,
	TurboModuleRegistry,
} from "react-native";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, app } from "../firebaseConfig";
import CustomButton from "../components/CustomButton";
import CountryCodeInput from "../components/CountryCodeInput";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import {
	FirebaseRecaptchaVerifierModal,
	FirebaseRecaptchaBanner,
} from "expo-firebase-recaptcha";

// import { signInWithPhoneNumber } from "firebase/auth";

const SignUp = ({ navigation }) => {
	const [phoneNumber, setPhoneNumber] = useState("16505553434");
	const [countryCode, setCountryCode] = useState("+1");
	const [isInvalid, setIsInvalid] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const recaptchaVerifier = useRef(null);
	const [verificationId, setVerificationId] = useState();

	// useEffect(() => {
	//     if (auth.currentUser) {
	//         navigation.navigate('HowItWorks');
	//     }
	//   }, []);

	const handleSignUp = async () => {
		setLoading(true);

		if (!isValidNumberInput(phoneNumber)) {
			setErrorMessage("Invalid phone number format.");
			console.error(errorMessage);
			setIsInvalid(true);
			return;
		} else {
			setIsInvalid(false);
		}

		let sanitizedNumber = sanitizeInput(phoneNumber);

		if (countryCode === "+44" && !isValidUkNumber(sanitizedNumber)) {
			setErrorMessage("Invalid UK phone number length.");
			console.error(errorMessage);
			setIsInvalid(true);
			return;
		} else {
			setIsInvalid(false);
		}

		sanitizedNumber =
			countryCode === "+44"
				? removeStartingZero(sanitizedNumber)
				: sanitizedNumber;
		const fullPhoneNumber = countryCode + sanitizedNumber;

		try {
			const phoneProvider = new PhoneAuthProvider(auth);
			const verificationId = await phoneProvider.verifyPhoneNumber(
				fullPhoneNumber,
				recaptchaVerifier.current
			);
			setVerificationId(verificationId);
			// showMessage({
			//   text: 'Verification code has been sent to your phone.',
			// });
			console.log("sent code to " + fullPhoneNumber);
			console.log("verficiation id " + verificationId);
			navigation.navigate("Verification", [fullPhoneNumber, verificationId]);
		} catch (err) {
			// showMessage({ text: `Error: ${err.message}`, color: 'red' });
			console.log(err);
		}
		setLoading(false);
	};

	const onChange = (value) => {
		setCountryCode(value);
	};

	const isValidNumberInput = (number) => /^[0-9\s]*$/.test(number);
	const sanitizeInput = (number) => number.replace(/\s/g, "");
	const isValidUkNumber = (number) => {
		if (number.length === 10) return true;
		if (number.length === 11 && number.startsWith("0")) return true;
		return false;
	};

	const removeStartingZero = (number) => {
		return number.startsWith("0") ? number.slice(1) : number;
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
		>
			<Text style={styles.title}>Sign up to Stumbl</Text>
			<Image
				source={require("../assets/images/womanWithLocationIcons.png")}
				style={styles.image}
			/>

			<View style={styles.phoneContainer}>
				<CountryCodeInput value={countryCode} onChange={onChange} />
				<TextInput
					style={
						isInvalid
							? [styles.phoneInput, styles.errorStyle]
							: styles.phoneInput
					}
					placeholder='Phone Number'
					keyboardType='phone-pad'
					onChangeText={setPhoneNumber}
					value={phoneNumber}
				/>
			</View>
			<CustomButton
				loading={loading}
				id='sign-in-button'
				onPress={handleSignUp}
				text='Sign Up'
			/>
			{isInvalid && <Text style={styles.warningText}>{errorMessage}</Text>}
			<View style={styles.captcha}>
				<FirebaseRecaptchaVerifierModal
					ref={recaptchaVerifier}
					firebaseConfig={app.options}
					attemptInvisibleVerification={true}
				/>
				<FirebaseRecaptchaBanner />
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
	image: {
		width: 380,
		height: 300,
		marginBottom: 16,
	},
	title: {
		fontSize: 24,
		textAlign: "center",
		marginBottom: 20,
		color: "#313334",
		fontWeight: "bold",
	},
	phoneContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		margin: 20,
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
	errorStyle: {
		borderWidth: 1,
		borderColor: "#D15859",
	},
	warningText: {
		color: "#D15859",
		marginTop: 10,
		fontSize: 12,
	},
	captcha: {
		margin: 8,
		alignSelf: "center",
		textAlign: "center",
		alignContent: "center",
		alignItems: "center",
		justifyContent: "center",
	},
	KeyboardAvoidingView: {
		// flex: 1,
		// justifyContent: 'center',
		// paddingHorizontal: 20,
	},
});

export default SignUp;
