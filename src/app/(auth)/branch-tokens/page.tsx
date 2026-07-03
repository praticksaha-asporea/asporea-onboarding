// // Server Action Imports
import { getServerMode } from '@/@core/contexts/utils/serverHelpers'
import BranchTokens from '@/Module/Auth/BranchTokens/BranchTokens'

const Tokens = async () => {
  // Vars
  const mode = await getServerMode()

  return <BranchTokens mode={mode} />
}

export default Tokens
