import { useState } from "react";
import styles from "./Favorites.module.sass";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toggleLocationFavorite } from "../../services/location";
import OptionIcon from '/src/assets/icons/option.svg'
import DeleteIcon from '/src/assets/icons/delete.svg'





const Favorites = () => {

  const [visible, setVisible] = useState(false);
  const favoritesList = useSelector((state: RootState) => state.user.favoriteLocations)
  const locations = useSelector((state: RootState) => state.location.locations)
  const [selectedLocation, setSelectedLocation] = useState<null | string>(null)


  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>

      <div>
        <table className={styles.favoriteTable}>
          <thead>
            <tr>
              <th>Message Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(favoritesList).map((favorite, index) => {

              const locationDetails = locations[favorite.split("-")[0] + "-" + favorite.split("-")[1]]

              return (
                <tr key={index}>
                  <td className={styles.flexData}>
                    {locationDetails.location_photo && (
                      <img src={locationDetails.location_photo} />
                    )}
                    <div className={styles.messageContent}>
                      <div><b>{locationDetails.helpfulName}</b></div>
                    </div>
                  </td>

                  <td className={styles.action}>

                    <div
                      className={cn(styles.popup, {
                        [styles.active]: visible && selectedLocation === favorite,
                      })}
                    >
                      <img
                        onClick={() => {
                          setVisible(!visible)
                          setSelectedLocation(favorite)

                        }}
                        src={OptionIcon} className={styles.actionButton} />




                      <div className={styles.body}>
                        <div className={styles.group}>
                          <div className={styles.menu}>
                            <div
                              className={cn(styles.item)}
                              onClick={() => {
                                setVisible(!visible)
                                toggleLocationFavorite(favorite.split("-")[0], favorite.split("-")[1], false)
                              }}
                            >
                              <div className={styles.text}>
                                Remove from favorites
                              </div>
                              <div className={styles.icon}>
                                <img src={DeleteIcon} />
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>


                  </td>
                </tr>
              )


            })
            }



          </tbody>
        </table>


        <div className={styles.footer}>
          {Object.keys(favoritesList).length === 0 && (
            "You don't have any favorites"
          )}
        </div>
      </div>
    </OutsideClickHandler>
  );

};

export default Favorites;
