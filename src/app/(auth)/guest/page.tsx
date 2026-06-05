// Component Imports
import GuestToken from '@/Module/Auth/Guest/GuestToken'

// // Server Action Imports
import { getServerMode } from '@/@core/contexts/utils/serverHelpers'

const Guest = async () => {
  // Vars
  const mode = await getServerMode()

  return <GuestToken mode={mode} />
}

export default Guest
