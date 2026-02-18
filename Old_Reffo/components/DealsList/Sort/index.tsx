import { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Sort.module.sass";
import { setSortBy } from "../../../redux/reffoReducer";
import { fetchReffos } from "../../../services/reffos";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import SortIcon from '/src/assets/icons/sort.svg'

const Sort = ({ items }: { items: any[] }) => {
  const dispatch = useDispatch()
  const sortBy = useSelector((state: RootState) => state.reffo.sortBy)
  const [visible, setVisible] = useState(false);

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div
        className={cn(styles.sort, {
          [styles.active]: visible,
        })}
      >
        <button
          className={styles.sortButton}
          onClick={() => setVisible(!visible)}
        >
          <img src={SortIcon} alt="Sort" />
          Sort by <span>{items[0].menu.filter((item: any) => item.id === sortBy)?.[0]?.title || "newest"}</span>
        </button>
        <div className={styles.body}>
          {items.map((item: { menu: { id: string, icon: string, title: string }[] }, index: number) => (
            <div className={styles.menu} key={index}>
              {item.menu.map((x: { id: string, icon: string, title: string }, index: number) => (
                <div
                  className={cn(styles.item)}
                  onClick={() => {
                    setVisible(!visible)
                    dispatch(setSortBy(x.id))
                    fetchReffos()

                  }}
                  key={index}
                >
                  <div className={styles.icon}>
                    <img src={x.icon} />
                  </div>
                  <div className={styles.text}>
                    {x.title}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </OutsideClickHandler>
  );
};

export default Sort;
