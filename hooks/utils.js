import { parsePhoneNumberFromString } from 'libphonenumber-js';


export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    return distance;
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}


export function normalizePhoneNumber(number) {
    const phoneNumber = parsePhoneNumberFromString(number);
    if (!phoneNumber) {
        return null; // Or handle invalid numbers as you see fit
    }
    return phoneNumber.formatInternational(); // Or format it as E.164 or whatever you prefer
}