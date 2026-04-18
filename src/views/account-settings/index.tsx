'use client'

import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

const AccountSettings = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  const [activeTab, setActiveTab] = useState('account')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

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