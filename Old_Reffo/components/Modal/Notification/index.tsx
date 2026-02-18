import { useEffect, useState } from "react";
import styles from "./Notification.module.sass";
import cn from "classnames";
import Switch from "react-switch";
import Dropdown from "../../Dropdown";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateUserData } from "../../../services/user";



const Notification = () => {
  const currentUser = useSelector((state: RootState) => state.user.user) as any
  const [selectedCategory, setSelectedCategory] = useState("Messages")


  const [settings, setSettings] = useState([{
    title: "Email",
    description: (currentUser as any)?.email,
    isEnabled: currentUser?.messages_email_notifications || false,
    key: "messages_email_noti"
  }, {
    title: "Push",
    description: "Messages to your device",
    isEnabled: currentUser?.messages_push_notifications || false,
    key: "messages_push_noti"
  }, {
    title: "Browser",
    description: "Messages in your browser",
    isEnabled: currentUser?.messages_browser_notifications || false,
    key: "messages_browser_noti"
  }])

  useEffect(() => {
    const selectedCategoryLocal = selectedCategory.toLowerCase()

    setSettings([{
      title: "Email",
      description: (currentUser as any)?.email,
      isEnabled: currentUser?.[`${selectedCategoryLocal}_email_noti`] || false,
      key: `${selectedCategoryLocal}_email_noti`
    }, {
      title: "Push",
      description: "Messages to your device",
      isEnabled: currentUser?.[`${selectedCategoryLocal}_push_noti`] || false,
      key: `${selectedCategoryLocal}_push_noti`
    }, {
      title: "Browser",
      description: "Messages in your browser",
      isEnabled: currentUser?.[`${selectedCategoryLocal}_browser_noti`] || false,
      key: `${selectedCategoryLocal}_browser_noti`
    }])

  }, [selectedCategory])




  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={cn('h5', styles.title)}>Notification Settings</div>
      </div>
      <div className={styles.dropdownHolder}>
        <Dropdown
          className={styles.dropdown}
          value={selectedCategory}
          setValue={setSelectedCategory}
          options={["Messages", "Promotions", "Reminders"]}
        />
      </div>

      {settings.map((setting) => {
        return (
          <div className={styles.typeRow}>
            <div>
              <div className={styles.title}>{setting.title}</div>
              <div>{setting.description}</div>

            </div>
            <Switch
              handleDiameter={20}
              checkedIcon={false}
              uncheckedIcon={false}
              offColor="#E6E8EC"
              offHandleColor="#DD436C"
              onColor="#DD436C"
              width={56}
              height={26}
              onChange={async (e) => {
                const newSettings = settings.map((s) => {
                  if (s.title === setting.title) {
                    s.isEnabled = e
                  }
                  return s
                })
                await updateUserData({ [setting.key]: e })


                setSettings(newSettings)
              }} checked={setting.isEnabled} />

          </div>
        )
      })}
      <div className={styles.footerText}>
        * We promise not to over use these 😇
      </div>
    </div>
  );

};

export default Notification;
