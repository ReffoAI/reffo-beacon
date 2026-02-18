import { useState } from "react";
import styles from "./AccountAction.module.sass";
import cn from "classnames";
import { generatePin } from "../../../services/misc";
import PinInput from 'react-pin-input';
import { deleteAccount } from "../../../services/user";
import { toast } from 'react-toastify';




const AccountAction = ({ onClose }: {
  onClose: () => void
}) => {
  const [inputValue, setInputValue] = useState("")
  const [randomPin] = useState(generatePin())


  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={cn('h5', styles.title)}>Do you want to delete your account</div>
      </div>
      <div className={cn(styles.subtitle)}>Confirm by entering <b>{randomPin}</b> as the pin</div>


      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
      }}>
        <PinInput
          length={4}
          initialValue={inputValue}
          onChange={(value) => {
            setInputValue(value)
          }}
          type="numeric"
          inputMode="number"
          style={{ padding: '10px' }}
          inputStyle={{ borderColor: '#B1B5C3', borderRadius: 5 }}
          inputFocusStyle={{ borderColor: '#353945' }}
          autoSelect={true}
          regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
        />
      </div>


      <div className={styles.buttonsContainer}>
        <button className='button-danger rectangle bold'
          disabled={inputValue !== String(randomPin)}
          onClick={() => {
            onClose()
            deleteAccount().catch((e) => {
              console.error("Error deleting account:", e)
              toast.error("Error deleting account, please try again later.")
            })
          }}
        >Delete Account</button>
      </div>


      <div className={styles.footerText}>
        * This action is irreversible
      </div>

    </div>
  );

};

export default AccountAction;
