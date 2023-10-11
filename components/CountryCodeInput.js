import React, { useState } from "react";
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	View,
	TextInput,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";

const CountryCodeInput = ({ value, onChange }) => {
	const [show, setShow] = useState(false);
	const [flag, setFlag] = useState("🇬🇧");

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() => setShow(true)}
				style={styles.countryCodeInput}
			>
				<Text style={styles.text}>
					{flag} {value}
				</Text>
			</TouchableOpacity>
			<CountryPicker
				style={styles.draw}
				show={show}
				// when picker button press you will get the country object with dial code
				pickerButtonOnPress={(item) => {
					// setCountryCode(item.dial_code);
					setShow(false);
					setFlag(item.flag);
					if (onChange) {
						onChange(item.dial_code); // Notify parent component of the change.
					}
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 2,
		minWidth: 50,
	},
	countryCodeInput: {
		width: "100%",
		height: 60,
		backgroundColor: "#f0f0f0",
		padding: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",

	},
	text: {
		fontFamily: "regular",
		fontSize: 18,	
		color: "#313334",

	},
	draw: {
		modal: {
			height: "90%",
		},
	},
});

export default CountryCodeInput;
