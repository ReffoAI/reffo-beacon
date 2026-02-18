import styles from "./Content.module.sass";



const Content = ({ text, onClose }: {
  text: string,
  onClose: () => void
}) => {


  return (
    <div className={styles.container}>
      <div className={styles.text}>
        {text}
      </div>
      <div className={styles.buttonContainer}>
        <div onClick={onClose} className="button-black">
          Close Modal
        </div>
      </div>
    </div>
  );

};

export default Content;
