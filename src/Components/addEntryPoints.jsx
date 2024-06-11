
// Function to display selects and add extra selects as well
function addEntryInputs(targetedForm, p, inputType, measurementUnits, angleUnits) {

    // Searching for inputs to work with conditions below
    const getNumberOfSelects = document.getElementsByClassName("draw-input_coords");
    const selectsArrayLength = [...getNumberOfSelects].length;
    selectsArrayLength === 8 && (targetedForm.style.overflowY = "scroll");

    // Object for inputs
    const selectsArrayOfObjects = [
        {
            class: ["class_coords"],
            label: ["X", "Y"],
            id: ["x-coord", "y-coord"],
            name: ["x-selectedUnitsCoord", "y-selectedUnitsCoord"],
            units: ["Deg", "Rad"],
        },
        {
            class: ["class_azimuth"],
            label: ["Az", "L"],
            id: ["azimuth", "length"],
            name: ["azimuth-selectedUnits", "lenght-selectedUnits"],
            units: ["Deg", "Rad", "Km", "Miles"],
        },
    ];

    // Function to iterate over objects properties while creating inputs for the user
    function createEntryInputs(objectNumber, number, type) {

        let displayUnitsFromObject = 0;
        let createEntry = "";
        let whichUnits;

        // Changing the number to be in a sequence for better iteration in the draw function
        if (number !== 0 && type === "Coords") {
            const collectionOfCoords = document.getElementsByClassName("class_coords");
            number = [...collectionOfCoords].length / 2;
        } else if (number !== 0 && type === "Azimuth") {
            const collectionOfCoords = document.getElementsByClassName("class_azimuth");
            number = [...collectionOfCoords].length / 2;
        }

        for (let i = 0; i < 2; i++) {

            let currentObject = selectsArrayOfObjects[objectNumber];
            let selectIDandName = currentObject.id[i];

            if (objectNumber && i === 1) {
                displayUnitsFromObject = 2;
                whichUnits = measurementUnits;
            } else {
                displayUnitsFromObject = 0;
                whichUnits = angleUnits;
            }

            createEntry +=
            `
            <div>
                <label class="${currentObject.class[0]}" for="${selectIDandName + number}">${currentObject.label[i]}: </label>
                <input id="${selectIDandName + number }" name="${selectIDandName + number}" class="draw-input_coords" type="number"></input>
                <select name="${currentObject.name[i]}${number}">
                    <option ${whichUnits === currentObject.units[displayUnitsFromObject] && "selected"}>${currentObject.units[displayUnitsFromObject]}</option>
                    <option ${whichUnits === currentObject.units[displayUnitsFromObject + 1] && "selected"}>${currentObject.units[displayUnitsFromObject + 1]}</option>
                </select>
            </div>
            `;
        }
        return createEntry;
    }

    // selectsArray is initially always 0, so 0 < 2, when the user asks for more inputs, first call 6 < 7, then 10 < 11 etc. (adding 4 inputs)
    for (let i = selectsArrayLength; i < selectsArrayLength + p; i++) {

        // Initial set up, I need this to be called only once
        i === 0 && (targetedForm.innerHTML = "<p>Submit initial [X,Y] coordinates:</p>");

        if (p === 2 || p === 1 && inputType === "Coord") {

        let coordsRender =
        `
            ${p === 1 && inputType === "Coord" ? "<p>Submit [X,Y] coordinates:</p>" : ""}
            <div class="draw-input_initial_coords">
                ${createEntryInputs(0, i, "Coords")}
            </div>
            ${ i === 0 || p === 1 && inputType === "Coord" ? "<hr/>" : ""}
        `;
        // innerHTML resets the inputs, using Node append instead
        let tempNode = document.createElement("newInputDiv");
        tempNode.innerHTML = coordsRender;
        targetedForm.appendChild(tempNode);
        }

        // Adding this only on initial render
        i === 0 && (targetedForm.innerHTML += `<p>Submit [X,Y] coordinates:</p>`);
        i === 1 && (targetedForm.innerHTML += `<p>OR</p>`);

        // I need this to run on the first render, hence i = 1 % = 1, and then when the user calls for more inputs, p === 1 
        if (i % 2 !== 0 || p === 1 && inputType === "Az/Le") {
            let coordsRender =
            `
                <p>Submit Azimuth and Length:</p>
                    <div class="draw-input_initial_coords">
                        ${createEntryInputs(1, i, "Azimuth")}
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