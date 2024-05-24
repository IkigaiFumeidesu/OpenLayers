import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import token from '../../token.js'

function OverlayComponent(props) {


    // Function to remove the very last drawn feature by the user
    function removeLastFeature() {
        props.sourceVector.removeFeature(props.sourceVector.getFeatures()[props.sourceVector.getFeatures().length - 1]);
    }
    // Function to take input from user and create a new layer and update the state
    function createNewLayer() {
        props.setURL("https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=" + token)
    }

    return (
        <>
            <div className="overlay-comp">
                <div>
                    <button><i className="bi bi-pencil"></i></button>
                </div>
                <div>
                    <button onClick={() => removeLastFeature()}><i className="bi bi-trash" ></i></button>
                </div>
                <div>
                    <button onClick={() => props.sourceVector.clear()}><i className="bi bi-arrow-clockwise"></i></button>
                </div>
                <div>
                    <button onClick={() => createNewLayer()}><i className="bi bi-upload"></i></button>
                </div>
            </div>
        </>
    );
}

export default OverlayComponent;