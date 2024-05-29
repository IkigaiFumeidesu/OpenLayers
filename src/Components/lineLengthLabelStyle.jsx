import {
    Fill,
    RegularShape,
    Style,
    Text,
} from 'ol/style.js';

// This style represents the total length of a LineString shown at the LastCoordinate
const lineLengthLabelStyle = new Style({
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

export default lineLengthLabelStyle;