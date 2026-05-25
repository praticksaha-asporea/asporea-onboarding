import { getServerMode } from '@/@core/contexts/utils/serverHelpers'
import TACLogin from '@/Module/Auth/Tac-Login/TACLogin'

const TACLoginPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <TACLogin mode={mode} />
}

export default TACLoginPage
