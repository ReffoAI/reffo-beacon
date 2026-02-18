import { useDispatch, useSelector } from "react-redux";
import CountdownTimer from "../CountdownTimer";
import styles from "./PaymentCard.module.sass";
import cn from "classnames";
import { RootState } from "../../redux/store";
import moment from "moment";
import { purchaseSpecial, purchaseBday, purchaseReffo } from "../../services/reffos";
import { isLoadingStripe } from "../../redux/reffoReducer";
import Modal from "../Modal";
import SocialShare from "../Modal/SocialShare";
import { useState } from "react";
import GuestCheckout from "../Modal/GuestCheckout";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import FlagIcon from '/src/assets/icons/flag.svg'
import CalendarIcon from '/src/assets/icons/calendar.svg'
import UserIcon from '/src/assets/icons/user.svg'
import ShareIcon from '/src/assets/icons/share.svg'
import ShoppingBagIcon from '/src/assets/icons/shoppingbag.svg'




const PaymentCard = ({ state = "default" }: {
  state: string
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const selectedReffo = useSelector((state: RootState) => state.reffo.reffoDetail) || {} as any
  const isLoading = useSelector((state: RootState) => state.reffo.stripeLoading)
  const remaining = (selectedReffo.quantity || 99999) - (selectedReffo.purchased || 0)
  const userReffos = useSelector((state: RootState) => state.user.myReffos)
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated)
  const currentDealPurchased = userReffos.filter((reffo) => (reffo as any)?.reffoIdWithoutPath === selectedReffo.id)?.[0] || {}
  const isPurchased = Object.keys(currentDealPurchased).length > 0
  const [openModal, setOpenModal] = useState(false)
  const [modalType, setModalType] = useState("SocialShare")


  // const getReffoFee = () => {
  //   if (selectedReffo.type === "deal") {
  //     return 1
  //   } else if (selectedReffo.type === "experience") {
  //     return 5
  //   } else {
  //     return 0
  //   }
  // }


  const getHeaderBottomText = () => {
    if (state === "default" && remaining <= 5 && !isPurchased) {
      return (<>
        <span
          className={styles.bigEmoji}>🔥</span>
        <div > {remaining} Remaining</div>
      </>
      )
    }
    else if (state === "expired") {
      return (<>
        <div >This deal has already expired </div>
      </>
      )
    }
    else if (state === "unavailable") {
      return (<>
        <div >This item is no longer available</div>
      </>
      )
    } else if (state === "redeemed") {
      return (<>
        <div >You redeemed this deal</div>
      </>
      )
    } else if (state === "upcoming") {
      const date = new Date(selectedReffo?.endTime?.toDate());
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);

      if (hours < 0) {
        return (<>
          <div >This deal has already expired </div>
        </>
        )
      }
      else if (hours <= 24) {
        return (<>
          <div >This deal expires in <CountdownTimer targetDate={date.getTime()} /> </div>
        </>
        )
      }

      return (<>
        <div >This deal is upcoming</div>
      </>
      )
    }


  }


  const getFooter = () => {
    if (state === "default") {
      return (
        <>
          <div className={styles.footerText}>Your full deposit would be applied to your bill</div>

          <div className={styles.footerRow}>
            <img src={FlagIcon} />
            <div className={styles.footerText}> Remember to tip!</div>
          </div>
        </>
      )
    }
    else if (state === "redeemed" || state === "upcoming") {

      return (

        <div className={styles.footerText}>
          If you have an issue with this deal, please
          first speak with the manager on duty
          and if you cannot resolve the issue, send
          us a message.
        </div>


      )

    }
    else {
      return (
        <div style={{ margin: 30 }} />
      )
    }


  }

  const getInvoiceBreakdown = () => {
    if (state === "default" || state === "unavailable" || state === "expired") {
      return (
        <div style={state === "unavailable" ? { opacity: 0.3 } : {}}>
          {[{ name: selectedReffo.type == "experience" ? "Non-refundable purchase" : "Refundable Deposit", amount: (selectedReffo.deposit) || 0 }, { name: "Service Fee", amount: 0 }].map((item) => (
            <div className={styles.invoiceRow}>
              <div>{item.name}</div>
              <div>${item.amount}</div>
            </div>
          )
          )}



          <div className={cn(styles.invoiceRow, styles.invoiceRowBg)}>
            <div>Total</div>
            <div>${selectedReffo.deposit || 0}</div>
          </div>
        </div>
      )

    } else {
      return null
    }

  }

  const getRedemptionCode = () => {
    const code = "#" + ((currentDealPurchased as any)?.pin || "0000");
    if (state !== "default" && state !== "unavailable" && state !== "expired") {
      return (
        <>
          <div className={styles.redemptionCode}>
            {code.split("").map((char) => {
              return (
                <div className={styles.redemptionCodeChar}>
                  {char}
                </div>
              )
            })
            }
          </div>

          <div className={styles.redemptionFooter} >Redemption Code</div>
        </>
      )
    }

  }

  const getDealDetails = () => {
    const startTime = selectedReffo.startTime?.toDate()
    const endTime = selectedReffo.endTime?.toDate()
    const sameDateAndTime = moment(startTime).isSame(endTime);

    const unlimitedGuests = selectedReffo.maxGuests == 999 ? true : false
    const sameGuestCount = selectedReffo.minGuests === selectedReffo.maxGuests

    if (selectedReffo.type === "deal") {

      return (
        <>
          <div className={styles.detailRow}>
            {selectedReffo.startTime && (
              <div className={styles.rowItem}>
                <img src={CalendarIcon} />
                <div>
                  <div className={styles.title}>
                    Arrive {sameDateAndTime ? "At" : "Between"}
                  </div>

                  <div className={styles.value}>
                    {moment(startTime).format("MMM DD, hh:mm a")} {endTime && moment(endTime).format("- MMM DD, hh:mm a")}
                  </div>
                </div>
              </div>
            )}

          </div>

          {(selectedReffo.minGuests || selectedReffo.maxGuests) &&
            (<div className={styles.detailRow}>

              <div className={styles.rowItem}>
                <img src={UserIcon} style={{ height: 20, marginRight: 5 }} />
                <div >
                  <div className={styles.title}>
                    Guest
                  </div>
                  {unlimitedGuests ? (
                    <div className={styles.value}>
                      Unlimited guests
                    </div>
                  ) : (
                    <div className={styles.value}>
                      {selectedReffo.minGuests}{sameGuestCount ? null : " - " + selectedReffo.maxGuests} guests
                    </div>
                  )}

                </div>
              </div>

            </div>
            )
          }
        </>
      )


    }
    if (selectedReffo.type === "experience") {

      return (
        <>
          <div className={styles.detailRow}>
            {selectedReffo.startTime && (
              <div className={styles.rowItem}>
                <img src={CalendarIcon} />
                <div>
                  <div className={styles.title}>
                    Event Begins At
                  </div>

                  <div className={styles.value}>
                    {moment(startTime).format("MMM DD, hh:mm a")} {endTime && moment(endTime).format("- MMM DD, hh:mm a")}
                  </div>
                </div>
              </div>
            )}

          </div>


          <div className={styles.detailRow}>
            {(selectedReffo.minGuests || selectedReffo.maxGuests) &&
              (
                <div className={styles.rowItem}>
                  <img src={UserIcon} style={{ height: 20, marginRight: 5 }} />
                  <div >
                    <div className={styles.title}>
                      Guest
                    </div>

                    {unlimitedGuests ? (
                      <div className={styles.value}>
                        Unlimited guests
                      </div>
                    ) : (
                      <div className={styles.value}>
                        {selectedReffo.minGuests}{sameGuestCount ? null : " - " + selectedReffo.maxGuests} guests
                      </div>
                    )}

                  </div>
                </div>

              )}

          </div>


        </>
      )
    }

    else if (state === "default" || state === "unavailable" || state === "expired") {
      return (
        <>
          <div className={styles.detailRow}>
            {selectedReffo.startTime && (
              <div className={styles.rowItem}>
                <img src={CalendarIcon} />
                <div>
                  <div className={styles.title}>
                    Available from
                  </div>

                  <div className={styles.value}>
                    {moment(selectedReffo.startTime?.toDate()).format("MMM DD, hh:mm a")}
                  </div>
                </div>
              </div>
            )}

            {selectedReffo.endTime && (
              <div className={styles.rowItem}>
                <img src={CalendarIcon} style={{ height: 20, marginRight: 5 }} />
                <div >
                  <div className={styles.title}>
                    Available to
                  </div>

                  <div className={styles.value}>
                    {moment(selectedReffo.endTime?.toDate()).format("MMM DD, hh:mm a")}
                  </div>
                </div>
              </div>
            )
            }

          </div>


          {(selectedReffo.minGuests || selectedReffo.maxGuests) &&
            (<div className={styles.detailRow}>

              <div className={styles.rowItem}>
                <img src={UserIcon} style={{ height: 20, marginRight: 5 }} />
                <div >
                  <div className={styles.title}>
                    Guest
                  </div>

                  {unlimitedGuests ? (
                    <div className={styles.value}>
                      Unlimited guests
                    </div>
                  ) : (
                    <div className={styles.value}>
                      {selectedReffo.minGuests}{sameGuestCount ? null : " - " + selectedReffo.maxGuests} guests
                    </div>
                  )}
                </div>
              </div>

            </div>
            )
          }
        </>
      )


    } else if (state === "upcoming") {

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 13);
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 16);

      const now = new Date();
      return (
        <>
          <div className={styles.detailRow}>
            {now.getTime() < startTime.getTime() && selectedReffo.startTime && (
              <div className={styles.rowItem}>
                <img src={CalendarIcon} />
                <div>
                  <div className={styles.title}>
                    Redeemable
                  </div>

                  <div className={styles.value}>
                    {moment(selectedReffo.startTime?.toDate()).format("MMM DD, hh:mm a")}
                  </div>
                </div>
              </div>
            )}

            {selectedReffo.endTime && (
              <div className={styles.rowItem}>
                <img src={CalendarIcon} style={{ height: 20, marginRight: 5 }} />
                <div >
                  <div className={styles.title}>
                    Expires
                  </div>

                  <div className={styles.value}>
                    {moment(selectedReffo.endTime?.toDate()).format("MMM DD, hh:mm a")}
                  </div>
                </div>
              </div>
            )}
          </div>




        </>
      )

    }

    else if (state === "redeemed") {
      return (
        <>
          <div className={styles.detailRow}>
            <div className={styles.rowItem}>
              <img src={CalendarIcon} />
              <div>
                <div className={styles.title}>
                  Redeemed on
                </div>

                <div className={styles.value}>
                  May 15, 8:00 pm
                </div>
              </div>
            </div>
          </div>

        </>
      )

    }

  }

  const getRightButton = () => {
    return state !== "default" || remaining <= 0 ?
      (isAuthenticated ? (
        <div
          onClick={() => {
            navigate("/")
          }}
          className={cn("button-gradient", styles.actionButton)}>
          <div>
            Find another deal
          </div>
        </div>
      ) : (<div
        onClick={() => {
          navigate("/signup")
        }}
        className={cn("button-gradient", styles.actionButton)}>
        <div>
          Sign up for notifications
        </div>
      </div>)) :
      (<button

        disabled={isLoading}
        onClick={() => {
          if (!isAuthenticated) {
            setModalType("GuestCheckout")
            setOpenModal(true)
          }
          // else if (selectedReffo.type === "bday") {
          else if (selectedReffo.type === "special") {
            // purchaseBday(selectedReffo.id).then(res => {
            purchaseSpecial(selectedReffo.id).then(res => {
              console.warn("Success", res)

            }).catch(() => {
              toast.error("There was an error with the payment, please try again later.")

            }).finally(() => {
              dispatch(isLoadingStripe(false))
            })
          } else {
            purchaseReffo(selectedReffo.id, selectedReffo.stripeID).then(res => {
              if (res.url)
                window.location.href = res.url
              else
                toast.error("There was an error with the payment, please try again later.")

            }).catch(() => {
              toast.error("There was an error with the payment, please try again later.")
            })
              .finally(() => {
                dispatch(isLoadingStripe(false))

              })
          }

        }}
        className={cn("button-gradient", styles.actionButton)}>
        {isLoading ?
          (<div> Processing...</div>)
          : (
            <>
              <div>
                Secure for ${selectedReffo?.deposit || 0}
              </div>
              <img src={ShoppingBagIcon} />
            </>
          )}

      </button>)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={cn(styles.cardHeader, state !== "default" && styles.dark)}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'

              }}
              className={styles.amount}
            >
              <div className={cn("h3")}>
                ${selectedReffo.deposit || 0}
              </div>
              <div style={{
                marginLeft: 30
              }}>
                Deposit
              </div>
            </div>


            <div className={styles.dealsRemaining}>

              {getHeaderBottomText()}
            </div>
          </div>



          <img src={selectedReffo.location_photo}
            className={styles.restaurantLogo} />
        </div>

        <div
          className={styles.dealDetails}
        >

          {getDealDetails()}
        </div>


        {getRedemptionCode()}
        {state === "unavailable" && (
          <div className={styles.textBeforeButtons}>
            This item is no longer available.<br />
            Sign up and get alerts so you<br />
            don’t miss the next one.

          </div>
        )}

        {selectedReffo.type === "experience" && (selectedReffo.arriveByEventStart || selectedReffo.arriveDuringEvent) && (
          <div className={styles.eventDetailBeforeButton}>
            {selectedReffo.arriveByEventStart ? "Arrive by event start time" : "Arrive anytime during the event"}
          </div>
        )}


        <div className={styles.buttonContainer}>
          <div
            onClick={() => {
              setModalType("SocialShare")
              setOpenModal(true)
            }}
            className={cn("button-stroke", styles.shareButton)} >
            <div>
              Share
            </div>
            <img src={ShareIcon} />
          </div>

          {getRightButton()}




        </div>

        {getInvoiceBreakdown()}

        {getFooter()}

      </div>

      <Modal visible={openModal} onClose={() => {
        setOpenModal(false)
      }} >
        {modalType === "SocialShare" && <SocialShare id={selectedReffo.id} />}
        {modalType === "GuestCheckout" && <GuestCheckout onClose={() => {
          setOpenModal(false)
        }} />}
      </Modal>

      <div
        className={styles.fixedMobFooter}>
        <div className={styles.footerLeft}>
          {getHeaderBottomText()}
        </div>
        <div>
          {getRightButton()}
        </div>
      </div>
    </div >

  );
};

export default PaymentCard;
