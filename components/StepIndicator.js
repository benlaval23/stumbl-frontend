import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;

const StepIndicator = ({ totalSteps, currentStep }) => {
	return (
		<View style={styles.container}>
			{[...Array(totalSteps)].map((_, index) => (
				<View
					key={index}
					style={[
						styles.bar,
						index + 1 === currentStep ? styles.activeBar : null,
					]}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		position: "absolute",
		top: 10,
		left: 0,
		right: 0,
		paddingHorizontal: 8, // Adjust padding as necessary
		backgroundColor: "white",
		zIndex: 1,
	},
	bar: {
		flex: 1,
		height: 4,
		marginHorizontal: 4,
		backgroundColor: "#ccc",
	},
	activeBar: {
		backgroundColor: "#444",
	},
});

export default StepIndicator;
