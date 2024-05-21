import React from 'react';
import { useEffect } from 'react';
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


function MapComponent() {

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
            text: 'Drag to modify',
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

    const segmentStyles = [segmentStyle];

    function lineLength(lineString) {
        const length = getLength(lineString);
        let output;
        // Here I need a button for this to work properly
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
    let tipPoint;

    function styleFunction(feature, drawType, tip) {
        const styles = [];
        const geometry = feature.getGeometry();
        const type = geometry.getType();
        let point, label, line;
        if (!drawType || drawType === type || type === 'Point') {
            styles.push(style);
            if (type === 'LineString') {
                point = new Point(geometry.getLastCoordinate());
                label = lineLength(geometry);
                line = geometry;
            }
        }
        if (line) {
            let count = 0;
            line.forEachSegment(function (a, b) {
                const segment = new LineString([a, b]);
                const label = lineLength(segment);
                if (segmentStyles.length - 1 < count) {
                    segmentStyles.push(segmentStyle.clone());
                }
                const segmentPoint = new Point(segment.getCoordinateAt(0.5));
                segmentStyles[count].setGeometry(segmentPoint);
                segmentStyles[count].getText().setText(label);
                styles.push(segmentStyles[count]);
                count++;
            });
        }
        if (label) {
            labelStyle.setGeometry(point);
            labelStyle.getText().setText(label);
            styles.push(labelStyle);
        }
        if (
            tip &&
            type === 'Point' &&
            !modify.getOverlay().getSource().getFeatures().length
        ) {
            tipPoint = geometry;
            tipStyle.getText().setText(tip);
            styles.push(tipStyle);
        }
        return styles;
    }

    const rasterLayer = new TileLayer({
        source: new OSM(),
    });

    const sourceVector = new VectorSource();
    const modify = new Modify({ source: sourceVector, style: modifyStyle});
    const snap = new Snap({ source: sourceVector });

    const vectorLayer = new VectorLayer({
        source: sourceVector,
        style: (feature) => styleFunction(feature)
    });

    let draw;

    // Map wants to render instantly, even if target container doesnt exist yet, reason for the use of useEffect
    useEffect(() => {
        const map = new Map({
            target: 'map-div',
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: [0, 0],
                zoom: 2,
            })
        });
        function addInteractions() {
            const activeTip = 'Click to continue drawing the line';
            const idleTip = 'Click to start drawing';
            let tip = idleTip;
            draw = new Draw({
                source: sourceVector,
                type: 'LineString',
                style: (feature) => styleFunction(feature, 'LineString', tip)
            });
            map.addInteraction(modify);

            draw.on('drawstart', () => {
                modify.setActive(false);
                tip = activeTip;
            });

            draw.on('drawend', () => {
                modifyStyle.setGeometry(tipPoint);
                modify.setActive(true);
                tip = idleTip;
                map.once('pointermove', function () {
                    modifyStyle.setGeometry();
                });
            });
            map.addInteraction(draw);
            map.addInteraction(snap);

                
        }
        addInteractions();

        return () => map.setTarget(null)
    });


  return (
    <div id="map-div"></div>
  );
}

export default MapComponent;