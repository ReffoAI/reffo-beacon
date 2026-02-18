import { useSelector } from "react-redux";
import styles from "./UserReffos.module.sass";
import { RootState } from "../../redux/store";
import moment from "moment";
import { useNavigate } from "react-router-dom";




const UserReffos = () => {

  const navigate = useNavigate()
  const myReffos = useSelector((state: RootState) => state.user.myReffos)

  return (
    <div>
      <table className={styles.reffosTable}>
        <thead>
          <tr>
            <th>Deposit</th>
            <th>Order details</th>
            <th>Claim number</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>

          {myReffos.map((item, index) => {
            return (
              <tr key={index} >
                <td>${(item as any).deposit}</td>
                <td
                  onClick={() => {
                    navigate("/reffos/" + (item as any)?.reffoIdWithoutPath)
                  }}
                  style={{ cursor: 'pointer' }}>
                  <div><b>{(item as any).offer}</b></div>
                  <div>{(item as any).rules}</div>
                </td>
                <td>${(item as any).pin}</td>
                <td>
                  <div>
                    {(item as any).status}
                  </div>
                  <div>
                    {/* March 4th, 2024 */}
                    {moment((item as any).timestamp.toDate()).format("MMM DD @ hh:mm a")}
                  </div>
                </td>
              </tr>
            )

          })
          }


        </tbody>
      </table>
      {/* <div className={styles.footer}>
        <div className={"button-black"} >
          Load more deals
        </div>
      </div> */}
      <div className={styles.footer}>
        {myReffos.length === 0 && (
          "You haven't claimed any deals yet"
        )}
      </div>
    </div>
  );

};

export default UserReffos;
