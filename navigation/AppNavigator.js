// navigation/AppNavigator.js
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SignUp from "../screens/SignUp";
import Verification from "../screens/Verification";
import HowItWorks from "../screens/HowItWorks";
import SyncContacts from "../screens/SyncContacts";
import SyncInstagram from "../screens/SyncInstagram";
import ProfileSetup from "../screens/ProfileSetup";
import Home from "../screens/Home";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Stack = createStackNavigator();

const AppNavigator = () => {
	const [user, setUser] = useState(User);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			console.log("user " + user);
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	return (
		<Stack.Navigator initialRouteName='SignUp'>
			{user ? (
				<>
					<Stack.Screen
						name='HowItWorks'
						component={HowItWorks}
						options={{ title: "How Re-connect Works" }}
					/>
					<Stack.Screen
						name='SyncContacts'
						component={SyncContacts}
						options={{ title: "Sync Contacts" }}
					/>
					<Stack.Screen
						name='SyncInstagram'
						component={SyncInstagram}
						options={{ title: "Sync Instagram Contacts" }}
					/>
					<Stack.Screen
						name='ProfileSetup'
						component={ProfileSetup}
						options={{ title: "Profile Setup" }}
					/>
					<Stack.Screen
						name='Home'
						component={Home}
						options={{ title: "Home" }}
					/>
				</>
			) : (
				<>
					<Stack.Screen
						name='SignUp'
						component={SignUp}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name='Verification'
						component={Verification}
						options={{ title: "Verify Phone" }}
					/>
				</>
			)}
		</Stack.Navigator>
	);
};

export default AppNavigator;
