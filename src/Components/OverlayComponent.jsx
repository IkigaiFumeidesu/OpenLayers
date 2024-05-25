import React from 'react';
import { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import token from '../../token.js'

function OverlayComponent(props) {

    const [noInput, setInput] = useState(false);
    const [noControls, setControls] = useState(false);

    function showUserControls() {

        return (
            <>
                <div>

                </div>
            </>
        )
    }

    // Function to remove the very last drawn feature by the user
    function removeLastFeature() {
        props.sourceVector.removeFeature(props.sourceVector.getFeatures()[props.sourceVector.getFeatures().length - 1]);
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
        props.setURL(objectForm.url + "?apikey=" + token);
        setInput(false);
    }

    // By user clicking on the upload symbol this form is shown to the user
    function getUserInput() {
        return (
            <>
                <div className="overlay-comp_upload_form">
                    <form onSubmit={createNewLayer} method="post">
                        <label>URL:</label>
                        <input name="url" placeholder="Place your link"></input>
                        <button type="submit" className="overlay-comp_upload_button">Submit</button>
                    </form>
                </div>
            </>
        )
    }

    return (
        <>  
            <div className="overlay-comp">
                <div>
                    <button title="Draw features" onClick={() => { noControls === false ? setControls(true) : setControls(false) }}><i className="bi bi-pencil"></i></button>
                    {noControls === true && showUserControls() }
                </div>
                <div>
                    <button title="Erase last drawn feature" onClick={() => removeLastFeature()}><i className="bi bi-eraser"></i></button>
                </div>
                <div>
                    <button title="Clear all drawings" onClick={() => props.sourceVector.clear()}><i className="bi bi-trash"></i></button>
                </div>
                <div className="overlay-comp_upload_div">
                    <button title="Display an online source" onClick={() => {noInput === false ? setInput(true) : setInput(false)}}><i className="bi bi-upload"></i></button>
                    {noInput === true &&  getUserInput()}
                </div>
                <div>
                    <button title="Restore default layer" onClick={() => { props.setURL(false); setInput(false) }}><i className="bi bi-arrow-clockwise"></i></button>
                </div>
            </div>
        </>
    );
}

export default OverlayComponent;