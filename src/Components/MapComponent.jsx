import React from 'react';
import { useEffect, useState, useRef } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { getLength } from 'ol/sphere.js';
import { LineString, Point } from 'ol/geom.js';
import XYZ from 'ol/source/XYZ.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import token from '../../token.js'
import Feature from 'ol/Feature.js';
import { fromLonLat } from 'ol/proj';
import mouseCursorDrawStyle from './mouseCursorDrawStyle.jsx'
import mouseCursorModifyStyle from './mouseCursorModifyStyle.jsx'
import mouseTipTextStyle from './mouseTipTextStyle.jsx'
import geometrySegmentStyle from './geometrySegmentStyle.jsx'
import lineLengthLabelStyle from './lineLengthLabelStyle.jsx'

function MapComponent() {

    const [initialURL, setURL] = useState(false);

    // User switching the Units 
    const measurementUnits = useRef("Km");
    const angleUnits = useRef("Deg");

    // Instead of using states I am using refs to not erase the features
    const drawRef = useRef(null);
    const uploadRef = useRef(null);

    // Usage of refs assigned to divs which contains forms, making them visible, or hiding and creating focus
    const toggleVisibility = (clickedButton, which) => {
        clickedButton.current.style.display === 'none' ? clickedButton.current.style.display = 'block' : clickedButton.current.style.display = 'none';
        which ? document.getElementById("x-coord").focus() : document.getElementById("input-url").focus();
    };

    // Function to remove the very last drawn feature by the user
    function removeLastFeature() {
        sourceVector.removeFeature(sourceVector.getFeatures()[sourceVector.getFeatures().length - 1]);
    }

    // Function to take input from user and create a new layer and update the state
    function createNewLayer(e) {

        // prevent the form from refreshing the site
        e.preventDefault();

        // Getting the entry from the user
        const dataFromInput = e.target;
        const dataForm = new FormData(dataFromInput);
        const objectForm = Object.fromEntries(dataForm.entries());

        // Creating a new layer through the submitted input and hiding the form
        setURL(objectForm.url + "?apikey=" + token);
        toggleVisibility(uploadRef);
    }

    function addUserDrawing(e) {

        // Prevent the form from refreshing the site
        e.preventDefault();

        // Getting the entry from the user
        const dataFromInput = e.target;
        const dataForm = new FormData(dataFromInput);
        const objectInput = Object.fromEntries(dataForm.entries());

        // In case the submitted coordinates are in decimals but coming from degrees I need to transform them to Mercatory projection
        const transformedArray = fromLonLat([objectInput.xcoord1, objectInput.ycoord1], 'EPSG:3857')
        const inputFeature = new Feature({
            geometry: new Point(transformedArray),
        });
        sourceVector.addFeature(inputFeature);
        /*
            The above code is unfinished, it currently can show the user a point if they fill out the first coordinate's inputs.
            How would I continue with this:

            1. I would add a select option into the form to see which units the user chooses to submit the coordinates in
            2. Then I would expand the objectInput to take into account the change made in first point
            3. Create an if-statemenet to handle different units to transform them into Mercatory coordinates to be able to work with them later
            4. If the user chooses to submit azimuth and length instead of submitting a second round of coordinates, then I would make a function to reverse calculate the coordinates
            5. With the array of coordinates I would then pass them into new LineString, defining geometry and adding style, via styleFunction, passing the coordinates as params.
            6. add this made feature into the sourceVector layer

            If by any chance the user were to create a polyline instead, I would probably do some kind of simple crud app to handle all the inputs in one go
        */
    }

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

    // Function to set style to a drawn element
    function styleFunction(feature, tip) {

        // stylesArray should always contain the cursor's style
        const stylesArray = [mouseCursorDrawStyle];
        const segmentArray = [geometrySegmentStyle];
        let linePoint, lineLabel, angleAzimuth, anglePoint, linesAngle, linesAnglePoint;

        // Function to push style into the stylesArray
        function setStyleToArray(style, point, label) {
            style.setGeometry(point);
            style.getText().setText(label);
            stylesArray.push(style);
        }

        // Get the type - Point / LineString and coords [x,y] / [[x][y], [x][y]] 
        const featureGeometry = feature.getGeometry();
        const geometryType = featureGeometry.getType();
        const geometryCoords = featureGeometry.getCoordinates();

        // geometryType gets 2 inputs either Point or LineString
        if (geometryType === 'LineString') {

            // Getting LastCoord for lineLabel, lineLabel represents the measured distance, pushing corresponding style to stylesArray
            linePoint = new Point(featureGeometry.getLastCoordinate());
            lineLabel = lineLength(getLength(featureGeometry));
            setStyleToArray(lineLengthLabelStyle, linePoint, lineLabel);

            // Getting the Azimuth angle and getting the FirstCoord to display the AngleStyle there, pushing another style to stylesArray
            angleAzimuth = "Az " + calcAzimuthAngle(geometryCoords) + angleUnits.current;
            anglePoint = new Point(featureGeometry.getFirstCoordinate());
            setStyleToArray(lineLengthLabelStyle.clone(), anglePoint, angleAzimuth);

            let count = 0;
            // Link for this:
            // https://openlayers.org/en/latest/apidoc/module-ol_geom_LineString-LineString.html#forEachSegment
            // Iterating over each segment to get the length of each to be able to display it
            featureGeometry.forEachSegment((a, b) => {

                // Get first segment, construct a LineString and get its length
                const segment = new LineString([a, b]);
                const lineLabel = lineLength(getLength(segment));

                // Case of 1 segment: this will return false, because there is already a geometrySegmentStyle present in the Array for me to work with (0 < 0)
                // Case of more segments: after the first iteration the segmentArray still has length of 1, aka it still has that same style which I already changed
                // Thats why I need a new style to be cloned into the Array so that I can perform the same methods on the new one and then push it into stylesArray
                if (segmentArray.length - 1 < count) {
                    segmentArray.push(geometrySegmentStyle.clone());
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
                    setStyleToArray(lineLengthLabelStyle.clone(), linesAnglePoint, linesAngle);
                }
            }
        }

        // Display the mouseTipTextStyle help message to the user, if they aren't modifying
        if (geometryType === 'Point' && !modify.getOverlay().getSource().getFeatures().length) {
            setStyleToArray(mouseTipTextStyle, null, tip);
            tipPoint = featureGeometry;
        }
        return stylesArray;
    }

    // Basic layer to display map 
    const rasterLayer = new TileLayer({
        source: new OSM(),
    });

    // Adding features from VectorSource and adding a new Layer to draw on
    const sourceVector = new VectorSource();
    const vectorLayer = new VectorLayer({
        source: sourceVector,
        style: (feature) => styleFunction(feature)
    });

    // Setting up imported functionalities 
    const modify = new Modify({ source: sourceVector, style: mouseCursorModifyStyle});
    const snap = new Snap({ source: sourceVector });
    let draw;
    let tipPoint;

    // Map wants to render instantly, even if target container doesnt exist yet, reason for the use of useEffect
    useEffect(() => {

        // Rendering the map, it needs a minimum of target container, view and one layer
        const map = new Map({
            target: 'map-div',
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: [0, 0],
                zoom: 2,
            })
        });

        // Function which adds imported functionalities, created ones and event listeners to the draw 
        function addInteractions() {

            // Help to the user displayed next to the cursor
            const activeTip = 'Click to continue drawing the line';
            const idleTip = 'Click to start drawing';
            let tip = idleTip;

            // Settings for drawing geometries
            draw = new Draw({
                source: sourceVector,
                type: 'LineString',
                style: (feature) => styleFunction(feature, tip)
            });

            // Adding all imported or created functionalities to the map
            map.addInteraction(draw);
            map.addInteraction(modify);
            map.addInteraction(snap); 

            // If the user starts drawing I want to disable modify, because drawing is priority, also changing the hint
            draw.on('drawstart', () => {
                modify.setActive(false);
                tip = activeTip;
            });

            // If the user ends drawing I will switch modify back up
            draw.on('drawend', () => {

                // And I want the end point to instantly display modify, otherwise it will jump to the starting point with the modify option
                mouseCursorModifyStyle.setGeometry(tipPoint);
                modify.setActive(true);
                tip = idleTip;

                // If the user were to modify drawn element, it would display the option at the end point ONLY, this moves the label with the user's cursor
                map.once('pointermove', function () {
                    mouseCursorModifyStyle.setGeometry();
                });
            });
        }
        addInteractions();
        document.getElementById("map-div").focus();
        // If the user gave an input, create a new layer
        if (initialURL) {
            const layerURL = new TileLayer({
                source: new XYZ({
                    url: initialURL, 
                    zoom: 2
                })
            })
            /*
                Yes, this lacks a try..catch error handling for invalid API calls and also probably a some kind of RegExp func.
                And some other kinds of input checkings so that I just dont update the State for any input
            */

            // I want this new layer to be UNDER vector layer, otherwise the features would be drawn below the new layer and therefore not visible
            map.getLayers().insertAt(1, layerURL);
        }

        // This is the useEffect cleanUp function
        return () => map.setTarget(null);
    });

    // Function to handle input controls via mouse or keyboard
    function checkKeyDown(e) {
        //console.log(e.key)

        /*
            For keyboard input only:
            1. Here I am thinking that using onKeyDown for the keyboard input is the way to go
            2. Basically I'd build the system around document.getElementById("map-div").focus();
            3. I would bind specific keys to "click" on the UI buttons, basically just call the functions, with focus being in the inputs, the user can always tab through them
            4. For example key "D" would call the toggleVisibility(drawRef, true) and the user would see the form pop up with focus being in the first coordinate
            5. In other cases, say remove it would be simpler - "R" and run the function

            For mouse input only:
            1. In this case I would create a set of 0-9 numbers and a dot to display at the bottom of the site for the user to click on it
            2. Which would then pass the number into the corresponding input
            3. Obviously, this will not work when it comes to URL link, which is why, if this actually was a real project, I would consult a possibility of using Raster Reprojection
            4. Why? Because I find Image reprojection to be better suited for this project, I would try to cut down the amount of information the user is expected to submit to an absolute minimum
            5. Since coordinates, angles are all just numbers without their units, I would aim for the user to be obligated to submit only these to get the image into the map
        */
    }

    return (
        <>
            <div id="map-div" onMouseLeave={() => draw.setActive(false)} onMouseEnter={() => draw.setActive(true)} onKeyDown={checkKeyDown} tabIndex={0}></div>
            <div className="overlay-comp_units">
                <div className="switch-field">
                    <input type="radio" id="radio-one" name="switch-one" defaultChecked onChange={() => measurementUnits.current = "Km"} />
                    <label htmlFor="radio-one" title="Switch to Kilometres">Km</label>
                    <input type="radio" id="radio-two" name="switch-one" onChange={() => measurementUnits.current = "Miles"} />
                    <label htmlFor="radio-two" title="Switch to Miles">Mile</label>
                </div>
            </div>
            <div className="overlay-comp_units2">
                <div className="switch-field">
                    <input type="radio" id="radio-three" name="switch-two" defaultChecked onChange={() => angleUnits.current = "Deg"} />
                    <label htmlFor="radio-three" title="Switch to Degrees">Deg</label>
                    <input type="radio" id="radio-fourth" name="switch-two" onChange={() => angleUnits.current = "Rad"} />
                    <label htmlFor="radio-fourth" title="Switch to Radians">Rad</label>
                </div>
            </div>
            <div className="overlay-comp">
                <div className="overlay-comp_draw">
                    <div>
                        <button title="Draw features" onClick={() => toggleVisibility(drawRef, true)}><i className="bi bi-pencil"></i></button>
                    </div>
                    <div ref={drawRef} className="overlay-comp_inputs" style={{ display: 'none' }}>
                        <form onSubmit={addUserDrawing}>
                            <label htmlFor="x-coord">X coordinate</label>
                            <input id="x-coord" name="xcoord1"></input>
                            <label htmlFor="y-coord">Y coordinate</label>
                            <input id="y-coord" name="ycoord1"></input>
                            <br />
                            <label htmlFor="x-coord2">X coordinate</label>
                            <input id="x-coord2" name="xcoord2"></input>
                            <label htmlFor="y-coord2">Y coordinate</label>
                            <input id="y-coord2" name="y-coord2"></input>
                            <br />
                            <label htmlFor="azimuth">Azimuth angle</label>
                            <input id="azimuth" name="azimuth"></input>
                            <label htmlFor="length">Length</label>
                            <input id="length" name="length"></input>
                            <button type="submit">Draw Line</button>
                        </form>
                    </div>
                </div>
                <div>
                    <button title="Erase last drawn feature" onClick={removeLastFeature}><i className="bi bi-eraser"></i></button>
                </div>
                <div>
                    <button title="Clear all drawings" onClick={() => sourceVector.clear()}><i className="bi bi-trash"></i></button>
                </div>
                <div className="overlay-comp_upload_div">
                    <button title="Display an online source" onClick={() => toggleVisibility(uploadRef, false)}><i className="bi bi-upload"></i></button>
                    <div ref={uploadRef} className="overlay-comp_upload_form" style={{ display: 'none' }}>
                        <form onSubmit={createNewLayer} method="post">
                            <label htmlFor="input-url">URL:</label>
                            <input id="input-url" name="url" placeholder="Place your link" type="url"></input>
                            <button type="submit" className="overlay-comp_upload_button">Submit</button>
                        </form>
                    </div>
                </div>
                <div>
                    <button title="Restore default layer" onClick={() => setURL(false)}><i className="bi bi-arrow-clockwise"></i></button>
                </div>
            </div>
        </>
    );
}

export default MapComponent;