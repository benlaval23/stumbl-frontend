import React from "react";
import { Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import "./firebaseConfig";
import { useLoadFonts } from './hooks/useLoadFonts';


export default function App() {
	const fontsLoaded = useLoadFonts();

	if (!fontsLoaded) {
		return <View><Text>Loading...</Text></View>;
	  }
	
	return (
		<NavigationContainer>
			<AppNavigator />
		</NavigationContainer>
	);
}
