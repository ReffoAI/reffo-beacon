import React, { useState } from "react";
import cn from "classnames";
import styles from "./Header.module.sass";
import { Link, NavLink, useLocation } from "react-router-dom";
import Image from "../Image";
import Notification from "./Notification";
import User from "./User";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ReffoIcon from '/src/assets/reffO.svg'



const Header = ({ separatorHeader, wide }: { separatorHeader: boolean, wide: boolean }) => {
    const [visibleNav, setVisibleNav] = useState(false);
    // const [visible, setVisible] = useState(false);
    const { pathname } = useLocation();

    const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated)
    const stickySearch = useSelector((state: RootState) => state.misc.stickySearch)



    return (
        <>
            <div
                id="webHeader"
                className={cn(
                    styles.header,
                    { [styles.headerBorder]: separatorHeader },
                    { [styles.wide]: wide }
                )}
            >
                <div className={cn("container", styles.container)}>
                    <Link className={styles.logo} to="/">
                        <Image
                            className={styles.pic}
                            src={ReffoIcon}
                            alt="reffO"
                        />
                    </Link>

                    <div
                        className={cn(styles.wrapper, {
                            [styles.active]: visibleNav,
                            [styles.hide]: stickySearch,
                        })}
                    >

                        <NavLink
                            className={cn(styles.link, {
                                [styles.active]: pathname === "/",
                            })}
                            to="/"
                        >
                            DEALS
                        </NavLink>
                        <div
                            className={cn(styles.link, {
                                [styles.active]: pathname === "/faq",
                            })}
                            onClick={() => {
                                window.location.href = "https://reffo.deals/faqs"
                            }}
                        >
                            FAQs
                        </div>
                        <div
                            className={cn(styles.link, {
                                [styles.active]: pathname === "/about",
                            })}
                            onClick={() => {
                                window.location.href = "https://reffo.deals/about"
                            }}
                        >
                            ABOUT
                        </div>
                    </div>

                    {!isAuthenticated ? (
                        <NavLink
                            className={cn(
                                "button-black button-small",
                                styles.buttonDark
                            )}
                            to="/signin"
                        >
                            Sign up or Login
                        </NavLink>
                    ) : (
                        <div className={cn(styles.authContainer)}>

                            <Notification className={styles.notification} />
                            <User className={styles.user} />

                        </div>
                    )}
                    <button
                        className={cn(styles.burger, {
                            [styles.active]: visibleNav,
                        })}
                        onClick={() => setVisibleNav(!visibleNav)}
                    ></button>
                </div>
            </div>
        </>
    );
};

export default Header;
