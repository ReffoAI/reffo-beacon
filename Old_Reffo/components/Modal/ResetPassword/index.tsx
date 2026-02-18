import { useState } from "react";
import styles from "./ResetPassword.module.sass";
import cn from "classnames";
import { resetPassword } from "../../../services/misc";
import ReffoIcon from "/src/assets/reffo_icon.svg"



const ResetPassword = ({ onClose }: {
  onClose: () => void
}) => {

  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRequest = async () => {
    setLoading(true)
    try {
      await resetPassword(inputValue)
      onClose()
      setLoading(false)

    } catch (e) {
      setLoading(false)
      setError((e as any).message)
    }

  }



  return (
    <div>
      <div className={styles.titleContainer}>
        <img src={ReffoIcon} />
        <div className={cn('h5', styles.title)}>Reset Password</div>
      </div>
      <div className={styles.inputContainer}>
        <input value={inputValue}
          placeholder="Enter your email address"
          onChange={(e) => {
            setInputValue(e.target.value)
            setError(null)
          }
          }
        />

      </div>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}


      <div className={styles.buttonsContainer}>
        <button className='button-black rectangle light'
          onClick={() => {
            onClose()
          }}
        >Cancel</button>
        <button className='button-stroke rectangle primary'
          disabled={loading}
          onClick={() => {
            generateRequest()
          }}
        >{loading ? "Processing" : "Reset Password"}</button>
      </div>


    </div>
  );

};

export default ResetPassword;
