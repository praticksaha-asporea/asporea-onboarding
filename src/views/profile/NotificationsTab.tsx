// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// Component Imports
import Link from '@/Components/Link'
import Form from '@/Components/Form'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type TableDataType = {
  type: string
  app: boolean
  email: boolean
  browser: boolean
}

// Vars
const tableData: TableDataType[] = [
  {
    app: true,
    email: true,
    browser: true,
    type: 'Email'
  },
  {
    app: true,
    email: true,
    browser: true,
    type: 'Sms'
  },
  {
    app: false,
    email: true,
    browser: true,
    type: 'Whatsapp'
  },
  
]

const NotificationsTab = () => {
  return (
    <Card>
      
      <Form>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Preferences</th>
                <th>Status</th>
                 
                
              </tr>
            </thead>
            <tbody className='border-be'>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td>
                    <Typography color='text.primary'>{data.type}</Typography>
                  </td>
                  <td>
                    <Checkbox defaultChecked={data.email} />
                  </td>
                
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardContent>
 
          <Grid container spacing={6}>
              
            <Grid size={12} className='flex justify-end gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                Save Changes
              </Button>
               
            </Grid>
          </Grid>
        </CardContent>
      </Form>
    </Card>
  )
}

export default NotificationsTab
