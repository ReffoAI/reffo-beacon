import React, { useState } from "react";
import cn from "classnames";
import styles from "./Language.module.sass";
import OutsideClickHandler from "react-outside-click-handler";
import { Link } from "react-router-dom";
import Icon from "../../Icon";

const Language = ({ className, items }) => {
  const [visible, setVisible] = useState(false);

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div
        className={cn(className, styles.language, { [styles.active]: visible })}
      >
        <button className={styles.head} onClick={() => setVisible(!visible)}>
          <Icon name="globe" size="16" />
          <div className={styles.text}>Language</div>
        </button>
        <div className={styles.body}>
          <div className={styles.list}>
            {items.map((x, index) => (
              <Link
                className={cn(styles.item, { [styles.active]: index === 0 })}
                key={index}
                to={x.url}
              >
                <div className={styles.title}>{x.title}</div>
                <div className={styles.country}>{x.country}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default Language;
