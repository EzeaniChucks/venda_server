import axios from 'axios';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export class GeocodingService {
  /**
   * Geocode an address using Google Maps API
   */
  static async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn('GOOGLE_MAPS_API_KEY not configured, geocoding disabled');
        return null;
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
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

      // Extract address components
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
    } catch (error: any) {
      console.error('Geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        return null;
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${latitude},${longitude}`,
          key: apiKey
        }
      });

      if (response.data.results.length === 0) {
        return null;
      }

      return response.data.results[0].formatted_address;
    } catch (error: any) {
      console.error('Reverse geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Calculate distance between two points (in kilometers)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
