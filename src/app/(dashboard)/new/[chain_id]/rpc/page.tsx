import { getChain } from "../../chainlist/getChain";
import { InfoCard } from "../InfoCard";
import { ChainLiveStats } from "../overview/components/ChainLiveStats";

export default async function Page(props: { params: { chain_id: string } }) {
  const chain = await getChain(props.params.chain_id);

  return (
    <div className="pb-20">
      <InfoCard
        title="thirdweb RPC Edge"
        links={[
          {
            label: "Learn More",
            href: "https://portal.thirdweb.com/infrastructure/rpc-edge/overview",
          },
        ]}
      >
        <p>
          Remote Procedure Call (RPC) Edge provides reliable access to querying
          data and interacting with the blockchain through global edge RPCs
        </p>

        <p>
          By default, thirdweb provides publicly available RPCs for over 1000+
          EVM Networks
        </p>
      </InfoCard>

      {chain.rpc[0] && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10 gap-4">
          <ChainLiveStats rpc={chain.rpc[0]} />
        </div>
      )}
    </div>
  );
}
