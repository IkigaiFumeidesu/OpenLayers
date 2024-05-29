import {
    Circle as CircleStyle,
    Fill,
    Stroke,
    Style,
} from 'ol/style.js';

// This style represents the circle around user's cursor 
const mouseCursorStyle = new Style({
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

export default mouseCursorStyle;