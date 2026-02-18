import { useRef, useState } from "react";
import styles from "./UpdateAccount.module.sass";
import cn from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { defaultImage } from "../../../constants/misc";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { updateUserData } from "../../../services/user";
import { toast } from 'react-toastify';
import ReffoIcon from '/src/assets/reffo_icon.svg'



const UpdateAccount = ({ onClose }: {
  onClose: () => void
}) => {

  const user = useSelector((state: RootState) => state.user.user)
  const [inputValue, setInputValue] = useState((user as any)?.display_name || "Foodie")
  const [imagePreviewUrl, setImagePreviewUrl] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);


  const fileInputRef = useRef(null);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setImagePreviewUrl((e.target as any).result as string || null);
      };

      reader.readAsDataURL(file);  // Read the file as a data URL for preview purposes
    }
  };

  const handleUpload = async () => {
    const file = (fileInputRef.current as any).files[0];
    const uid = getAuth()?.currentUser?.uid || null;
    if (!file) return;
    if (!file.type.includes('image')) {
      toast.error("Please choose an image file")
      return;
    }
    if (!uid) {
      toast.error("User is not logged in")
      return;
    }
    if (file.size > 5000000) {
      toast.error("File size is too large. Please choose a file less than 5MB")
      return;
    }
    try {
      const storage = getStorage();
      const filePath = `users/${uid}/uploads/${new Date().getTime()}.png`;
      const storageReference = storageRef(storage, filePath);

      const uploadSnap = await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(uploadSnap.ref);
      console.log("Download URL:", downloadURL);
      return downloadURL;
    } catch (e) {
      console.error("Error uploading image:", e);
      toast.error("Error uploading image, please try again");
    }
  }


  const updateData = async () => {
    setLoading(true)
    try {
      let imageUrl = null
      //update user data
      if (imagePreviewUrl) {
        imageUrl = await handleUpload()
      }
      console.log("imageUrl", imageUrl)
      if (inputValue !== (user as any).display_name || imageUrl) {

        if (imageUrl) {
          updateUserData({ display_name: inputValue, photo_url: imageUrl })
        } else {
          updateUserData({ display_name: inputValue })
        }
      }
      setLoading(false)
      onClose()

    } catch (e) {
      setLoading(false)
    }

  }



  return (
    <div>
      <div className={styles.titleContainer}>
        <img src={ReffoIcon} />
        <div className={cn('h5', styles.title)}>Update Account</div>
      </div>
      <div className={styles.inputContainer}>
        <div className={styles.imageContainer}>
          <img src={(user as any)?.photo_url || defaultImage} className={styles.image} />
          <div className={styles.imageText}>
            Current
          </div>

        </div>

        <div
          onClick={() => {
            (fileInputRef.current as any).click();

          }}
          className={styles.imageContainer} style={{
            cursor: 'pointer'
          }}>

          {imagePreviewUrl ?
            <img src={imagePreviewUrl} className={styles.image} /> : (
              <div className={styles.image} />
            )}
          <div className={styles.imageText}>
            Choose New
          </div>

          <input
            ref={fileInputRef}
            onChange={handleFileChange}
            type="file" id="fileInput" style={{ display: 'none' }} accept="image/*" />

        </div>


      </div>
      <div>
        <input type="text" placeholder={"John Doe"}
          value={inputValue}
          className={styles.inputField}
          onChange={(e) => { setInputValue(e.target.value) }}
        />
      </div>


      <div className={styles.buttonsContainer}>

        <button className='button-black rectangle light'
          onClick={() => {
            onClose()
          }}
        >Cancel</button>
        <button className='button-stroke rectangle primary'
          disabled={loading}
          onClick={() => {
            updateData()
          }}
        >{loading ? "Updating Data" : "Save Changes"}</button>

      </div>

      <div className={styles.footerText}>
        *Changes may take a few minutes
      </div>
    </div>
  );

};

export default UpdateAccount;
