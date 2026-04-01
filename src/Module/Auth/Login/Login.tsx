'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

import { MuiOtpInput } from 'mui-one-time-password-input'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '../../../Components_Theme/layout/shared/Logo'
import Illustrations from '../../../Components/Illustrations'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [otp, setOtp] = useState('')
  const [sendOtp, setSendOtp] = useState(false)
  const [enableVerfifyOTP, setEnableVerfifyOTP] = useState(false)

  const handleChange = (newValue: string) => {
    setOtp(newValue)
    if(newValue.length===6)
    {
      setEnableVerfifyOTP(true);
    }
  }
  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push('/')
  }

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  const togglePasswordOTP = () => {
    setAuthMode(authMode === 'password' ? 'otp' : 'password');
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div className='text-center'>
              <Typography variant='h4'>{`Welcome to Asporea`}</Typography>
              <Typography className='mbs-1'>Login or Sign Up to get started.</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField autoFocus fullWidth label='Phone Number or Email' />
              {authMode === 'password' && (

                <TextField
                  fullWidth
                  label='Password'
                  id='outlined-adornment-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
              <div
                className={`flex items-center gap-x-3 gap-y-1 flex-wrap ${authMode === 'password' ? 'justify-between' : 'justify-center'
                  }`}
              >
                {authMode === 'password' && (

                  <FormControlLabel control={<Checkbox />} label='Remember me' />
                )}
                <Typography className='text-end' color='primary' onClick={togglePasswordOTP}>
                  Login / Signup via {authMode === `password` ? `OTP` : `Password`}
                </Typography>
              </div>
              {authMode === 'password' && (
                <Button fullWidth variant='contained' type='submit'>
                  Log In
                </Button>
              )}
              {authMode === 'otp' && (
                <Button fullWidth variant='contained' className='btn btn-success' onClick={() => { setSendOtp(true) }} disabled={sendOtp}>
                  Send OTP
                </Button>
              )}
              {authMode === 'otp' && (
                <>
                  <div className='flex justify-between items-center flex-wrap gap-2'>
                    <Typography color='error'>
                      Resend in 02:00
                    </Typography>
                    <Button color='error' size='small' variant='text'>
                      Resend OTP
                    </Button>
                  </div>
                  {sendOtp && (
                    <>
                      <MuiOtpInput value={otp} onChange={handleChange} length={6} />
                      <Button variant='contained' size='small' color='success' disabled={!enableVerfifyOTP} onClick={()=>router.push('/')}>
                        Verify
                      </Button>
                    </>
                  )}
                </>
              )}
              <Divider className='gap-3'>or</Divider>
              <div className='grid grid-cols-2 gap-3'>
                <Button variant='outlined' size='small' color='secondary'>
                  Continue With &nbsp; <i className='ri-google-fill text-googlePlus' />
                </Button>

                <Button variant='outlined' size='small' color='secondary'>
                  Continue With &nbsp; <i className='ri-facebook-fill text-facebook' />
                </Button>

                <Button variant='outlined' size='small' color='secondary'>
                  Continue With &nbsp; <i className='ri-linkedin-box-fill text-linkedin' />
                </Button>

                <Button variant='outlined' size='small' color='secondary'>
                  Continue With &nbsp; <i className='ri-instagram-fill text-instagram' />
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Login
