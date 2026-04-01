// Component Imports
import Login from '../../../Module/Auth/Login/Login'

// // Server Action Imports
import { getServerMode } from '@/@core/contexts/utils/serverHelpers'

const LoginPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
