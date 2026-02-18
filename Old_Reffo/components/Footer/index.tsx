import React, { useState } from "react";
import cn from "classnames";
import styles from "./Footer.module.sass";
import { Link, useNavigate } from "react-router-dom";
import Form from "../Form";
import { generateCityRequest } from "../../services/misc";
import ReffoIcon from '/src/assets/reffO.svg'
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

// const items = [
//   {
//     title: "About",
//     url: "https://reffo.deals/about",
//   },
//   {
//     title: "Sign up",
//     url: "/signup",
//   },

// ];

const Footer = () => {
  const navigate = useNavigate()
  const [city, setCity] = useState("");
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated)

  const performNavigation = (item: any) => {
    if (item.url.includes("http")) {
      window.open(item.url, "_blank")
    } else {
      navigate(item.url)
    }
  }

  const handleSubmit = () => {
    //to be integrated
    generateCityRequest(city)
    setCity("")
  };

  return (
    <div className={styles.footer}>
      <div className={cn("container", styles.container)}>
        <div className={styles.row}>
          <div className={styles.col}>
            <Link className={styles.logo} to="/">
              <img
                className={styles.pic}
                src={ReffoIcon} alt="reffo" />
            </Link>
          </div>
          <div className={styles.col}>
            <div className={styles.menu}>
              {/* {items.map((x, index) => (
                !isAuthenticated || x.title !== "Sign up" && (
                  <div onClick={() => {
                    performNavigation(x)
                  }} className={styles.link} key={index}>
                    {x.title}
                  </div>
                )
              ))} */}

              <div onClick={() => {
                performNavigation({
                  title: "About",
                  url: "https://reffo.deals/about",
                })
              }} className={styles.link} >
                About
              </div>
              {!isAuthenticated && (
                <div onClick={() => {
                  performNavigation({
                    title: "Sign up",
                    url: "/signup",
                  })
                }} className={styles.link} >
                  Sign up
                </div>
              )}


            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.info}>
              Suggest our next city{" "}
              <span role="img" aria-label="city">
                🏙️
              </span>
            </div>
            <Form
              big={false}
              className={styles.form}
              value={city}
              setValue={setCity}
              onSubmit={() => handleSubmit()}
              placeholder="Enter city name"
              type="text"
              name="city name"
              icon="arrow-next"
            />
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            Copyright © {new Date().getFullYear()}  REFFO INC. All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
