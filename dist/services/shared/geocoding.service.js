"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingService = void 0;
const axios_1 = __importDefault(require("axios"));
class GeocodingService {
    static async geocodeAddress(address) {
        try {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.warn('GOOGLE_MAPS_API_KEY not configured, geocoding disabled');
                return null;
            }
            const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address,
                    key: apiKey
                }
            });
            if (response.data.results.length === 0) {
                throw new Error('Address not found');
            }
            const result = response.data.results[0];
            const { lat, lng } = result.geometry.location;
            const addressComponents = result.address_components;
            let city, state, country, postalCode;
            for (const component of addressComponents) {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
                if (component.types.includes('country')) {
                    country = component.long_name;
                }
                if (component.types.includes('postal_code')) {
                    postalCode = component.long_name;
                }
            }
            return {
                latitude: lat,
                longitude: lng,
                formattedAddress: result.formatted_address,
                city,
                state,
                country,
                postalCode
            };
        }
        catch (error) {
            console.error('Geocoding error:', error.message);
            return null;
        }
    }
    static async reverseGeocode(latitude, longitude) {
        try {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                return null;
            }
            const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    latlng: `${latitude},${longitude}`,
                    key: apiKey
                }
            });
            if (response.data.results.length === 0) {
                return null;
            }
            return response.data.results[0].formatted_address;
        }
        catch (error) {
            console.error('Reverse geocoding error:', error.message);
            return null;
        }
    }
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
                Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}
exports.GeocodingService = GeocodingService;
//# sourceMappingURL=geocoding.service.js.map