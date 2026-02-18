import { useState } from "react";
import styles from "./GuestCheckout.module.sass";
import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { purchaseSpecial, purchaseBday, purchaseReffo } from "../../../services/reffos";
import { isLoadingStripe } from "../../../redux/reffoReducer";
import { useAddOrUpdateQueryParam } from "../../../services/misc";
import { toast } from 'react-toastify';
import CheckboxIcon from '/src/assets/icons/checkbox.svg'
import CheckboxFilledIcon from '/src/assets/icons/checkbox-filled.svg'





const GuestCheckout = ({ onClose }: {
  onClose: () => void
}) => {
  const dispatch = useDispatch()
  const addOrUpdateQueryParam = useAddOrUpdateQueryParam();


  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const selectedReffo = useSelector((state: RootState) => state.reffo.reffoDetail)


  const validateEmail = () => {

    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(inputValue);
  }

  const processPayment = () => {
    onClose()

    if (selectedReffo.type === "special") {
      // purchaseBday(selectedReffo.id).then(res => {
      purchaseSpecial(selectedReffo.id).then(res => {
        console.warn("Success", res)

      }).catch(() => {
        toast.error("There was an error with the payment, please try again later.")

      }).finally(() => {
        dispatch(isLoadingStripe(false))
        addOrUpdateQueryParam("payment_guest", "success")

      })
    } else {
      purchaseReffo(selectedReffo.id, selectedReffo.stripeID, inputValue).then(res => {
        if (res.url)
          window.location.href = res.url
        else
          toast.error("There was an error with the payment, please try again later.")

      }).catch(() => {
        toast.error("There was an error with the payment, please try again later.")

      })
        .finally(() => {
          dispatch(isLoadingStripe(false))

        })
    }
  }


  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={cn('h5', styles.title)}>Would you like to check out as a guest?</div>
      </div>
      <div className={cn(styles.subtitle)}>No problem! Where would you like us to send your receipt?</div>

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
          disabled={!validateEmail() || !agreeToTerms}
          onClick={() => {
            processPayment()
          }}
        >Continue to checkout</button>
      </div>


      <div className={styles.footerText}>
        * If you like the service, you can create an account later. First, enjoy your Reffo!
      </div>

    </div>
  );

};

export default GuestCheckout;
