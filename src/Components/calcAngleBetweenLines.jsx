import calcAzimuthAngle from "./calcAzimuthAngle";

// Function to calculate the angle between any two lines, using the azimuth
function calcAngleBetweenLines(coordinates, i, passedAngleUnits) {

    // Get the azimuth for start-shared coords and finish-shared coords
    const azimuthFirstLine = calcAzimuthAngle([coordinates[i], coordinates[i - 1]]);
    const azimuthSecondLine = calcAzimuthAngle([coordinates[i], coordinates[i + 1]]);
    let resultingAngle = Math.abs(azimuthFirstLine - azimuthSecondLine);

    // The angle cannot be more than 180 degrees, to account for this:
    if (passedAngleUnits === "Deg") {
        resultingAngle > 180 && (resultingAngle = 360 - resultingAngle);
    } else {
        resultingAngle > Math.PI && (resultingAngle = 2 * Math.PI - resultingAngle);
    }
    return resultingAngle.toFixed(2) + passedAngleUnits;
}

export default calcAngleBetweenLines;