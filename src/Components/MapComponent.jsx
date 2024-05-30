import React from 'react';
import { useEffect, useState, useRef } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import XYZ from 'ol/source/XYZ.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import token from '../../token.js'
import Feature from 'ol/Feature.js';
import { fromLonLat } from 'ol/proj';
import styleMouseCursorModify from './styleMouseCursorModify.jsx'
import setStyleToFeatures from './setStyleToFeatures.jsx'

function MapComponent() {

    const [initialURL, setURL] = useState(false);

    // Finding the elements associated with the clicked button and making them visible
    const toggleFormVisibility = (clickedButtonUsage) => {

        if (clickedButtonUsage === "Draw") {
            const drawFormStyle = document.getElementById("draw-feature_form").style;
            drawFormStyle.display === 'none' ? drawFormStyle.display = 'block' : drawFormStyle.display = 'none';
            document.getElementById("x-coord").focus()
        } else {
            const sourceFormStyle = document.getElementById("online-source_form").style;
            sourceFormStyle.display === 'none' ? sourceFormStyle.display = 'block' : sourceFormStyle.display = 'none';
            document.getElementById("input-url").focus();
        }
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
        toggleFormVisibility("Source");
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
    // Function which helps to rewrite tipPoint variable while looking at condition and passing the parameters 
    function passParamsToStyle(feature, textNextToCursor) {

        // Get the type - Point / LineString
        const geometryFeature = feature.getGeometry();
        const geometryType = geometryFeature.getType();

        // Get which units are selected in the radio buttons [Kms / Miles] or [Deg / Rad]
        const measurementUnits = document.getElementById("radio-one").checked;
        const angleUnits = document.getElementById("radio-three").checked;
        const passedMeasureUnits = measurementUnits ? "Km" : "Miles";
        const passedAngleUnits = angleUnits ? "Deg" : "Rad";

        // Display the styleMouseTipText help message to the user, if they aren't modifying
        if (geometryType === 'Point' && !modify.getOverlay().getSource().getFeatures().length) {
            tipPoint = geometryFeature;
            return setStyleToFeatures(geometryFeature, geometryType, textNextToCursor, true, passedMeasureUnits, passedAngleUnits)
        } else {
            return setStyleToFeatures(geometryFeature, geometryType, textNextToCursor, false, passedMeasureUnits, passedAngleUnits)
        }
    }

    // Basic layer to display map 
    const rasterLayer = new TileLayer({
        source: new OSM(),
    });

    // Adding features from VectorSource and adding a new Layer to draw on
    const sourceVector = new VectorSource();
    const vectorLayer = new VectorLayer({
        source: sourceVector,
        style: (feature) => passParamsToStyle(feature)
    });

    // Setting up imported functionalities 
    const modify = new Modify({ source: sourceVector, style: styleMouseCursorModify});
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
            const textActiveDrawing = 'Click to continue drawing the line';
            const textStartDrawing = 'Click to start drawing';
            let textNextToCursor = textStartDrawing;

            // Settings for drawing geometries
            draw = new Draw({
                source: sourceVector,
                type: 'LineString',
                style: (feature) => passParamsToStyle(feature, textNextToCursor)
            });

            // Adding all imported or created functionalities to the map
            map.addInteraction(draw);
            map.addInteraction(modify);
            map.addInteraction(snap); 

            // If the user starts drawing I want to disable modify, because drawing is priority, also changing the hint
            draw.on('drawstart', () => {
                modify.setActive(false);
                textNextToCursor = textActiveDrawing;
            });

            // If the user ends drawing I will switch modify back up
            draw.on('drawend', () => {

                // And I want the end point to instantly display modify, otherwise it will jump to the starting point with the modify option
                styleMouseCursorModify.setGeometry(tipPoint);
                modify.setActive(true);
                textNextToCursor = textStartDrawing;

                // If the user were to modify drawn element, it would display the option at the end point ONLY, this moves the label with the user's cursor
                map.once('pointermove', function () {
                    styleMouseCursorModify.setGeometry();
                });
            });
        }
        addInteractions();
        //document.getElementById("map-div").focus();
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
            <div id="map-div" onMouseLeave={() => draw.setActive(false)} onMouseEnter={() => draw.setActive(true)} onKeyDown={checkKeyDown} /*tabIndex={1}*/></div>
            <div className="overlay-comp_units">
                <div className="switch-field">
                    <input type="radio" id="radio-one" name="switch-one" defaultChecked />
                    <label htmlFor="radio-one" title="Switch to Kilometres">Km</label>
                    <input type="radio" id="radio-two" name="switch-one" />
                    <label htmlFor="radio-two" title="Switch to Miles">Mile</label>
                </div>
            </div>
            <div className="overlay-comp_units2">
                <div className="switch-field">
                    <input type="radio" id="radio-three" name="switch-two" defaultChecked/>
                    <label htmlFor="radio-three" title="Switch to Degrees">Deg</label>
                    <input type="radio" id="radio-fourth" name="switch-two"/>
                    <label htmlFor="radio-fourth" title="Switch to Radians">Rad</label>
                </div>
            </div>
            <div className="overlay-comp">
                <div className="overlay-comp_draw">
                    <div>
                        <button title="Draw features" onClick={() => toggleFormVisibility("Draw")}><i className="bi bi-pencil"></i></button>
                    </div>
                    <div id="draw-feature_form" className="overlay-comp_inputs" style={{ display: 'none' }}>
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
                    <button title="Display an online source" onClick={() => toggleFormVisibility("Source")}><i className="bi bi-upload"></i></button>
                    <div id="online-source_form" className="overlay-comp_upload_form" style={{ display: 'none' }}>
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