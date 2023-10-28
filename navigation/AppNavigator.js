// navigation/AppNavigator.js
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SignUp from "../screens/SignUp";
import Verification from "../screens/Verification";
import SyncContacts from "../screens/SyncContacts";
import AllowLocation from "../screens/AllowLocation";
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
					{/* <Stack.Screen
						name='HowItWorks'
						component={HowItWorks}
						options={{ title: "How Re-connect Works" }}
					/> */}
					<Stack.Screen
						name='SyncContacts'
						component={SyncContacts}
						options={{ title: "Contacts" }}
					/>
					<Stack.Screen
						name='AllowLocation'
						component={AllowLocation}
						options={{ title: "Location" }}
					/>
					<Stack.Screen
						name='ProfileSetup'
						component={ProfileSetup}
						options={{ title: "Setup" }}
					/>
					<Stack.Screen
						name='Home'
						component={Home}
						options={{headerLeft: null}}
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
