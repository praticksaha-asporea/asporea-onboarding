import TokenQueueDisplay from "@/Module/Auth/TokenQueueDisplay/TokenQueueDisplay";
import { getServerMode } from "@/@core/contexts/utils/serverHelpers";
const TokenQueuePage = async () => {
  const mode = await getServerMode();

  return (
    <TokenQueueDisplay mode={mode} />
  );
};

export default TokenQueuePage;