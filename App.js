import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import "./firebaseConfig";

export default function App() {
	return (
		<NavigationContainer>
			<AppNavigator />
		</NavigationContainer>
	);
}
