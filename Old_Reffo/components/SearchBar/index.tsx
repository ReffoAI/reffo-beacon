import React, { useEffect, useRef, useState } from "react";
import cn from "classnames";
import styles from "./SearchBar.module.sass";

import { Libraries, useLoadScript, } from '@react-google-maps/api';
import OutsideClickHandler from "react-outside-click-handler";
import { computeDistanceBetween } from 'spherical-geometry-js';
import { useDispatch, useSelector } from "react-redux";
import { clearSearchConfigs, setLocation } from "../../redux/reffoReducer";
import { fetchReffos } from "../../services/reffos";
import { setSelectedSearchType, setStickySearch } from "../../redux/miscReducer";
import { RootState } from "../../redux/store";
import SearchIcon from '/src/assets/icons/search.svg'
import CloseIcon from '/src/assets/icons/close.svg'

const libraries: Libraries = ['places'];

const categoryItems = [
  { name: "Show all", id: "showall" },
  { name: "Deals", id: "deal" },
  { name: "Experiences", id: "experience" },
  // { name: "Birthday Deals", id: "bday" },
  { name: "Specials", id: "special" },
]

const SearchBar = () => {
  const [visible, setVisible] = useState(false);
  // const [isSticky, setSticky] = useState(false);
  const isSticky = useSelector((state: RootState) => state.misc.stickySearch)
  const selectedSearchType = useSelector((state: RootState) => state.misc.selectedSearchType)

  const dispatch = useDispatch()

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_FB_MAP_KEY,
    libraries
  });

  const placesService = useRef(null);
  const autocompleteInputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState("Raleigh");
  const [localCoords, setLocalCoords] = useState({ lat: 35.7795897, lng: -78.6381787, name: 'Raleigh' });
  const [radiusInKm, setRadiusInKm] = useState(26.16);
  let autocompleteService: google.maps.places.AutocompleteService | null = null

  useEffect(() => {
    if (isLoaded) {
      initializeAutocomplete();
    }
  }, [isLoaded]);

  const initializeAutocomplete = () => {
    autocompleteService = new window.google.maps.places.AutocompleteService();
    if (autocompleteInputRef.current) {
      (autocompleteInputRef.current as any).addEventListener('input', handleInput);
    }

    (placesService.current as any) = new window.google.maps.places.PlacesService(autocompleteInputRef.current as any);

  };

  const handleInput = () => {
    const value = (autocompleteInputRef.current as any)?.value;
    setInputValue(value || "");
    if (value.length > 3 && autocompleteService) {
      autocompleteService.getPlacePredictions({
        input: value,
        types: ['(cities)'],
        componentRestrictions: { country: 'US' }
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(results as any);
          setVisible(true)
          console.warn(results)
        }
      });
    } else {
      setSuggestions([]);
    }
  };


  const selectSuggestion = (placeId: any) => {
    if (!placesService.current) return;

    (placesService.current as google.maps.places.PlacesService).getDetails({ placeId: placeId }, (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        console.log("Selected place:", place);
        setInputValue(place?.name || "");
        setSuggestions([]);
        if (place.geometry && place.geometry.location) {
          console.log("Coordinates:", place.geometry.location.lat(), place.geometry.location.lng());


          if (place.geometry.viewport) {
            const bounds = place.geometry.viewport;
            const center = place.geometry.location;
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const se = new google.maps.LatLng(sw.lat(), ne.lng());
            const nw = new google.maps.LatLng(ne.lat(), sw.lng());

            // Calculate approximate radius
            const radiusNE = computeDistanceBetween(center, ne);
            const radiusSW = computeDistanceBetween(center, sw);
            const radiusSE = computeDistanceBetween(center, se);
            const radiusNW = computeDistanceBetween(center, nw);
            const approxRadius = Math.max(radiusNE, radiusSW, radiusSE, radiusNW) / 1000; // in kilometers


            console.log("Approximate radius of the city in km:", approxRadius);
            setRadiusInKm(approxRadius);
            setLocalCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), name: place.name! });



            dispatch(clearSearchConfigs())
            dispatch(setLocation({
              location: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), name: place.name! },
              radius: approxRadius
            }))
            fetchReffos()
          }
        }
      }
    });
  };


  const handleScroll = () => {
    const headerElement = document.getElementById('webHeader');
    const headerHeight = headerElement ? headerElement.offsetHeight : 0;
    const scrollPosition = window.scrollY;

    //Avoiding sticking in header for small screens
    const width = window.innerWidth;
    if (width <= 768) {
      dispatch(setStickySearch(false))

      return;
    }

    dispatch(setStickySearch(scrollPosition > headerHeight))
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>

      <div className={cn(styles.container, {
        [styles.sticky]: isSticky
      })}>
        <div>
          {!isSticky && (
            <div className={styles.categoryContainer}>
              {categoryItems.map((item) => (
                <div className={cn(styles.category, {
                  [styles.active]: selectedSearchType === item.id || (selectedSearchType === null && item.id === 'showall')
                })} onClick={() => {
                  if (item.id === 'showall') {
                    dispatch(setSelectedSearchType(null))
                  } else {
                    dispatch(setSelectedSearchType(item.id))
                  }
                  dispatch(clearSearchConfigs())
                  fetchReffos()

                }}>
                  {item.name}
                </div>
              ))}
            </div>
          )}
          <div
            className={cn(styles.popup, {
              [styles.active]: visible,
            })}
          >

            <div
              className={cn(styles.searchContainer)}
            >
              <div
                className={styles.searchInputHolder}>
                <label htmlFor="searchInput">
                  Location
                </label>
                <input
                  ref={autocompleteInputRef}
                  id="searchInput"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Please enter your location"

                />

              </div>
              {inputValue.length > 0 && (
                <img
                  onClick={() => {
                    setInputValue('')
                    setSuggestions([])
                  }}
                  src={CloseIcon} alt="close"
                  className={styles.closeButton} />
              )}


              <div
                onClick={() => {
                  dispatch(clearSearchConfigs())
                  dispatch(setLocation({
                    location: localCoords,
                    radius: radiusInKm
                  }))
                  fetchReffos()
                }}

                className={styles.searchButton}>
                <img src={SearchIcon} alt="Search" />

              </div>

            </div>




            <div className={styles.body}>


              {suggestions.map((item, index) => (
                <div
                  className={cn(styles.item)}
                  onClick={() => {
                    selectSuggestion((item as google.maps.places.AutocompletePrediction).place_id)
                    setVisible(!visible)


                  }}
                  key={index}
                >
                  <div className={styles.text}>
                    {(item as google.maps.places.AutocompletePrediction).description}
                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>


      </div>
    </OutsideClickHandler>
  );
};

export default SearchBar;
