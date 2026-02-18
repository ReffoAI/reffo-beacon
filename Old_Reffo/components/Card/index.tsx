import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card.module.sass";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import moment from "moment";
import DealIcon from '/src/assets/types/deal.svg';
import ExpIcon from '/src/assets/types/exp.svg';
import BdayIcon from '/src/assets/types/bday.svg';
import SpecialIcon from '/src/assets/types/special.svg';
import GridIcon from '/src/assets/icons/grid.svg'
import RocketIcon from '/src/assets/icons/rocket.svg'
import Dream from '/src/assets/dream_bg.svg'

const getIcon = (type: string) => {
  if (type === "deal") {
    return DealIcon
  } else if (type === "experience") {
    return ExpIcon
  } else if (type === "bday" || type === "special") {
    return BdayIcon
  } else if (type === "dream") {
    return RocketIcon
  }
}

const getTypeText = (type: string) => {
  if (type === "deal") {
    return "Reffo Deal"
  } else if (type === "experience") {
    return "Experience"
  } else if (type === "bday") {
    return "Birthday"
  } else if (type === "special") {
    return "Special"
  }

}

const isWithinXHoursAndRound = (timeString: any, x: number) => {
  const givenTime = new Date(timeString?.toDate()).getTime();
  const currentTime = new Date().getTime();

  const difference = givenTime - currentTime;

  // Convert milliseconds to hours
  const hoursDifference = difference / (1000 * 60 * 60);

  if (hoursDifference > 0 && hoursDifference < x) {
    return Math.ceil(hoursDifference);
  } else {
    return 0;
  }
}

const getFooterRightComponent = (type: string, extraData: any) => {
  if (type === "deal" || type === "experience") {

    if (type === 'deal' && extraData.isPurchased) {
      return (
        <div className={styles.footerRightContainer}>
          <span>⏰</span>{moment(extraData.startTime.toDate()).fromNow()}
        </div>
      )
    }
    else if (type === "experience" && extraData.isPurchased) {
      return (
        <div className={styles.footerRightContainer}>
          Starts: {moment(extraData.startTime.toDate()).format("MMM DD, hh:mm a")}
        </div>
      )
    }

    //if limited coupons available
    if (extraData.remaining < 5 && extraData.remaining > 0 && !extraData.isPurchased) {
      return (
        <div className={styles.footerRightContainer}>
          <span>🔥</span> Only {extraData.remaining} left
        </div>
      )
    }
    //if about to expire
    else if (isWithinXHoursAndRound(extraData.endTime, 5) > 0) {
      const roundedHours = isWithinXHoursAndRound(extraData.endTime, 5);
      return (
        <div className={styles.footerRightContainer}>
          <span>⏳</span> {roundedHours} {roundedHours > 1 ? "hours" : "hour"} remaining
        </div>
      )
    }


  }
  // else if (type === "bday") {
  //   const bdayRange = extraData.bdayRange;
  //   let bdayRangeText = "";
  //   if (bdayRange === 1) {
  //     bdayRangeText = "Day of Birthday Only";
  //   } else if (bdayRange === 7) {
  //     bdayRangeText = "Day of Birthday Week";
  //   } else if (bdayRange === 30) {
  //     bdayRangeText = "Day of Birthday Month";
  //   }

  else if (type === "special") {
    const cat = (extraData.categories?.map((cate: string) => {
      if (cate !== null && cate !== undefined && cate !== "all")
        return cate
    }) || []).filter((cate: any) => cate).join(", ");

    let categoryText = "";
    if (cat === 'dayonly') {
      categoryText = "On Your Birthday Only";
    } else if (cat === "week") {
      categoryText = "During Your Birthday Week";
    } else if (cat === "month") {
      categoryText = "During your Birthday Month";
    }else if (cat === "happyhour") {
      categoryText = "Happy hour special";
    }else if (cat === "themed") {
      categoryText = "Themed special";
    }else if (cat === "daily") {
      categoryText = "Weekly recurring deal";
    }

    return (
      <div className={styles.rightText}>{categoryText}</div>
    )
  }
}

// const isExpiredOrSoldout = (timeString: string | number | Date, quantity: number) => {
//   const givenTime = new Date(timeString).getTime();
//   const currentTime = new Date().getTime();

//   const difference = givenTime - currentTime;

//   const hoursDifference = difference / (1000 * 60 * 60);

//   if (hoursDifference < 0 || quantity === 0) {
//     return true;
//   } else {
//     return false;
//   }
// }


const Card = ({ className, item, isDream = false }: { className: string, item: any, isDream?: boolean }) => {
  const userReffos = useSelector((state: RootState) => state.user.myReffos)
  const remaining = (item.quantity || 99999) - (item.purchased || 0)

  const isUnavailable = item.status === "soldOut" || item.status === "comingSoon" //isExpiredOrSoldout(item.endTime, remaining);
  const isPurchased = (userReffos.filter((reffo: any) => (reffo?.reffoIdWithoutPath === item.id) || [])).length > 0

  const tagsList = (item.tags?.map((tag: string) => {
    if (tag !== null && tag !== undefined && tag !== "all")
      return tag
  }) || []).filter((tag: any) => tag).join(", ");

  return (
    <Link className={cn(className, styles.card, {
      [styles.greyscale]: isUnavailable && !item.isPurchased,
    })} to={"/reffos/" + item.id}>
      <div className={styles.preview}>
        <img src={isDream ? Dream : item.reffoIMGS?.[0]} alt="ReffO" />
        <div className={styles.category}>
          <img src={getIcon(isDream ? "dream" : item.type)} alt="Category" />

        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.line}>
          <div className={styles.details}>

            <div className={styles.branding}><img src={item?.location_photo} />{item.locationName}</div>

            <div className={styles.subtitle}>{isDream ? "Didn’t find what you we’re looking for?" : item.offer}</div>
            {
              isDream && <div>Tell us what you were hoping for and we’ll see what we can do.</div>
            }
            {tagsList.length > 0 && (
              <div className={styles.tagsContainer}>
                <img src={GridIcon} />
                <div className={styles.tags}>{tagsList}</div>
              </div>
            )}

          </div>

        </div>
        {isUnavailable && !item.isPurchased ? (
          <div className={styles.soldoutText}>{item.status === "comingSoon" ? "Coming Soon 🤤" : "Sold out 😭"}</div>

        ) : (
          !isDream && (
            <div className={styles.line}>
              <div className={styles.type}>{getTypeText(item.type)}</div>
              {getFooterRightComponent(item.type, {
                remaining: remaining,
                endTime: item.endTime,
                startTime: item.startTime,
                bdayRange: item.bdayRange,
                categories: item.categories,
                isPurchased: item.isPurchased || isPurchased
              })}
            </div>
          )
        )}

        {isDream && (
          <div className="button-dream">
            Suggest a new deal
          </div>
        )}

      </div>
    </Link>
  );
};

export default Card;
