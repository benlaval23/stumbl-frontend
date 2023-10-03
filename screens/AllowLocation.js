// screens/SyncInstagram.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import StepIndicator from "../components/StepIndicator";
import CustomButton from "../components/CustomButton";
import RNKeyboardAvoidingView from "../components/RNKeyboardAvoidingView";
import { startBackgroundLocation, stopBackgroundLocation } from '../hooks/backgroundLocationTask';
import { db, auth } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";

const SyncInstagram = ({ navigation }) => {
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
	}, []);
	

	const handleLocationEnableRequest = () => {
		setLoading(true)
		startBackgroundLocation(user);
		navigation.navigate("ProfileSetup")
		setLoading(false)
	}

	return (
		<View style={styles.container}>
			{/* <Modal
				animationType='none'
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => navigation.navigate("SyncInstagram")}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Text>Contacts are now synced</Text>
						<View style={styles.buttonsContainer}>
							<Button
								title='Great'
								onPress={() => {
									setLoading(false);
									setModalVisible(false);
									navigation.navigate("SyncInstagram");
								}}
							/>
						</View>
					</View>
				</View>
			</Modal> */}
			<StepIndicator totalSteps={4} currentStep={3} />
			<Text style={styles.title}>Location Permissions</Text>

			<Image
				source={require("../assets/images/locationIconOnMap.png")}
				style={styles.image}
			/>
			<Text style={styles.subtitle}>
				Allowing location permissions allows Stumble to notify you when one of your contacts are nearby.
			</Text>
			<CustomButton
				loading={loading}
				style={styles.button}
				text='Give Location Permissios'
				onPress={handleLocationEnableRequest}
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
	modalView: {
		width: 300,
		padding: 20,
		backgroundColor: "white",
		borderRadius: 8,
		elevation: 5, // Android shadow
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
