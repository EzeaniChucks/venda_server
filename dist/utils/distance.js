"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceCalculator = void 0;
class DistanceCalculator {
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = this.EARTH_RADIUS_KM * c;
        return Math.round(distance * 100) / 100;
    }
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    static isWithinRadius(lat1, lon1, lat2, lon2, radiusKm) {
        const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
        return distance <= radiusKm;
    }
    static formatDistance(distanceKm) {
        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)}m`;
        }
        return `${distanceKm.toFixed(1)}km`;
    }
}
exports.DistanceCalculator = DistanceCalculator;
DistanceCalculator.EARTH_RADIUS_KM = 6371;
//# sourceMappingURL=distance.js.map