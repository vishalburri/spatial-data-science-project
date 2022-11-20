import React, { useState, useContext } from 'react';
import { observer } from "mobx-react-lite";
import DataStore from '../stores/dataStore.ts';
function FileUpload() {
    const dataStore = useContext(DataStore);
    let fileReader;
    const handleFileRead = (e) => {
        const content = fileReader.result;
        console.log(JSON.parse(content));
        dataStore.inputData = JSON.parse(content);
    };

    const handleFileChosen = (file) => {
        fileReader = new FileReader();
        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(file);
    };

    return (
        <div>
            <input id="upload" type="file" name="file" onChange={e => handleFileChosen(e.target.files[0])} />
        </div>
    )
}
export default observer(FileUpload);