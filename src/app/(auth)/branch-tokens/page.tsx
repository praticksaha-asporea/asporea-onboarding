import { getServerMode } from "@/@core/contexts/utils/serverHelpers";
import TokenQueueDisplay from "@/Module/Auth/TokenQueueDisplay/TokenQueueDisplay";

const TokenQueuePage = async () => {
  const mode = await getServerMode()

  return <TokenQueueDisplay mode={mode} />;
};

export default TokenQueuePage;
