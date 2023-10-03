// hooks/useLoadFonts.js
import { useFonts } from "@expo-google-fonts/dev";

export const useLoadFonts = () => {
	let [fontsLoaded] = useFonts({
		bold: require("../assets/fonts/Overpass-Bold.ttf"),
		medium: require("../assets/fonts/Overpass-Medium.ttf"),
		thin: require("../assets/fonts/Overpass-Thin.ttf"),
		regular: require("../assets/fonts/Overpass-Regular.ttf"),
		light: require("../assets/fonts/Overpass-Light.ttf"),
		extraBold: require("../assets/fonts/Overpass-ExtraBold.ttf"),
		black: require("../assets/fonts/Overpass-Black.ttf"),
	});

	return fontsLoaded;
};
