// screens/SyncContacts.js
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import StepIndicator from "../components/StepIndicator";
import * as Contacts from "expo-contacts";
import { auth, functions } from "../firebaseConfig";
import CustomButton from "../components/CustomButton";
import { httpsCallable } from "firebase/functions";

const replaceUserContacts = httpsCallable(functions, "replaceUserContacts");
const getUser = httpsCallable(functions, "getUser");

const SyncContacts = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await getUser({ userId: auth.currentUser?.uid });
				const userData = response.data.data;

				if (userData) {
					setUser(userData);
				} else {
					console.log("No user: ", response.message);
				}
			} catch (error) {
				console.error("Error fetching user:", error);
			}
		};

		fetchUserData();
	}, []);

	const syncContacts = async () => {
		setLoading(true);
		const { status } = await Contacts.requestPermissionsAsync();
		if (status === "granted") {
			const { data } = await Contacts.getContactsAsync({});
			if (data.length > 0 && user) {
				await replaceUserContacts({ userId: user.uid, contacts: data })
					.then((result) => {
						const data = result.data;
						const success = data.success;

						if (success) {
							console.log(data.message);
							navigation.navigate("AllowLocation");
							setLoading(false);
						} else {
							setIsError(true);
							console.log(data.message);
							setLoading(false);
						}
					})
					.catch((error) => {
						setIsError(true);
						console.log(error);
						setLoading(false);
					});
			}
		} else {
			setIsError(true);
			setErrorMessage("Permission to access contacts was denied");
		}
		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<StepIndicator totalSteps={3} currentStep={1} />
			<Text style={styles.title}>Sync Your Contacts</Text>
			<Image
				source={require("../assets/images/phoneContacts.png")}
				style={styles.image}
			/>
			<Text style={styles.subtitle}>
				Syncing your contacts allows Stumbl to know who you are connected with.
				Stumbl will never use thes contacts for anything other than establishing
				your connections.
			</Text>
			<CustomButton
				loading={loading}
				style={styles.button}
				text='Sync Contacts'
				onPress={syncContacts}
			/>
			{isError && <Text style={styles.warningText}>{errorMessage}</Text>}
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
		backgroundColor: "rgba(0,0,0,0.4)",
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
	warningText: {
		color: "#D15859",
		marginTop: 10,
		fontSize: 14,
		textAlign: "center",
	},
});

export default SyncContacts;
