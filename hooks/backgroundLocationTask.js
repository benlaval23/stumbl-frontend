import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

const LOCATION_TASK_NAME = "background-location-task";

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }, ) => {
	if (error) {
		// Error occurred - check `error.message` for more details.
		return;
	}
	if (data) {
		const { locations } = data;
		console.log('location coords: '+locations);
	}
});

export const startBackgroundLocation = async (user) => {
	const { status: foregroundStatus } =
		await Location.requestForegroundPermissionsAsync();
	if (foregroundStatus === "granted") {
		const { status: backgroundStatus } =
			await Location.requestBackgroundPermissionsAsync();
		if (backgroundStatus === "granted") {
			await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
				accuracy: Location.Accuracy.Balanced,
				timeInterval: 5000, // One hour in milliseconds
				distanceInterval: 0, // Do not trigger based on distance changes
				showsBackgroundLocationIndicator: true,
			});
		}
	}
};

export const stopBackgroundLocation = async () => {
	await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};
