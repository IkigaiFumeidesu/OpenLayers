import {
    Fill,
    RegularShape,
    Style,
    Text,
} from 'ol/style.js';

// Each LineString has either 1 segment or more, and this style display as a label with the length of each one
const geometrySegmentStyle = new Style({
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

export default geometrySegmentStyle;