import cn from "classnames";
import styles from "./CategoryList.module.sass";
import { dealCategories, experienceCategories, specialCategories, categories } from "../../constants/categories";
import Slider from "react-slick";
import { SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategory } from "../../redux/reffoReducer";
import { RootState } from "../../redux/store";
import allIcon from '/src/assets/tags/all.svg';



const CategoryList = () => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 11,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 10,
        }
      },
      {
        breakpoint: 990,
        settings: {
          slidesToShow: 8,
        }
      },
      {
        breakpoint: 850,
        settings: {
          slidesToShow: 7,
        }
      },
      {
        breakpoint: 710,
        settings: {
          slidesToShow: 6,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 5,
        }
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 3,
        }
      }
    ]
  };
  const dispatch = useDispatch()
  const selectedSearchType = useSelector((state: RootState) => state.misc.selectedSearchType)
  const selectedCategory = useSelector((state: RootState) => state.reffo.selectedCategory)
  const [catogriesList, setCategoriesList] = useState([{
    name: "Show All",
    image: allIcon,
    type: null
  }, ...dealCategories])

  useEffect(() => {
    let currentCat: SetStateAction<({ name: string; image: string; type: string; } | { name: string; image: string; type: null; })[]> = []
    setCategoriesList([])
    dispatch(setSelectedCategory(null))
    if (selectedSearchType == "deal") {
      currentCat = dealCategories
    } else if (selectedSearchType == "experience") {
      currentCat = experienceCategories
    // } else if (selectedSearchType == "bday") {
    //   currentCat = bdayCategories
    // } else {
    } else if (selectedSearchType == "special") {
      currentCat = specialCategories
    } else {
      currentCat = categories
    }

    setCategoriesList([{
      name: "Show All",
      image: allIcon,
      type: null
    }, ...currentCat])

  }, [selectedSearchType])


  const width = window.innerWidth;

  return (

    <div className={styles.container}>

      {width > 474 ? (
        <Slider {...settings}>
          {catogriesList.map((category) => (
            <div key={category.type}>
              <div
                onClick={() => dispatch(setSelectedCategory(category.type))}
                className={cn(styles.categoryItem, {
                  [styles.reduceOpacity]: selectedCategory !== category.type
                })}>
                <img src={category.image} />
                <span>{category.name}</span>
                <div
                  className={cn(styles.selector, {
                    [styles.selectorVisible]: selectedCategory === category.type,
                  })}
                />
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div
          className={styles.mobileScroll}>


          {catogriesList.map((category) => (
            <div key={category.type}>
              <div
                onClick={() => dispatch(setSelectedCategory(category.type))}
                className={cn(styles.categoryItem, {
                  [styles.reduceOpacity]: selectedCategory !== category.type
                })}>
                <img src={category.image} />
                <span>{category.name}</span>
                <div
                  className={cn(styles.selector, {
                    [styles.selectorVisible]: selectedCategory === category.type,
                  })}
                />
              </div>
            </div>
          ))}

        </div>

      )}


    </div>

  );
};

export default CategoryList;
