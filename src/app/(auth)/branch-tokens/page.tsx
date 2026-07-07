import TokenQueueDisplay from "@/Module/Auth/TokenQueueDisplay/TokenQueueDisplay";
import { getServerMode } from "@/@core/contexts/utils/serverHelpers";
import TokenQueueTheme from "@/Module/Auth/TokenQueueDisplay/TokenQueueTheme";

const TokenQueuePage = async () => {
  const mode = await getServerMode();

  return (
    <TokenQueueTheme>
      <TokenQueueDisplay mode={mode} />
    </TokenQueueTheme>
  );
};

export default TokenQueuePage;