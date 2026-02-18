import styles from "./ImageCarousel.module.sass";
import cn from "classnames";
import { useCallback, useState } from "react";
import PhotoView from "../PhotoView";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ZoomIcon from '/src/assets/icons/zoom.svg'

const ImageCarousel = ({ images }: { images: string[] }) => {

  const isLoading = useSelector((state: RootState) => state.reffo.loading)

  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const numberOfImages = images.length


  let secondaryImgSize = 576 / (numberOfImages - 1)
  if (numberOfImages === 2) {
    secondaryImgSize = 600
  }


  const openImageViewer = useCallback((index: number) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);



  return (
    <div className={cn(styles.container, {
      [styles.twoPics]: numberOfImages === 2
    })}>
      <div className={cn(styles.primaryImageContainer, {
        [styles.splitContainer]: numberOfImages === 2
      })}>
        {!isLoading ? <img
          onClick={() => {
            openImageViewer(0)
          }}
          src={images[0]} className={styles.primaryImage} /> : <Skeleton className={styles.primaryImage} />}
        <div className={styles.zoomIcon} onClick={() => {
          openImageViewer(0)
        }} >
          <img src={ZoomIcon} />

        </div>
      </div>
      {images.length > 1 && (
        <div
          className={styles.secondaryImageContainer}>
          {isLoading && (
            <Skeleton className={styles.secondaryImage}
              style={{
                height: 600,
              }}
            />
          )}
          {images.slice(1).map((image, index) => (
            <img
              onClick={() => {
                openImageViewer(index + 1)
              }}
              key={index} src={image}
              className={styles.secondaryImage}
              style={{
                height: secondaryImgSize,
              }} />
          ))}


        </div>
      )}


      <PhotoView
        initialSlide={currentImage}
        visible={isViewerOpen}
        items={images}
        onClose={() => setIsViewerOpen(false)}
      />

    </div>
  );
};

export default ImageCarousel;
