import cn from "classnames";
import styles from "./DealsList.module.sass";
import Card from "../Card";
import Sort from "./Sort";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { fetchReffos } from "../../services/reffos";
import Skeleton from "react-loading-skeleton";
import sortIcon from '/src/assets/icons/sort1.svg'
import { useEffect, useRef } from "react";

const sortItems = [
  {
    menu: [
      {
        title: "Expiring Soon",
        icon: sortIcon,
        id: "expiring"
      },
      {
        title: "Quantity Remaining",
        icon: sortIcon,
        id: "quantity",
      },
      {
        title: "Newest",
        icon: sortIcon,
        id: "newest",
      },
      {
        title: "Oldest",
        icon: sortIcon,
        id: "oldest",
      },
    ],
  }
];



const DealsList = () => {
  const listRef = useRef(null);

  const isLoading = useSelector((state: RootState) => state.reffo.loading)
  const reffos = useSelector((state: RootState) => state.reffo.reffoList)
  const endOfList = useSelector((state: RootState) => state.reffo.endOfList)
  const selectedCategory = useSelector((state: RootState) => state.reffo.selectedCategory)
  const currentLocation = useSelector((state: RootState) => state.reffo.currentLocation)
  const stickySearch = useSelector((state: RootState) => state.misc.stickySearch)
  const selectedSearchType = useSelector((state: RootState) => state.misc.selectedSearchType)

  const filteredList = reffos.filter((reffo) => ((reffo.type === selectedSearchType || !selectedSearchType) && !selectedCategory) ||
    (selectedCategory && reffo.categories && reffo.categories.filter((cat: string) => cat.toLowerCase() === selectedCategory).length !== 0)
  )


  useEffect(() => {
    const updateWidth = () => {
      if (!listRef.current) return;

      // Reset the container width to `auto` to allow reflow
      (listRef.current as HTMLElement).style.width = 'auto';

      let maxWidth = 0;
      let currentRowWidth = 0;
      let lastOffsetTop = (listRef.current as any).firstChild?.offsetTop;

      const children = Array.from((listRef.current as any).children);
      children.forEach((child, index) => {
        const margin = parseInt(window.getComputedStyle(child as Element).marginLeft) + parseInt(window.getComputedStyle(child as Element).marginRight);
        const childWidth = (child as any).offsetWidth + margin;

        if ((child as any)?.offsetTop > lastOffsetTop) {
          //new row          
          maxWidth = Math.max(maxWidth, currentRowWidth); // Update the maxWidth if the current row width is greater
          currentRowWidth = childWidth; // Reset row width for the new row
          lastOffsetTop = (child as any)?.offsetTop; // Update the last known top offset
        } else {
          // Accumulate width in the current row
          currentRowWidth += childWidth;
        }

        // Final update for the last row in the loop
        if (index === children.length - 1) {
          maxWidth = Math.max(maxWidth, currentRowWidth);
        }
      });

      // Set the container width to the widest row after calculations
      (listRef.current as HTMLElement).style.width = `${maxWidth}px`;
    };

    updateWidth();
    window.addEventListener('resize', updateWidth); // Ensure width updates on resize
    return () => window.removeEventListener('resize', updateWidth);
  }, [filteredList]);



  return (
    <div className={cn(styles.containerDefault, {
      [styles.container]: stickySearch
    })}>
      <div className={styles.listHeader}>
        <div className={styles.dealCount}>
          {filteredList.length} deals in {currentLocation.name}
        </div>

        <Sort items={sortItems} />
      </div>

      <div className={styles.list} ref={listRef}>
        {isLoading && Array(12).fill(0).map(() => {
          return (
            <div className={styles.skeletonCard}>
              <Skeleton className={styles.skeletonCardHeader} />
              <Skeleton count={2} className={styles.skeletonCardBody} />
            </div>
          )
        })}

        {/* <Card className={styles.card} item={{}} isDream /> */}

        {filteredList.map((item) => (
          <Card className={styles.card} item={item} />
        ))}

      </div>
      <div className={styles.loadMoreContainer}>

        {!endOfList && (
          <div
            onClick={() => {
              fetchReffos()
            }}
            className={cn(
              "button-black button-small",
              styles.loadMoreButton,
            )}
          >
            Load more deals
          </div>
        )}
      </div>

    </div>
  );
};

export default DealsList;
