import { useState } from "react";
import styles from "./CreateAccount.module.sass";
import cn from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { signupUser } from "../../../services/user";
import CheckboxIcon from '/src/assets/icons/checkbox.svg'
import CheckboxFilledIcon from '/src/assets/icons/checkbox-filled.svg'




const CreateAccount = ({ onClose, type = 0 }: {
  onClose: () => void,
  type?: number
}) => {
  const isLoading = useSelector((state: RootState) => state.user.loading)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false)


  const validateEmail = () => {

    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  }

  const createAccount = () => {

    signupUser(email, password, password).then(() => {
      onClose()
    }).catch(err => {
      setError(err.message)

    })
  }

  return (
    <div className={styles.container}>
      {type === 0 ? (
        <>
          <div className={styles.titleContainer}>
            <div className={cn('h5', styles.title)}>Your deal confirmation has been sent to your email address.</div>
          </div>
          <div className={cn(styles.subtitle)}>If you would like to create an account, we can add your deal so you don’t loose it!</div>
        </>
      ) : (
        <>
          <div className={styles.titleContainer}>
            <div className={cn('h5', styles.title)}>Users get extra perks.</div>
          </div>
          <div className={cn(styles.subtitle)}>
            <li>Membership is free</li>
            <li>You control notifications</li>
            <li>Favorites, exclusives, and more</li>
          </div>
        </>
      )}


      <div className={styles.inputContainer}>
        <input value={email}
          placeholder="Enter your email address"
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }
          }
        />

        <input value={password}
          placeholder="Enter your password"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value)
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

      <div
        className={styles.termsContainer}
        onClick={() => {
          setAgreeToTerms(!agreeToTerms)
        }}>
        <img src={agreeToTerms ? CheckboxFilledIcon : CheckboxIcon} alt="Checkbox" />
        <div style={{
          marginLeft: 10
        }}>
          I have read and agree to the <a href="https://reffo.deals/terms" target="_blank" >terms of service</a>
        </div>

      </div>


      <div className={styles.buttonsContainer}>
        <button className='button-primary rectangle bold'
          disabled={!validateEmail() || !agreeToTerms || password.length === 0 || isLoading}
          onClick={() => {
            createAccount()
          }}
        >{isLoading ? "Loading" : "Create Account"}</button>

        <button className='button-black light rectangle bold'
          disabled={isLoading}
          onClick={() => {
            onClose()
          }}
        >Maybe Later</button>
      </div>


      <div className={styles.footerText}>
        *Add Legal Text Here
      </div>

    </div>
  );

};

export default CreateAccount;
