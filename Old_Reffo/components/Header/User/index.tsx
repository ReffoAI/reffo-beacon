import cn from "classnames";
import styles from "./User.module.sass";
import { useNavigate } from "react-router-dom";
import { defaultImage } from "../../../constants/misc";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";


const User = ({ className }: { className: string }) => {
    const navigate = useNavigate();

    const user = useSelector((state: RootState) => state.user.user);


    return (
        <div
            className={cn(styles.user, className)}
        >
            <button
                className={styles.head}
                onClick={() => navigate('/account')}
            >
                <img src={(user as any)?.photo_url || defaultImage} alt="Avatar" />
            </button>

        </div>
    );
};

export default User;
