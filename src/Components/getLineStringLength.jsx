// Function to calculate and switch from one measurement unit to another
function getLineStringLength(length, passedMeasureUnits) {
    let calcDistance;

    // Basic unit of the map is in meters 
    if (passedMeasureUnits === "Km") {
        if (length > 100) {

            // E.g length = 2024787.2m / 1000 = 2024.7872Km, * 100 for rounding it (202478.72), and then dividing by 100 to put the decimal point back (2024.79Km)
            calcDistance = Math.round((length / 1000) * 100) / 100 + ' Km';
        } else {

            // In case the length is less, I will just round it and return it
            calcDistance = Math.round(length * 100) / 100 + ' m';
        }
    } else {
        if (length > 100) {

            // The logic is the same, but with an extra step, when I have the value of Kms, I need to convert it to Miles (* 1.609) and then just round it
            calcDistance = Math.round((length / 1000 * 1.609) * 100) / 100 + 'Miles';
        } else {

            // For inches conversion meters are used (* 39.37..) and then round them up
            calcDistance = Math.round(length * 100 * 39.3700787) / 100 + 'inch';
        }
    }
    return calcDistance;
}

export default getLineStringLength;