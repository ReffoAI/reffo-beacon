import styles from "./SocialShare.module.sass";
import cn from "classnames";
import { toast } from 'react-toastify';
import GlobeIcon from '/src/assets/icons/globe.svg'
import ClipboardIcon from '/src/assets/icons/clipboard.svg'
import TwitterIcon from '/src/assets/icons/twitter.svg'
import FacebookIcon from '/src/assets/icons/facebook.svg'
// import InstaIcon from '/src/assets/icons/insta.svg'


const SocialShare = ({ id }: {
  id: string
}) => {
  const currentBaseURL = window.location.origin;


  const url = `${currentBaseURL}/reffos/${id}`

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) {
        toast.error('Clipboard copy not supported');

        return;
      }
      await navigator.clipboard.writeText(url);
    } catch (error) {
      toast.error('Clipboard copy not supported');

    }
  };

  const shareTwitter = () => {
    const tweet = "ReffO"
    const modifiedUrl = "https://twitter.com/intent/tweet?url=" + url + "&text=" + tweet;
    window.open(modifiedUrl, '_blank', 'noopener,noreferrer');

  }

  const shareFacebook = () => {
    const modifiedUrl = "https://www.facebook.com/sharer.php?u=" + url;
    window.open(modifiedUrl, '_blank', 'noopener,noreferrer');

  }



  return (
    <div>
      <div className={cn('h5', styles.title)}>Share on social</div>
      <div>If you’re happy and on social, shout us out 👏 👏</div>

      <div className={styles.shareContainer}>

        <img src={GlobeIcon} alt="Globe" className={styles.globeIcon} />
        <div className={styles.linkText}>
          {url}
        </div>
        <div
          onClick={() => {
            handleCopy()
          }}
          className={styles.button}>
          <img src={ClipboardIcon} />
        </div>
      </div>


      <div className={styles.socialButtons}>
        <div
          onClick={shareTwitter}
          className={styles.button}>
          <img src={TwitterIcon} />
        </div>
        {/* 
        <div className={styles.button}>
          <img src={InstaIcon} />
        </div> */}

        <div
          onClick={shareFacebook}
          className={styles.button}>
          <img src={FacebookIcon} />
        </div>


      </div>


    </div>
  );

};

export default SocialShare;
