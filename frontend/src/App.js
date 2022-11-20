import React, { Component, useContext } from 'react';
import Sidebar from "./components/Sidebar.js";
import Main from "./components/Main.js";
import { observer } from "mobx-react-lite";
import DataStore from './stores/dataStore.ts';
function App() {
  const dataStore = useContext(DataStore);
  return (
    <>
      <Sidebar />
      <Main style={{ zIndex: 1 }} />
    </>
  );
}

export default observer(App);
