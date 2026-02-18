import styles from "./DealBody.module.sass";
import cn from "classnames";
import { Accordion, AccordionItem } from '@szhsin/react-accordion';
import PaymentCard from "../PaymentCard";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Skeleton from "react-loading-skeleton";
import Modal from "../Modal";
import Content from "../Modal/Content";
import { useState } from "react";
import { isExpired, isExpiringSoon, isUpcomingDeal, isUpcomingPurchasedDeal } from "../../services/misc";
import MapIcon from '/src/assets/icons/map.svg';
import MenuIcon from '/src/assets/icons/menu.svg';
import RefundIcon from '/src/assets/icons/refund.svg'
import LegalIcon from '/src/assets/icons/legal.svg'
import { toast } from "react-toastify";
import moment from "moment";


const DealBody = () => {

  const [modalOpen, setModalOpen] = useState(false)
  const [modalText, setModalText] = useState("")

  const selectedReffo = useSelector((state: RootState) => state.reffo.reffoDetail) || {} as any
  const locations = useSelector((state: RootState) => state.location.locations)
  const isLoading = useSelector((state: RootState) => state.reffo.loading)
  const userReffos = useSelector((state: RootState) => state.user.myReffos)
  const relatedPurchase = userReffos.filter((reffo) => (reffo as any)?.reffoIdWithoutPath === selectedReffo.id) || []


  // const remaining = (selectedReffo?.quantity || 99999) - (selectedReffo?.purchased || 0)
  const currentLocation = locations[selectedReffo.corpID + "-" + selectedReffo.locationID] || {}
  const isUnavailable = selectedReffo.status === "soldOut" || selectedReffo.status === "comingSoon"
  const isComingSoon = selectedReffo.status === "comingSoon"

  {/* default, unavailable, redeemed, upcoming, expired */ }
  const getPaymentState = () => {
    const isPurchased = relatedPurchase.length > 0
    const expired = isExpired(selectedReffo)
    console.warn("Expired is ", expired, "purchased is ", isPurchased)

    if (isPurchased) {
      const isFulfilled = (relatedPurchase[0] as any).fulfilled
      if (isFulfilled) {
        return "redeemed"

      } else {
        return "upcoming"

      }
    }
    else if (expired) {
      return "expired"
    }
    else if (isUnavailable) {
      return "unavailable"
    }

    return "default"
  }

  const isValidUrl = (url: string) => {
    const regex = /^(https?:\/\/)([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:[0-9]+)?(\/[^\s]*)?$/;
    return regex.test(url);
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>

        {isLoading ? (
          <Skeleton className="h4" />
        ) : (
          <div className={"h4"}>
            {selectedReffo?.offer}
          </div>

        )}

        {isLoading ? (
          <Skeleton className={styles.leftHeader} />
        ) : (
          <div style={{
            borderBottom: "1px solid #E0E0E0"
          }}>
            <div className={styles.leftHeaderContent}>
              <div>Posted By</div>

              <img
                src={selectedReffo?.location_photo} />

              <div>{selectedReffo?.locationName}</div>


              {isUnavailable && (isComingSoon ? (
                <div className={cn(styles.statusBox, styles.comingSoon)}>Coming Soon</div>
              ) : (
                <div className={cn(styles.statusBox, styles.soldOut)}>Sold Out</div>

              ))}
              {isExpired(selectedReffo) && (
                <div className={cn(styles.statusBox, styles.soldOut)}>Expired</div>
              )}
              {isUpcomingPurchasedDeal(selectedReffo) && (
                <div className={cn(styles.statusBox, styles.upcoming)}>Upcoming</div>
              )}
              {getPaymentState() === "redeemed" && (
                <div className={cn(styles.statusBox, styles.redeemed)}>Redeemed</div>
              )
              }
            </div>
            {isUpcomingDeal(selectedReffo) && (
              <div style={{
                paddingBottom: 10
              }}>
                This offer can be purchased until {moment(selectedReffo?.endTime?.toDate()).format("MMMM Do [at] h:mm a")}. {isExpiringSoon(selectedReffo) && <span className={styles.expiringText}>Expiring Soon!</span>}
              </div>
            )}

          </div>
        )}



        <div className={styles.contentBody}>
          {selectedReffo.rules?.split("\n").map((x: string) => (
            <div style={{ paddingBottom: 8 }}>{x}</div>
          )
          )}
        </div>

        <div className={cn("h4", styles.heading)}>Information</div>

        <div
          className={styles.contentContainer}
        >



          {selectedReffo.loc && (

            <div className={styles.informationItem}
              onClick={() => {
                window.open("https://maps.google.com/maps?q=" + selectedReffo.loc._lat + "," + selectedReffo.loc._long, "_blank")
              }}
            >
              <div
                className={styles.informationIcon}
                style={{
                  border: '2px solid #92A5EF',
                }}>
                <img src={MapIcon} />


              </div>

              <div className={styles.informationType} >
                Get Directions
              </div>

            </div>

          )}


          {currentLocation?.menuLink && isValidUrl(currentLocation?.menuLink) && (
            <div className={styles.informationItem}
              onClick={() => {
                //validate menu link with regex
                if (isValidUrl(currentLocation.menuLink)) {
                  window.open(selectedReffo.menuLink, "_blank")

                } else {
                  toast.error("Menu link is unaccessible. Please contact the location for more information.")
                }



              }}
            >
              <div
                className={styles.informationIcon}
                style={{
                  border: '2px solid #8BC5E5',
                }}>
                <img src={MenuIcon} />

              </div>

              <div className={styles.informationType}>
                View Menu
              </div>

            </div>
          )}


        </div>



        <div
          className={styles.contentContainer}
        >

          {currentLocation?.refundPolicy && (
            <div className={styles.informationItem}
              onClick={() => {
                setModalText(currentLocation.refundPolicy)
                setModalOpen(true)
              }}>
              <div
                className={styles.informationIcon}
                style={{
                  border: '2px solid #FA8F54',
                }}>
                <img src={RefundIcon} />
              </div>

              <div className={styles.informationType}>
                Refund Policy
              </div>

            </div>
          )}



          {currentLocation?.legalDesc && (
            <div className={styles.informationItem}
              onClick={() => {
                setModalText(currentLocation.legalDesc)
                setModalOpen(true)

              }}
            >
              <div
                className={styles.informationIcon}
                style={{
                  border: '2px solid #58C27D',
                }}>
                <img src={LegalIcon} />

              </div>

              <div className={styles.informationType}>
                Legal Disclosures
              </div>

            </div>
          )}



        </div>

        <div className={cn("h4", styles.heading)}>Limitations</div>
        <Accordion allowMultiple>

          {selectedReffo.limitIncluded?.filter((x: any) => x.checked !== false).length > 0 && (
            <AccordionItem header="Not included" disabled initialEntered>
              <ul>
                {selectedReffo.limitIncluded?.filter((x: any) => x.checked !== false).map((x: any) => (
                  <li>{x.detail}</li>
                )
                )}
              </ul>
            </AccordionItem>
          )}

          {selectedReffo.limitDelivery?.filter((x: any) => x.checked !== false).length > 0 && (

            <AccordionItem header="Delivery" disabled initialEntered>
              <ul>
                {selectedReffo.limitDelivery?.filter((x: any) => x.checked !== false).map((x: any) => (
                  <li>{x.detail}</li>
                )
                )}

              </ul>
            </AccordionItem>
          )}

          {selectedReffo.limitSeating?.filter((x: any) => x.checked !== false).length > 0 && (

            <AccordionItem header="Seating" disabled initialEntered>
              <ul>
                {selectedReffo.limitSeating?.filter((x: any) => x.checked !== false).map((x: any) => (
                  <li>{x.detail}</li>
                )
                )}
              </ul>
            </AccordionItem>
          )}

          {selectedReffo.limitLimits?.filter((x: any) => x.checked !== false).length > 0 && (

            <AccordionItem header="Limits" disabled initialEntered>
              <ul>
                {selectedReffo.limitLimits?.filter((x: any) => x.checked !== false).map((x: any) => (
                  <li>{x.detail}</li>
                )
                )}

              </ul>
            </AccordionItem>
          )}
          {selectedReffo.limitCustom && (
            <AccordionItem header="Other" disabled initialEntered>
              <ul>
                <li>{selectedReffo.limitCustom}</li>
              </ul>
            </AccordionItem>
          )}
        </Accordion>


      </div>



      <PaymentCard state={getPaymentState()} />
      {/* default, unavailable, redeemed, upcoming */}


      <Modal visible={modalOpen} onClose={() => {
        setModalOpen(false)
      }} >
        <Content onClose={() => {
          setModalOpen(false)

        }} text={modalText} />
      </Modal>

    </div>
  );
};

export default DealBody;
