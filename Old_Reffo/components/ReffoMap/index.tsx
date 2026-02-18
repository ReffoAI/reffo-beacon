import { useSelector } from "react-redux";
import styles from "./ReffoMap.module.sass";
import { RootState } from "../../redux/store";
import GoogleMap from 'google-maps-react-markers'
import { useRef, useState } from "react";
import Slider from "react-slick";
import Card from "../Card";
import ReffoIcon from '/src/assets/reffo_icon.svg'




const ReffoMap = () => {

  const mapRef = useRef(null)
  let sliderRef = useRef(null);
  const [mapReady, setMapReady] = useState(false)
  const [cardsList, setCardsList] = useState([])
  // const [movedLocation, setMovedLocation] = useState(null)
  const locationDetails = useSelector((state: RootState) => state.reffo.currentLocation)
  const fetchedReffos = useSelector((state: RootState) => state.reffo.reffoList)
  const selectedCategory = useSelector((state: RootState) => state.reffo.selectedCategory)
  const selectedSearchType = useSelector((state: RootState) => state.misc.selectedSearchType)

  const filteredList = fetchedReffos.filter((reffo) => ((reffo.type === selectedSearchType || !selectedSearchType) && !selectedCategory) ||
    (selectedCategory && reffo.categories && reffo.categories.filter((cat: string) => cat.toLowerCase() === selectedCategory).length !== 0)
  )

  console.warn("FilteredList", filteredList)
  const defaultProps = {
    center: {
      lat: locationDetails.lat,
      lng: locationDetails.lng
    },
    zoom: 11,
    fullscreenControl: false,
    // zoomControl: false,
    streetViewControl: false,
    disableDefaultUI: false,
    mapTypeControl: false
  };


  const onGoogleApiLoaded = ({ map }: { map: any, maps: any }) => {
    mapRef.current = map;
    setMapReady(true);
  };

  const onMarkerClick = (reffo: any, index: number) => {
    console.warn("Selected is  ", reffo.locationID);

    const reffosAtLocation = filteredList.filter((r) => r.locationID === reffo.locationID);

    if (sliderRef.current) {
      (sliderRef.current as any).slickGoTo(index);
    }

    if (mapRef.current) {
      const map = mapRef.current as google.maps.Map;
      const offsetX = 0; // Adjust this value to your needs
      const offsetY = 100; // Adjust this value to your needs

      // Get the current projection from the map
      const projection = map.getProjection();
      if (projection) {
        // Convert LatLng to a Point
        const currentPoint = projection.fromLatLngToPoint(new google.maps.LatLng(reffo.loc.latitude, reffo.loc.longitude)) as any;

        // Calculate new point with the offset
        const scale = Math.pow(2, (map as any)?.getZoom());
        const newPoint = new google.maps.Point(
          (currentPoint.x * scale + offsetX) / scale,
          (currentPoint.y * scale + offsetY) / scale
        );

        // Convert the point back to LatLng
        const newCenter = projection.fromPointToLatLng(newPoint) as any;
        map.panTo(newCenter);
      }
    }
    setCardsList(reffosAtLocation as any);
  };


  // const getReffosInLocation = () => {
  //   console.warn("movedLocation", movedLocation.bounds.getNorthEast())
  //   const bounds = movedLocation.bounds
  //   const ne = bounds.getNorthEast(); // Returns LatLng object for northeast corner
  //   const sw = bounds.getSouthWest(); // Returns LatLng object for southwest corner

  //   // Convert LatLng objects to an object with more accessible properties
  //   const boundsObject = {
  //     north: ne.lat(), // Call .lat() to get latitude
  //     east: ne.lng(), // Call .lng() to get longitude
  //     south: sw.lat(),
  //     west: sw.lng()
  //   };

  //   console.warn("boundsObject", boundsObject)
  //   console.warn("boundss", getGeohashesForRectangle(boundsObject, 6))

  // }

  const panMapTo = async (idx: number) => {
    console.warn("idx", filteredList[idx].loc.latitude, filteredList[idx].loc.longitude)
    // const [lat, lng] = filteredList[idx].loc.coordinates

    if (mapRef.current) {
      (mapRef.current as google.maps.Map).setZoom(11);
      await new Promise((resolve) => setTimeout(resolve, 400));
      (mapRef.current as google.maps.Map).panTo({ lat: filteredList[idx].loc.latitude, lng: filteredList[idx].loc.longitude });
      (mapRef.current as google.maps.Map).setZoom(15);

    }

  }





  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    swipeToSlide: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    afterChange: (current: any) => panMapTo(current),

  };

  return (
    <div className={styles.container} >

      <GoogleMap
        apiKey={import.meta.env.VITE_FB_MAP_KEY}
        defaultCenter={defaultProps.center}
        defaultZoom={5}
        options={defaultProps}
        mapMinHeight="70vh"
        onGoogleApiLoaded={onGoogleApiLoaded}
        loadingContent={
          <div className={styles.loadingContainer}>
            <div>Loading...</div>
          </div>
        }
      // onChange={(map) => setMovedLocation(map)}
      >
        {mapReady && filteredList.map((reffo, index) => {
          return (

            <img
              key={index}
              src={ReffoIcon}
              lat={reffo.loc.latitude}
              lng={reffo.loc.longitude}
              style={{
                width: 30,
                height: 30,
                cursor: 'pointer'
              }}
              onClick={() => onMarkerClick(reffo, index)}
            />


          )
        })}


      </GoogleMap>
      {/* {movedLocation && (
        <div className={styles.overlay}>
          <div
            onClick={() => {
              getReffosInLocation()
            }}
            className="button-primary">
            Fetch Reffos
          </div>
        </div>
      )} */}
      {cardsList.length > 0 && (
        <div
          className={styles.mapCards}>

          <Slider
            ref={slider => {
              sliderRef = slider;
            }}
            {...settings}>
            {cardsList.map((item) => {
              return (
                <Card className={styles.card} item={item} />
              )
            })}
          </Slider>
        </div>
      )}


    </div>
  );
};

export default ReffoMap;
