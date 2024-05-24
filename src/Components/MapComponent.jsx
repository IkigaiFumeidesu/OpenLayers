import React from 'react';
import { useEffect, useState } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import {
    Circle as CircleStyle,
    Fill,
    RegularShape,
    Stroke,
    Style,
    Text,
} from 'ol/style.js';
import { getLength } from 'ol/sphere.js';
import { LineString, Point } from 'ol/geom.js';
import OverlayComponent from './OverlayComponent';
import XYZ from 'ol/source/XYZ.js';

function MapComponent() {

    const [initialURL, setURL] = useState(false);

    // This style represents the circle around user's cursor 
    const style = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2,
        }),
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
        }),
    });

    // This style represents the total length of a LineString shown at the LastCoordinate
    const labelStyle = new Style({
        text: new Text({
            font: '14px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            padding: [3, 3, 3, 3],
            textBaseline: 'bottom',
            offsetY: -15,
        }),
        image: new RegularShape({
            radius: 8,
            points: 3,
            angle: Math.PI,
            displacement: [0, 10],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
        }),
    });

    // This style represents the help text next to the cursor
    const tipStyle = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    // This style represents the modify text and change of cursor's style when cursor is on an existing drawn element
    const modifyStyle = new Style({
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
        }),
        text: new Text({
            text: 'Drag to modify OR right click to draw',
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    // Each LineString has either 1 segment or more, and this style display as a label with the length of each one
    const segmentStyle = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
            padding: [2, 2, 2, 2],
            textBaseline: 'bottom',
            offsetY: -12,
        }),
        image: new RegularShape({
            radius: 6,
            points: 3,
            angle: Math.PI,
            displacement: [0, 8],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
        }),
    });

    // Function to calculate and switch from one measurement unit to another
    function lineLength(length) {
        let output;
        // DEV NOTE Here I need a button for this to work properly
        if ("Kms") {
            if (length > 100) {
                output = Math.round((length / 1000) * 100) / 100 + ' km';
            } else {
                output = Math.round(length * 100) / 100 + ' m';
            }
        } else {
            if (length > 100) {
                output = Math.round((length / 1000 * 1.609) * 100) / 100 + 'mile';
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
        // DEV NOTE - THIS SHOULD ALSO HAVE AN OPTION FOR CONDITIONAL CALC.
        const azimuthRadians = Math.atan2(coordX, coordY);
        const azimuthDegrees = azimuthRadians * 180 / Math.PI;

        // Limit the azimuth to a specific range of [0, 360]
        return ((azimuthDegrees + 360) % 360).toFixed(2);
    }

    // Function to calculate the angle between any two lines, using the azimuth
    function calcAngleBetweenLines(coordinates, i) {

        // Get the azimuth for start-shared coords and finish-shared coords
        const azimuthFirstLine = calcAzimuthAngle([coordinates[i], coordinates[i - 1]]);
        const azimuthSecondLine = calcAzimuthAngle([coordinates[i], coordinates[i + 1]]);
        let resultingAngle = Math.abs(azimuthFirstLine - azimuthSecondLine);

        // The angle cannot be more than 180 degrees, to account for this:
        if (resultingAngle > 180) {
            resultingAngle = 360 - resultingAngle;
        }
        return resultingAngle.toFixed(2);
    }

    // Function to set style to a drawn element
    function styleFunction(feature, tip) {

        // stylesArray should always contain the cursor's style
        const stylesArray = [style];
        const segmentArray = [segmentStyle];
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
            setStyleToArray(labelStyle, linePoint, lineLabel);

            // Getting the Azimuth angle and getting the FirstCoord to display the AngleStyle there, pushing another style to stylesArray
            angleAzimuth = "Az " + calcAzimuthAngle(geometryCoords) + " Deg";
            anglePoint = new Point(featureGeometry.getFirstCoordinate());
            setStyleToArray(labelStyle.clone(), anglePoint, angleAzimuth);

            let count = 0;
            // Link for this:
            // https://openlayers.org/en/latest/apidoc/module-ol_geom_LineString-LineString.html#forEachSegment
            // Iterating over each segment to get the length of each to be able to display it
            featureGeometry.forEachSegment((a, b) => {

                // Get first segment, construct a LineString and get its length
                const segment = new LineString([a, b]);
                const lineLabel = lineLength(getLength(segment));

                // Case of 1 segment: this will return false, because there is already a segmentStyle present in the Array for me to work with (0 < 0)
                // Case of more segments: after the first iteration the segmentArray still has length of 1, aka it still has that same style which I already changed
                // Thats why I need a new style to be cloned into the Array so that I can perform the same methods on the new one and then push it into stylesArray
                if (segmentArray.length - 1 < count) {
                    segmentArray.push(segmentStyle.clone());
                }

                // Get a point in the middle of the segment to display the label with length data
                const segmentPoint = new Point(segment.getCoordinateAt(0.5));
                setStyleToArray(segmentArray[count], segmentPoint, lineLabel);
                count++;
            });

            // If there are more than 2 segments, its possible to calculate the angle between the 2 LineStrings
            if (geometryCoords.length > 2) {
                for (let i = 1; i < count; i++) {
                    linesAngle = "A " + calcAngleBetweenLines(geometryCoords, i) + " Deg";
                    linesAnglePoint = new Point(geometryCoords[i]);
                    setStyleToArray(labelStyle.clone(), linesAnglePoint, linesAngle);
                }
            }
        }

        // Display the tipStyle help message to the user, if they aren't modifying
        if (geometryType === 'Point' && !modify.getOverlay().getSource().getFeatures().length) {
            setStyleToArray(tipStyle, null, tip);
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
    const modify = new Modify({ source: sourceVector, style: modifyStyle});
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
                modifyStyle.setGeometry(tipPoint);
                modify.setActive(true);
                tip = idleTip;

                // If the user were to modify drawn element, it would display the option at the end point ONLY, this moves the label with the user's cursor
                map.once('pointermove', function () {
                    modifyStyle.setGeometry();
                });
            });
        }
        addInteractions();

        // If the user gave an input, create a new layer
        if (initialURL) {
            const layerURL = new TileLayer({
                source: new XYZ({
                    url: initialURL
                })
            })

            // I want this new layer to be UNDER vector layer, otherwise the features would be drawn below the new layer and therefore not visible
            map.getLayers().insertAt(1, layerURL);
        }

        // This is the useEffect cleanUp function
        return () => map.setTarget(null);
    });

    return (
        <>
            <OverlayComponent sourceVector={sourceVector} setURL={setURL} />
            <div id="map-div"></div>
        </>
    );
}

export default MapComponent;