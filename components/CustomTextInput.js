import React, { useState } from "react";
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	View,
	TextInput,
} from "react-native";

const CustomTextInput = () => {
	return (
		<TextInput
			style={styles.input}
			placeholder='Phone Number'
			keyboardType='phone-pad'
			onChangeText={setPhoneNumber}
			value={phoneNumber}
		/>
	);
};

const styles = StyleSheet.create({
	input: {
		width: "70%",
		height: 50,
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		color: "#313334",
		fontSize: 16,
	},
});

export default CustomTextInput;
