import React from "react";
import dynamic from "next/dynamic";

import AccountSettings from "@/views/account-settings";

const AccountTab = dynamic(() => import("@/views/account-settings/account"));
const NotificationsTab = dynamic(
  () => import("@/views/profile/NotificationsTab"),
);

const ProfilePage = () => {
  return (
    <AccountSettings
      tabContentList={{
        account: <AccountTab />,
        notifications: <NotificationsTab />,
      }}
    />
  );
};

export default ProfilePage;
