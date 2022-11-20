import { observable, action, computed } from "mobx";
import { createContext } from "react";

class DataStore {
    @observable jsonData: any = undefined;
    @observable trajectoryData: any = undefined;

    @observable inputData: any = undefined;

    //store argument values
    @observable knnTrajectoryId = 0;
    @observable knnK = 0;
    @observable srminlat = 0;
    @observable srminlon = 0;
    @observable srmaxlat = 0;
    @observable srmaxlon = 0;
    @observable strminlat = 0;
    @observable strminlon = 0;
    @observable strmaxlat = 0;
    @observable strmaxlon = 0;
    @observable strmintime = 0;
    @observable strmaxtime = 0;

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    @action fetchTrajectoryData = async () => {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': 'http://localhost:3000/' },
                body: JSON.stringify(this.inputData)
            };
            const response = await fetch('http://localhost:5000/loadTrajectoryData', requestOptions);
            const data = await response.text();
            this.jsonData = JSON.parse(data);
            this.trajectoryData = JSON.parse(data);
        } catch (error) {
            console.log("error", error);
        }
    }

    @action fetchSpatialRangeData = async () => {
        if (this.trajectoryData == undefined) {
            alert('Please Input the data');
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({'body':this.trajectoryData,'start_latitude': this.srminlat,
             'start_longitude':this.srminlon, 'end_latitude':this.srmaxlat, 'end_longitude':this.srmaxlon})
        };
        const response = await fetch('http://localhost:5000/getSpatialRange', requestOptions);
        const data = await response.json();
        this.jsonData = this.formatRangeData(data);
    }

    @action fetchSpatioTemporalRangeData = async () => {
        if (this.trajectoryData == undefined) {
            alert('Please Input the data');
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({'body':this.trajectoryData,'start_latitude': this.strminlat,
             'start_longitude':this.strminlon, 'end_latitude':this.strmaxlat, 'end_longitude':this.strmaxlon, 
             'start_time':this.strmintime, 'end_time':this.strmaxtime})
        };
        const response = await fetch('http://localhost:5000/getSpatialTemporalRange', requestOptions);
        const data = await response.json();
        this.jsonData = this.formatRangeData(data);
    }

    @action fetchKNN = async () => {
        if (this.trajectoryData == undefined) {
            alert('Please Input the data');
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({'body':this.trajectoryData,'trajectory_id': this.knnTrajectoryId,'knnK':this.knnK})
        };
        const response = await fetch('http://localhost:5000/getKNN', requestOptions);
        const data = await response.json();
        this.jsonData = this.formatKNNData(data);
    }

    @action setSRMaxLatitude = (val) => {
        this.srmaxlat = val;
    }
    @action setSRMinLatitude = (val) => {
        this.srminlat = val;
    }
    @action setSRMaxLongitude = (val) => {
        this.srmaxlon = val;
    }
    @action setSRMinLongitude = (val) => {
        this.srminlon = val;
    }
    @action setMaxLatitude = (val) => {
        this.strmaxlat = val;
    }
    @action setMinLatitude = (val) => {
        this.strminlat = val;
    }
    @action setMaxLongitude = (val) => {
        this.strmaxlon = val;
    }
    @action setMinLongitude = (val) => {
        this.strminlon = val;
    }
    @action setMaxTime = (val) => {
        this.strmaxtime = val;
    }
    @action setMinTime = (val) => {
        this.strmintime = val;
    }
    @action setKnnTrajectoryId = (val) => {
        this.knnTrajectoryId = val;
    }
    @action setknnK = (val) => {
        this.knnK = val;
    }

    private formatKNNData = (data) => {
        const trips = this.trajectoryData.filter((trajectory) => {
            if (
                data.find((kTrajectory) => {
                    return kTrajectory.trajectory_id === trajectory.trajectory_id;
                })
            )
                return trajectory;
        });
        return trips;
    };

    private formatRangeData = (rangeData) => {
        const trips = rangeData.map((elem) => {
            const res: any = [];
            for (let index = 0; index < elem.location.length; index++) {
                res.push({ _1: elem.location[index], _2: elem.timestamp[index] });
            }
            return { ...elem, trajectory: res };
        });
        return trips;
    };

}
export default createContext(new DataStore());