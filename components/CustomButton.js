import React from "react";
import {
	TouchableOpacity,
	Text,
	ActivityIndicator,
	StyleSheet,
} from "react-native";

const CustomButton = ({ id, text, onPress, style, textStyle, loading }) => {
	return (
		<TouchableOpacity style={[styles.button, style]} id={id} onPress={onPress}>
			{loading ? (
				<ActivityIndicator size='small' color='#FFFFFF' />
			) : (
				<Text style={[styles.text, textStyle]}>{text}</Text>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#D15859",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		height: 60,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		color: "#FFFFFF",
		fontSize: 20,
		fontWeight: "600",
		fontFamily: 'medium',
	},
});

export default CustomButton;
