import {
    Fill,
    Style,
    Text,
} from 'ol/style.js';

// This style represents the help text next to the cursor
const styleMouseTipText = new Style({
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

export default styleMouseTipText;