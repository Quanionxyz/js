import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CopyAddressButton } from "../../../../@/components/ui/CopyAddressButton";
import { ScrollShadow } from "../../../../@/components/ui/ScrollShadow/ScrollShadow";
import { Spinner } from "../../../../@/components/ui/Spinner/Spinner";
import { Badge } from "../../../../@/components/ui/badge";
import { Skeleton } from "../../../../@/components/ui/skeleton";
import { cn } from "../../../../@/lib/utils";
import {
  type PayPurchasesData,
  usePayPurchases,
} from "../hooks/usePayPurchases";
import { ExportToCSVButton } from "./ExportToCSVButton";
import { CardHeading, NoDataAvailable } from "./common";

type UIData = {
  purchases: PayPurchasesData["purchases"];
  showLoadMore: boolean;
};

export function PaymentHistory(props: {
  clientId: string;
  from: Date;
  to: Date;
}) {
  const purchasesQuery = usePayPurchases({
    clientId: props.clientId,
    from: props.from,
    to: props.to,
    pageSize: 100,
  });

  function getUIData(): {
    data?: UIData;
    isLoading?: boolean;
    isError?: boolean;
  } {
    if (purchasesQuery.isLoading) {
      return { isLoading: true };
    }
    if (purchasesQuery.isError) {
      return { isError: true };
    }

    const purchases = purchasesQuery.data.pages.flatMap(
      (page) => page.pageData.purchases,
    );

    if (purchases.length === 0) {
      return { isError: true };
    }

    return {
      data: {
        purchases,
        showLoadMore: !!purchasesQuery.hasNextPage,
      },
    };
  }

  const uiData = getUIData();
  const purchases = uiData.data?.purchases;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between gap-2 lg:items-center">
        <CardHeading> Transaction History</CardHeading>
        {purchases && (
          <ExportToCSVButton
            fileName="transaction_history"
            getData={() => {
              return getCSVData(purchases);
            }}
          />
        )}
      </div>

      <div className="h-5" />

      {!uiData.isError ? (
        <RenderData
          data={uiData.data}
          loadMore={() => purchasesQuery.fetchNextPage()}
          isLoadingMore={purchasesQuery.isFetching}
        />
      ) : (
        <NoDataAvailable />
      )}
    </div>
  );
}

function RenderData(props: {
  data?: UIData;
  loadMore: () => void;
  isLoadingMore: boolean;
}) {
  return (
    <ScrollShadow
      scrollableClassName="max-h-[350px] lg:max-h-[700px]"
      disableTopShadow={true}
    >
      <table className="w-full selection:bg-muted">
        <thead>
          <tr className="border-b border-border sticky top-0 bg-background z-10">
            <TableHeading> Bought </TableHeading>
            <TableHeading> Paid </TableHeading>
            <TableHeading>Type</TableHeading>
            <TableHeading>Status</TableHeading>
            <TableHeading>Recipient</TableHeading>
            <TableHeading>Date</TableHeading>
          </tr>
        </thead>
        <tbody>
          {props.data ? (
            <>
              {props.data.purchases.map((purchase) => {
                return (
                  <TableRow key={purchase.purchaseId} purchase={purchase} />
                );
              })}
            </>
          ) : (
            <>
              {new Array(20).fill(0).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ok
                <SkeletonTableRow key={i} rowIndex={i} />
              ))}
            </>
          )}
        </tbody>
      </table>

      {props.data && (
        <>
          {props.data?.showLoadMore ? (
            <div className="flex justify-center py-3">
              <Button
                className="text-sm text-link-foreground p-2 h-auto gap-2 items-center"
                variant="ghost"
                onClick={props.loadMore}
                disabled={props.isLoadingMore}
              >
                {props.isLoadingMore ? "Loading" : "View More"}
                {props.isLoadingMore && <Spinner className="size-3" />}
              </Button>
            </div>
          ) : (
            <p className="text-center py-5 text-muted-foreground">
              No more transactions
            </p>
          )}
        </>
      )}
    </ScrollShadow>
  );
}

