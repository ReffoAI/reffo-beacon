import { useState } from "react";
import styles from "./LinkSocial.module.sass";
import cn from "classnames";
import { updateUserData } from "../../../services/user";
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import TwitterIcon from '/src/assets/icons/twitter.svg'
import FacebookIcon from '/src/assets/icons/facebook.svg'
import InstaIcon from '/src/assets/icons/insta.svg'
import CloseIcon from '/src/assets/icons/close.svg'




const LinkSocial = ({ type, onClose }: {
  type: string
  onClose: () => void
}) => {

  const user = useSelector((state: RootState) => state.user.user)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState(user?.[type + "Url"] || "")

  const typeList = {
    "x": {
      name: "X",
      icon: TwitterIcon,
      placeholder: "https://x.com/reffo"
    },
    "fb": {
      name: "Facebook",
      icon: FacebookIcon,
      placeholder: "https://facebook.com/reffo"
    },
    "insta": {
      name: "Instagram",
      icon: InstaIcon,
      placeholder: "https://instagram.com/reffo"
    },
  }
  return (
    <div>
      <div className={cn('h5', styles.title)}>Add a link to your {typeList[type as keyof typeof typeList].name} account</div>

      <div className={styles.inputContainer}>
        <img src={typeList[type as keyof typeof typeList].icon} alt={typeList[type as keyof typeof typeList].name} className={styles.socialIcon} />
        <input type="text" placeholder={typeList[type as keyof typeof typeList].placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.inputField} />
        <img
          onClick={() => setInputValue('')}
          src={CloseIcon} alt="close"
          className={styles.closeButton} />

      </div>


      <div className={styles.buttonsContainer}>

        <button
          onClick={() => {
            onClose()
          }}
          className='button-black rectangle light'>Cancel</button>
        <button
          onClick={async () => {
            setIsLoading(true)

            if (inputValue.length > 0) {
              await updateUserData({ [type + "Url"]: inputValue })
              toast.success("Account linked successfully.")
              onClose()
            } else {

              onClose()

            }
            setIsLoading(false)

          }}
          className='button-stroke rectangle primary'>{isLoading ? "Updating" : "Link Account"}</button>

      </div>
    </div>
  );

};

export default LinkSocial;
