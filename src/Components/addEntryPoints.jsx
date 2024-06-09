
// Function to display selects and add extra selects as well
function addEntryInputs(targetedForm, p = 2) {

    // Searching for inputs to work with conditions below
    const getNumberOfSelects = document.getElementsByClassName("draw-input_coords");
    const selectsArray = [...getNumberOfSelects].length;

    if (selectsArray === 10) {
        targetedForm.style.overflowY = "scroll";
    }

    // selectsArray is initially always 0, so 0 < 2, when the user asks for more inputs, first call 6 < 7, then 10 < 11 etc. (adding 4 inputs)
    for (let i = selectsArray; i < selectsArray + p; i++) {

        // Initial set up, I need this to be called only once
        i === 0 && (targetedForm.innerHTML = "<p>Submit initial [X,Y] coordinates:</p>");

        let coordsRender =
        `${p === 1 ? "<p>Submit next [X,Y] coordinates:</p>" : ""}
        <div class="draw-input_initial_coords">
            <div>
                <label for="x-coord${i}">X: </label>
                <input id="x-coord${i}" name="x-coord${i}" class="draw-input_coords" type="number"></input>
                <select name="x-selectedUnitsCoord${i}">
                    <option>Deg</option>
                    <option>Rad</option>
                    <option>Km</option>
                    <option>Miles</option>
                </select>
            </div>
            <div>
                <label for="y-coord${i}">Y: </label>
                <input id="y-coord${i}" name="y-coord${i}" class="draw-input_coords" type="number"></input>
                <select name="y-selectedUnitsCoord${i}">
                    <option>Deg</option>
                    <option>Rad</option>
                    <option>Km</option>
                    <option>Miles</option>
                </select>
            </div>
        </div>
        `;

        // innerHTML resets the inputs, using Node append instead
        let tempNode = document.createElement("newInputDiv");
        tempNode.innerHTML = coordsRender;
        targetedForm.appendChild(tempNode);

        // Adding this only on initial render
        if (i === 0) {
            targetedForm.innerHTML +=
            `
            <hr/>
            <p>Submit next [X,Y] coordinates:</p>
            `;
        }

        // I need this to run on the first render, hence i = 1 % = 1, and then when the user calls for more inputs, p === 1 
        if (i % 2 !== 0 || p === 1) {
            let coordsRender =
            `
             <p>Or submit Azimuth and Length:</p>
                <div class="draw-input_initial_coords">
                    <div>
                        <label for="azimuth${i}">Az: </label>
                        <input id="azimuth${i}" name="azimuth${i}" class="draw-input_coords" type="number"></input>
                        <select name="azimuth-selectedUnits${i}">
                            <option>Deg</option>
                            <option>Rad</option>
                        </select>
                    </div>
                    <div>
                        <label for="length${i}">L: </label>
                        <input id="length${i}" name="length${i}" class="draw-input_coords" type="number"></input>
                        <select name="lenght-selectedUnits${i}">
                            <option>Km</option>
                            <option>Miles</option>
                        </select>
                    </div>
                </div>
            <hr/>
            `;
            let tempNode = document.createElement("newInputDiv");
            tempNode.innerHTML = coordsRender;
            targetedForm.appendChild(tempNode);
        } 

    }
}
export default addEntryInputs;