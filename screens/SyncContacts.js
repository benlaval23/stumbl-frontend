// screens/SyncContacts.js
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import StepIndicator from "../components/StepIndicator";
import * as Contacts from "expo-contacts";
import { db, auth } from "../firebaseConfig";
import { setDoc, updateDoc, collection, getDoc, doc } from "firebase/firestore";
import CustomButton from "../components/CustomButton";


const SyncContacts = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

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
	}, [user]);

	const syncContacts = async () => {
		setLoading(true);
		const { status } = await Contacts.requestPermissionsAsync();
		if (status === "granted") {
			const { data } = await Contacts.getContactsAsync({});

			if (data.length > 0 && user) {
				const userRef = doc(db, "users", user.uid); // Reference to the user's document
				const contactsCollectionRef = collection(userRef, "contacts"); // Reference to the subcollection
				console.log("fetched contacts");

				// Iterate over the contacts and add each to the subcollection
				for (const contact of data) {
					const contactId = contact.id; // assuming that each contact has at least one phone number

					if (contactId) {
						// only proceed if we have an ID (phone number)
						const contactRef = doc(contactsCollectionRef, contactId); // Reference to the specific contact
						const contactSnap = await getDoc(contactRef);

						if (contactSnap.exists()) {
							// Contact exists, update it
							await updateDoc(contactRef, contact);
						} else {
							// Contact doesn't exist, add it
							await setDoc(contactRef, contact);
						}
					}
				}
			}
		}
		navigation.navigate("AllowLocation");
		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<StepIndicator totalSteps={4} currentStep={2} />
			<Text style={styles.title}>Sync Your Contacts</Text>
			<Image
				source={require("../assets/images/phoneContacts.png")}
				style={styles.image}
			/>
			<Text style={styles.subtitle}>
				Syncing your contacts allows Stumbl to know who you are connected with. Stumbl will never use thes contacts for anything other than establishing your connections. 
			</Text>
			<CustomButton
				loading={loading}
				style={styles.button}
				text='Sync Contacts'
				onPress={syncContacts}
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
		fontFamily: 'regular'
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

export default SyncContacts;
