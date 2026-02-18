import { useState } from "react";
import styles from "./Support.module.sass";
import cn from "classnames";
import { generateSupportRequest } from "../../../services/misc";
import { toast } from 'react-toastify';
import ReffoIcon from '/src/assets/reffo_icon.svg'




const Support = ({ onClose }: {
  onClose: () => void
}) => {

  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false);





  const generateRequest = async () => {
    setLoading(true)
    try {
      await generateSupportRequest(inputValue)
      toast.success("Support request sent successfully")
      setLoading(false)
      onClose()

    } catch (e) {
      setLoading(false)
      toast.error((e as any).message)
    }

  }



  return (
    <div>
      <div className={styles.titleContainer}>
        <img src={ReffoIcon} />
        <div className={cn('h5', styles.title)}>Talk to us</div>
      </div>
      <div className={styles.inputContainer}>
        <textarea maxLength={500} value={inputValue}
          placeholder="Add a body here that you want to tell us about. Max characters of 500. Cannot be empty, can’t submit more than once a minute."
          onChange={(e) =>
            setInputValue(e.target.value)
          }
        />
      </div>

      <div className={styles.buttonsContainer}>
        <button className='button-stroke rectangle primary'
          disabled={loading}
          onClick={() => {
            generateRequest()
          }}
        >{loading ? "Generating Ticket" : "Send Message"}</button>
      </div>


    </div>
  );

};

export default Support;
