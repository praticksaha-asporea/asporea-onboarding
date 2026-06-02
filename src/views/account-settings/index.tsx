'use client'

import { useEffect, useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
// import { usePathname, useRouter } from 'next/navigation'
// import { useSelector } from 'react-redux'


const AccountSettings = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  const [activeTab, setActiveTab] = useState('account')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }
  // const path = usePathname();
  // const router = useRouter();
  
  // const reduxUser = useSelector(
  //   (state: any) => state.userSlice?.userData || state.user?.userData,
  // );
  //  useEffect(()=>{
  //   if(reduxUser?.role=="tac" && path==="/profile")
  //   {
  //     router.replace('/my-profile');
  //   }
    
  //   if(reduxUser?.role=="user" && path==="/my-profile")
  //   {
  //     router.replace('/profile');
  //   }
  //  },[])
  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid  size={12}>
          <TabList onChange={handleChange} variant='scrollable'>
            <Tab label='Account' icon={<i className='ri-user-3-line' />} iconPosition='start' value='account' />
            <Tab label='Notifications' icon={<i className='ri-notification-3-line' />} iconPosition='start' value='notifications' />
           
          </TabList>
        </Grid>
        <Grid size={12}>
          <TabPanel value={activeTab} className='p-0'>
            
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AccountSettings