function TableRow(props: { purchase: PayPurchasesData["purchases"][0] }) {
  const { purchase } = props;

  return (
    <tr
      key={purchase.purchaseId}
      className="border-b border-border fade-in-0 duration-300"
    >
      {/* Bought */}
      <TableData>{`${formatTokenAmount(purchase.toAmount)} ${purchase.toToken.symbol}`}</TableData>

      {/* Paid */}
      <TableData>
        {purchase.purchaseType === "SWAP"
          ? `${formatTokenAmount(purchase.fromAmount)} ${purchase.fromToken.symbol}`
          : `${formatTokenAmount(`${purchase.fromAmountUSDCents / 100}`)} ${purchase.fromCurrencySymbol}`}
      </TableData>

      {/* Type */}
      <TableData>
        <Badge
          variant={"secondary"}
          className={cn(
            "uppercase",
            purchase.purchaseType === "ONRAMP"
              ? "bg-fuchsia-200 dark:bg-fuchsia-950 text-fuchsia-800 dark:text-fuchsia-200"
              : "bg-indigo-200 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200",
          )}
        >
          {purchase.purchaseType === "ONRAMP" ? "Fiat" : "Crypto"}
        </Badge>
      </TableData>

      {/* Status */}
      <TableData>
        <Badge
          variant={
            purchase.status === "COMPLETED"
              ? "success"
              : purchase.status === "PENDING"
                ? "warning"
                : "destructive"
          }
          className="capitalize"
        >
          {purchase.status}
        </Badge>
      </TableData>

      {/* Address */}
      <TableData>
        <CopyAddressButton
          address={purchase.fromAddress}
          variant="ghost"
          className="text-secondary-foreground"
        />
      </TableData>

      {/* Date */}
      <TableData>
        <p className="min-w-[180px] lg:min-w-auto">
          {format(new Date(purchase.updatedAt), "LLL dd, y h:mm a")}
        </p>
      </TableData>
    </tr>
  );
}

function SkeletonTableRow(props: { rowIndex: number }) {
  const skeleton = (
    <Skeleton
      className="h-7 w-20"
      style={{
        animationDelay: `${props.rowIndex * 0.1}s`,
      }}
    />
  );

  return (
    <tr className="border-b border-border">
      <TableData>{skeleton}</TableData>
      <TableData>{skeleton}</TableData>
      <TableData>{skeleton}</TableData>
      <TableData>{skeleton}</TableData>
      <TableData>{skeleton}</TableData>
      <TableData>{skeleton}</TableData>
    </tr>
  );
}

function TableData({ children }: { children: React.ReactNode }) {
  return <td className="px-0 py-2 text-sm">{children}</td>;
}

function TableHeading(props: { children: React.ReactNode }) {
  return (
    <th className="text-left px-0 py-3 text-sm font-medium text-muted-foreground min-w-[150px]">
      {props.children}
    </th>
  );
}

function getCSVData(data: PayPurchasesData["purchases"]) {
  const header = ["Type", "Bought", "Paid", "Status", "Recipient", "Date"];

  const rows: string[][] = data.map((purchase) => [
    // bought
    `${formatTokenAmount(purchase.toAmount)} ${purchase.toToken.symbol}`,
    // paid
    purchase.purchaseType === "SWAP"
      ? `${formatTokenAmount(purchase.fromAmount)} ${purchase.fromToken.symbol}`
      : `${formatTokenAmount(`${purchase.fromAmountUSDCents / 100}`)} ${purchase.fromCurrencySymbol}`,
    // type
    purchase.purchaseType === "ONRAMP" ? "Fiat" : "Crypto",
    // status
    purchase.status,
    // recipient
    purchase.fromAddress,
    // date
    format(new Date(purchase.updatedAt), "LLL dd y h:mm a"),
  ]);

  return { header, rows };
}

function formatTokenAmount(value: string) {
  // have at max 3 decimal places
  const strValue = Number(`${Number(value).toFixed(3)}`);

  if (Number(strValue) === 0) {
    return "~0";
  }
  return strValue;
}
