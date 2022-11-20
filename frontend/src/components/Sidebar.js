import React, { useState, useContext } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarHeader, SidebarContent, SidebarFooter } from "react-pro-sidebar";
import './Sidebar.scss';
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import { SiApacheairflow } from "react-icons/si";
import { GiAbstract050 } from "react-icons/gi";
import SpatialRange from "./SpatialRange.js";
import FileUpload from "./FileUpload.js";
import { Button } from '@mui/material';
import DataStore from '../stores/dataStore.ts';
import { observer } from "mobx-react-lite";
import { CircularProgress, Backdrop } from '@mui/material';


function Sidebar() {
    const dataStore = useContext(DataStore);
    const [menuCollapse, setMenuCollapse] = useState(false)
    const menuIconClick = () => {
        menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
    };

    const [open, setOpen] = React.useState(false);
    return (
        <div id="header" style={{ height: "100vh" }}>
            <ProSidebar collapsed={menuCollapse}>
                <SidebarHeader>
                    <div className="logotext">
                        <p>{menuCollapse ? <GiAbstract050 /> : <SiApacheairflow />}</p>
                    </div>
                    <div className="closemenu" onClick={menuIconClick}>
                        {menuCollapse ? (
                            <FiArrowRightCircle />
                        ) : (
                            <FiArrowLeftCircle />
                        )}
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <Menu>
                        <SubMenu title="File Upload">
                            <div> </div>
                            <br></br>
                            <FileUpload />
                            <div> </div>
                            <br></br>
                            <Button variant="contained" color="success" size="small"
                                style={{ marginLeft: 60 }} onClick={async () => {
                                    setOpen(true);
                                    await dataStore.fetchTrajectoryData();
                                    setOpen(false);
                                }}>
                                Upload
                            </Button>
                            <Backdrop
                                sx={{ color: '#fff', zIndex: 3 }}
                                open={open}
                            >
                                <CircularProgress color="inherit" />
                            </Backdrop>
                            <div> </div>
                            <br></br>
                        </SubMenu>
                        <SubMenu title="Spatial Range">
                            <SpatialRange title={'Min Latitude'} minV={-90} maxV={90} stepS={0.000001} query={0} />
                            <SpatialRange title={'Min Longitude'} minV={-180} maxV={180} stepS={0.000001} query={0} />
                            <SpatialRange title={'Max Latitude'} minV={-90} maxV={90} stepS={0.000001} query={0} />
                            <SpatialRange title={'Max Longitude'} minV={-180} maxV={180} stepS={0.000001} query={0} />
                            <Button variant="contained" color="success" size="small"
                                style={{ marginLeft: 60 }}
                                onClick={async () => {
                                    setOpen(true);
                                    await dataStore.fetchSpatialRangeData();
                                    setOpen(false);
                                }}>
                                Search
                            </Button>
                            <div> </div>
                            <br></br>
                        </SubMenu>
                        <SubMenu title="SpatioTemporal Range">
                            <SpatialRange title={'Min Latitude'} minV={-90} maxV={90} stepS={0.000001} query={1} />
                            <SpatialRange title={'Min Longitude'} minV={-180} maxV={180} stepS={0.000001} query={1} />
                            <SpatialRange title={'Max Latitude'} minV={-90} maxV={90} stepS={0.000001} query={1} />
                            <SpatialRange title={'Max Longitude'} minV={-180} maxV={180} stepS={0.000001} query={1} />
                            <SpatialRange title={'Min Time'} minV={0} maxV={100000000} stepS={1} query={1} />
                            <SpatialRange title={'Max Time'} minV={0} maxV={100000000} stepS={1} query={1} />
                            <Button variant="contained" color="success" size="small"
                                style={{ marginLeft: 60 }}
                                onClick={async () => {
                                    setOpen(true);
                                    await dataStore.fetchSpatioTemporalRangeData();
                                    setOpen(false);
                                }}>
                                Search
                            </Button>
                            <div> </div>
                            <br></br>
                        </SubMenu>
                        <SubMenu title="KNN">
                            <SpatialRange title={'Trajectory ID'} minV={1} maxV={100} stepS={1} query={2} />
                            <SpatialRange title={'K'} minV={1} maxV={100} stepS={1} query={2} />
                            <Button variant="contained" color="success"
                                size="small" style={{ marginLeft: 60 }}
                                onClick={async () => {
                                    setOpen(true);
                                    await dataStore.fetchKNN();
                                    setOpen(false);
                                }}>
                                Search
                            </Button>
                            <div> </div>
                            <br></br>
                        </SubMenu>
                    </Menu>
                </SidebarContent>
            </ProSidebar>
        </div>
    )
}
export default observer(Sidebar);