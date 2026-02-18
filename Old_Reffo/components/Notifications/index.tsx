import { useSelector } from "react-redux";
import styles from "./Notifications.module.sass";
import { RootState } from "../../redux/store";
import moment from "moment";




const Notifications = () => {

  const notifications = useSelector((state: RootState) => state.user.notifications)



  return (
    <div>
      <table className={styles.notificationTable}>
        <thead>
          <tr>
            <th>Message Details</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>

          {notifications.map((notification, index) => {
            return (
              <tr key={index}>
                <td className={styles.flexData}>
                  {(notification as any).image && (
                    <img src={(notification as any).image} />

                  )}
                  <div className={styles.messageContent}>
                    <div><b>{(notification as any).title}</b></div>
                    <div>{(notification as any).body}</div>
                  </div>
                </td>

                <td>
                  <div>
                    {(notification as any).status}
                  </div>
                  <div>
                    Received {moment((notification as any).dts.toDate()).format("L @ LT")}
                  </div>
                </td>
              </tr>

            )
          })}

        </tbody>
      </table>
      {/* <div className={styles.footer}>
        <div className={"button-black"} >
          Load older notifications
        </div>
      </div> */}
      <div className={styles.footer}>
        {notifications.length === 0 && (
          "You don't have any notifications."
        )}
      </div>
    </div>
  );

};

export default Notifications;
