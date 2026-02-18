import React, { useEffect, useState } from "react";
import styles from "./ToggleView.module.sass";
import { useSearchParams } from "react-router-dom";
import ListIcon from '/src/assets/icons/list.svg'
import GlobeIcon from '/src/assets/icons/globe.svg'


const ToggleView = () => {

  const [currentQueryParameters, setSearchParams] = useSearchParams();


  const [selectedViewType, setSelectedViewType] = useState(currentQueryParameters.get("view") || 'list');

  useEffect(() => {
    setSearchParams({ ...currentQueryParameters, view: selectedViewType });
  }, [selectedViewType]);

  if (selectedViewType === 'map') {
    return (
      <div
        onClick={() => setSelectedViewType('list')}
        className={styles.container}>
        <img src={ListIcon} alt="List View" />
        <div>
          List View
        </div>
      </div>
    );
  } else {
    return (
      <div
        onClick={() => setSelectedViewType('map')}
        className={styles.container}>
        <img src={GlobeIcon} alt="Map View" />
        <div>
          Map View
        </div>
      </div>
    );
  }
};

export default ToggleView;
