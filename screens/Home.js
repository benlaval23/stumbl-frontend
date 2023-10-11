// screens/HowItWorks.js
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";

const Home = ({ navigation }) => {
	const [user, setUser] = useState(null);
	const [connectionDistance, setConnectionDistance] = useState();

	const handleSignOut = () => {
		auth
			.signOut()
			.then(() => {
				navigation.replace("SignUp");
			})
			.catch((error) => alert.apply(error.message));
	};

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

	useEffect(() => {
		if (
			user &&
			user.notificationSettings &&
			user.notificationSettings.rules &&
			user.notificationSettings.rules.home
		) {
			setConnectionDistance(user.notificationSettings.rules.home);
		}
	}, [user]);

	return (
		<View style={styles.container}>
			<View style={styles.topBar}>
				<Text style={styles.topBarText}>{auth.currentUser?.phoneNumber} </Text>
				<TouchableOpacity onPress={handleSignOut}>
					<Ionicons name='log-out-outline' size={24} color='white' />
				</TouchableOpacity>
			</View>

			<View style={styles.icon}>
				<Ionicons name='notifications' size={180} color='#D15859' />
				<Text style={styles.status}>
					You'll be notified when contacts are {connectionDistance}km
					from you.
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#313334",
	},
	topBarText: {
		color: "white",
		fontFamily: "regular",
		fontSize: 18,
	},
	icon: {
		alignSelf: "center",
		alignItems: "center",
		marginTop: "30%",
		justifySelf: "center",
	},
	status: {
		color: "white",
		maxWidth: "80%",
		textAlign: "center",
		alignSelf: "center",
		fontFamily: "regular",
		fontSize: 24,
		marginTop: 10,
	},
	topBar: {
		height: 80,
		flexDirection: "row",
		padding: 24,
		alignItems: "center",
		justifyContent: "space-between",
	},
});

export default Home;
