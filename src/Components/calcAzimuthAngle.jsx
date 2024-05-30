// Function to calculate and return Azimuth in degrees or radians
function calcAzimuthAngle(coordinates, passedAngleUnits) {

    // Calculate differences in coordinates
    const coordX = coordinates[1][0] - coordinates[0][0];
    const coordY = coordinates[1][1] - coordinates[0][1];

    // Calculate azimuth in radians then convert to degrees
    const azimuthRadians = Math.atan2(coordX, coordY);

    if (passedAngleUnits === "Deg") {
        const azimuthDegrees = azimuthRadians * 180 / Math.PI;

        // Limit the azimuth to a specific range of [0, 360]
        return ((azimuthDegrees + 360) % 360).toFixed(2);
    } else {
        return ((azimuthRadians + 2 * Math.PI) % (2 * Math.PI)).toFixed(2);
    }
}
export default calcAzimuthAngle;