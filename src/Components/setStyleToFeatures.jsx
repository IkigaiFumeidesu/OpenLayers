import styleMouseCursorDraw from './styleMouseCursorDraw.jsx'
import styleMouseTipText from './styleMouseTipText.jsx'
import styleSegmentLabel from './styleSegmentLabel.jsx'
import styleLineStringLabel from './styleLineStringLabel.jsx'
import { getLength } from 'ol/sphere.js';
import { LineString, Point } from 'ol/geom.js';

// Function to set style to a drawn element
function setStyleToFeatures(geometryFeature, geometryType, textNextToCursor, conditionResult) {

    // stylesArray should always contain the cursor's style
    const stylesArray = [styleMouseCursorDraw];
    const segmentArray = [styleSegmentLabel];
    let linePoint, lineLabel, angleAzimuth, anglePoint, linesAngle, linesAnglePoint;

    // Function to push modified style into the stylesArray
    function setStyleToArray(style, point, label) {
        style.setGeometry(point);
        style.getText().setText(label);
        stylesArray.push(style);
    }

    // Get the type - Point / LineString and coords [x,y] / [[x][y], [x][y]] 
    const geometryCoords = geometryFeature.getCoordinates();

    // geometryType gets 2 inputs either Point or LineString
    if (geometryType === 'LineString') {

        // Getting LastCoord for lineLabel, lineLabel represents the measured distance, pushing corresponding style to stylesArray
        linePoint = new Point(geometryFeature.getLastCoordinate());
        lineLabel = lineLength(getLength(geometryFeature));
        setStyleToArray(styleLineStringLabel, linePoint, lineLabel);

        // Getting the Azimuth angle and getting the FirstCoord to display the AngleStyle there, pushing another style to stylesArray
        angleAzimuth = "Az " + calcAzimuthAngle(geometryCoords) + angleUnits.current;
        anglePoint = new Point(geometryFeature.getFirstCoordinate());
        setStyleToArray(styleLineStringLabel.clone(), anglePoint, angleAzimuth);

        let count = 0;
        // Link for this:
        // https://openlayers.org/en/latest/apidoc/module-ol_geom_LineString-LineString.html#forEachSegment
        // Iterating over each segment to get the length of each to be able to display it
        geometryFeature.forEachSegment((a, b) => {

            // Get first segment, construct a LineString and get its length
            const segment = new LineString([a, b]);
            const lineLabel = lineLength(getLength(segment));

            // Case of 1 segment: this will return false, because there is already a styleSegmentLabel present in the Array for me to work with (0 < 0)
            // Case of more segments: after the first iteration the segmentArray still has length of 1, aka it still has that same style which I already changed
            // Thats why I need a new style to be cloned into the Array so that I can perform the same methods on the new one and then push it into stylesArray
            if (segmentArray.length - 1 < count) {
                segmentArray.push(styleSegmentLabel.clone());
            }

            // Get a point in the middle of the segment to display the label with length data
            const segmentPoint = new Point(segment.getCoordinateAt(0.5));
            setStyleToArray(segmentArray[count], segmentPoint, lineLabel);
            count++;
        });

        // If there are more than 2 segments, its possible to calculate the angle between the 2 LineStrings
        if (geometryCoords.length > 2) {
            for (let i = 1; i < count; i++) {
                linesAngle = "A " + calcAngleBetweenLines(geometryCoords, i);
                linesAnglePoint = new Point(geometryCoords[i]);
                setStyleToArray(styleLineStringLabel.clone(), linesAnglePoint, linesAngle);
            }
        }
    }

    // Display the styleMouseTipText help message to the user, if they aren't modifying
    if (conditionResult) {
        setStyleToArray(styleMouseTipText, null, textNextToCursor);
    }
    return stylesArray;
}

export default setStyleToFeatures;

// Function to calculate and switch from one measurement unit to another
function lineLength(length) {
    let output;
    if (measurementUnits.current === "Km") {
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + ' Km';
        } else {
            output = Math.round(length * 100) / 100 + ' m';
        }
    } else {
        if (length > 100) {
            output = Math.round((length / 1000 * 1.609) * 100) / 100 + 'Miles';
        } else {
            output = Math.round(length * 39.3700787) + 'inch';
        }
    }
    return output;
}

// Function to calculate and return Azimuth in degrees or radians
function calcAzimuthAngle(coordinates) {

    // Calculate differences in coordinates
    const coordX = coordinates[1][0] - coordinates[0][0];
    const coordY = coordinates[1][1] - coordinates[0][1];

    // Calculate azimuth in radians then convert to degrees
    const azimuthRadians = Math.atan2(coordX, coordY);

    if (angleUnits.current === "Deg") {
        const azimuthDegrees = azimuthRadians * 180 / Math.PI;

        // Limit the azimuth to a specific range of [0, 360]
        return ((azimuthDegrees + 360) % 360).toFixed(2);
    } else {
        return ((azimuthRadians + 2 * Math.PI) % (2 * Math.PI)).toFixed(2);
    }
}

// Function to calculate the angle between any two lines, using the azimuth
function calcAngleBetweenLines(coordinates, i) {

    // Get the azimuth for start-shared coords and finish-shared coords
    const azimuthFirstLine = calcAzimuthAngle([coordinates[i], coordinates[i - 1]]);
    const azimuthSecondLine = calcAzimuthAngle([coordinates[i], coordinates[i + 1]]);
    let resultingAngle = Math.abs(azimuthFirstLine - azimuthSecondLine);

    // The angle cannot be more than 180 degrees, to account for this:
    if (angleUnits.current === "Deg") {
        resultingAngle > 180 && (resultingAngle = 360 - resultingAngle);
    } else {
        resultingAngle > Math.PI && (resultingAngle = 2 * Math.PI - resultingAngle);
    }
    return resultingAngle.toFixed(2) + angleUnits.current;
}