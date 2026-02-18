import cn from "classnames";
import styles from "./Notification.module.sass";
import Icon from "../../Icon";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";


const Notification = ({ className }: { className: string }) => {
  const navigate = useNavigate();

  const notificationSeen = useSelector((state: RootState) => state.user.notificationSeen)

  return (
    <div
      className={cn(styles.notification, className)}
    >
      <button
        className={cn(styles.head,
          { [styles.active]: !notificationSeen }
        )}
        onClick={() => navigate("/account?tab=notification")}
      >
        <Icon name="notification" size="20" />
      </button>
    </div >
  );
};

export default Notification;
