import React, { useState, useContext } from "react";
import { Slider, Typography, TextField } from '@mui/material';
import { observer } from "mobx-react-lite";
import DataStore from '../stores/dataStore.ts';
function SpatialRange({ title, minV, maxV, stepS, query }) {
    const getText = (value) => value;
    const [inputVal, setInputVal] = useState(0);
    const changeValue = (event, value) => {
        setInputVal(value);
        if (query == 0) {
            if (title == "Min Latitude") { dataStore.setSRMinLatitude(value); }
            if (title == "Max Latitude") { dataStore.setSRMaxLatitude(value); }
            if (title == "Min Longitude") { dataStore.setSRMinLongitude(value); }
            if (title == "Max Longitude") { dataStore.setSRMaxLongitude(value); }
        }
        else if (query == 1) {
            if (title == "Min Latitude") { dataStore.setMinLatitude(value); }
            if (title == "Max Latitude") { dataStore.setMaxLatitude(value); }
            if (title == "Min Longitude") { dataStore.setMinLongitude(value); }
            if (title == "Max Longitude") { dataStore.setMaxLongitude(value); }
            if (title == "Min Time") { dataStore.setMinTime(value); }
            if (title == "Max Time") { dataStore.setMaxTime(value); }
        }
        else if (query == 2) {
            if (title == "Trajectory ID") { dataStore.setKnnTrajectoryId(value); }
            if (title == "K") { dataStore.setknnK(value); }
        }
    }
    const dataStore = useContext(DataStore);
    return (
        <>
            <Typography id="range-slider" gutterBottom>
                <div> </div><br></br>
                <span style={{ fontSize: 10, fontWeight: 'bold' }}>{title} : </span>
                <TextField id="standard-basic" variant="standard"
                    value={inputVal} inputProps={{ style: { color: "white", fontSize: 10, marginLeft: 10 } }}
                    onChange={changeValue} />
            </Typography>
            <Slider
                size="small"
                style={{ marginTop: 10, marginLeft: 10, width: 170 }}
                aria-labelledby="range-slider"
                defaultValue={0}
                step={stepS}
                min={minV}
                max={maxV}
                getAriaValueText={getText}
                valueLabelDisplay="auto"
                onChange={changeValue}
            />
        </>
    );
}
export default observer(SpatialRange);