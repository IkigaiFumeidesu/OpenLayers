import styleMouseCursorDraw from './styleMouseCursorDraw.jsx'
import styleMouseTipText from './styleMouseTipText.jsx'
import styleSegmentLabel from './styleSegmentLabel.jsx'
import styleLineStringLabel from './styleLineStringLabel.jsx'
import { getLength } from 'ol/sphere.js';
import { LineString, Point } from 'ol/geom.js';
import getLineStringLength from './getLineStringLength.jsx';
import calcAzimuthAngle from './calcAzimuthAngle.jsx';

// Function to set style to a drawn element
function setStyleToFeatures(geometryFeature, geometryType, textNextToCursor, conditionResult, passedMeasureUnits, passedAngleUnits) {

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

    // Get the coords [x,y] / [[x][y], [x][y]] 
    const geometryCoords = geometryFeature.getCoordinates();

    // geometryType gets 2 inputs either Point or LineString
    if (geometryType === 'LineString') {

        // Getting LastCoord for lineLabel, lineLabel represents the measured distance, pushing corresponding style to stylesArray
        linePoint = new Point(geometryFeature.getLastCoordinate());
        lineLabel = getLineStringLength(getLength(geometryFeature), passedMeasureUnits);
        setStyleToArray(styleLineStringLabel, linePoint, lineLabel);

        // Getting the Azimuth angle and getting the FirstCoord to display the AngleStyle there, pushing another style to stylesArray
        angleAzimuth = "Az " + calcAzimuthAngle(geometryCoords, passedAngleUnits) + passedAngleUnits;
        anglePoint = new Point(geometryFeature.getFirstCoordinate());
        setStyleToArray(styleLineStringLabel.clone(), anglePoint, angleAzimuth);

        let count = 0;
        // Link for this:
        // https://openlayers.org/en/latest/apidoc/module-ol_geom_LineString-LineString.html#forEachSegment
        // Iterating over each segment to get the length of each to be able to display it
        geometryFeature.forEachSegment((a, b) => {

            // Get first segment, construct a LineString and get its length
            const segment = new LineString([a, b]);
            const lineLabel = getLineStringLength(getLength(segment), passedMeasureUnits);

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
                linesAngle = "A " + calcAngleBetweenLines(geometryCoords, i, passedAngleUnits);
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