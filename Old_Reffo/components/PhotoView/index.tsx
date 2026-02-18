/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import OutsideClickHandler from "react-outside-click-handler";
import cn from "classnames";
import styles from "./PhotoView.module.sass";
import Icon from "../Icon";
import Slider from "react-slick";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }: { currentSlide?: number, slideCount?: number, children: React.ReactNode }) => (
  <button {...props}>{children}</button>
);

const PhotoView = ({ initialSlide, visible, items, onClose }: {
  initialSlide: number,
  visible: boolean,
  items: any[],
  onClose: () => void
}) => {
  const [current, setCurrent] = useState(initialSlide);

  const escFunction = useCallback(
    (e: { keyCode: number; }) => {
      if (e.keyCode === 27) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [escFunction]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible) {
      disableBodyScroll(scrollRef.current!);
    } else {
      enableBodyScroll(scrollRef.current!);
    }
  }, [visible]);

  useEffect(() => {
    setCurrent(initialSlide);
  }, [initialSlide]);

  const settings = {
    initialSlide: initialSlide,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
  };

  const handleAfterChange = (e: React.SetStateAction<number>) => {
    setCurrent(e);
  };

  return createPortal(
    visible && (
      <div className={styles.modal} ref={scrollRef}>
        <div className={styles.outer}>
          <OutsideClickHandler onOutsideClick={onClose}>
            <div className={styles.container}>
              <div className={styles.control}>
                <div />
                {/* <Link
                  to="/full-photo"
                  className={cn("button-stroke button-small", styles.button)}
                  onClick={onClose}
                >
                  <Icon name="image" size="16" />
                  <span>Show all photos</span>
                </Link> */}
                <div className={styles.counter}>
                  {current + 1}/{items.length}
                </div>
                <div className={styles.btns}>
                  <button
                    className={cn(
                      "button-circle-stroke button-small",
                      styles.button
                    )}
                    onClick={() => {
                      enableBodyScroll(scrollRef.current!);
                      onClose();
                    }}
                  >
                    <Icon name="close" size="24" />
                  </button>
                </div>
              </div>
              <div className={styles.wrapper}>
                <Slider
                  className="photo-slider"
                  afterChange={handleAfterChange}
                  {...settings}
                >
                  {items.map((x, index) => (
                    <div className={styles.slide} key={index}>
                      <div className={styles.preview}>
                        <img src={x} alt="Gallery" />
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          </OutsideClickHandler>
        </div>
      </div>
    ),
    document.body
  );
};

export default PhotoView;
