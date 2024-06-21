import { format } from "date-fns";
import { useState } from "react";
import { PaginationButtons } from "../../../../@/components/pagination-buttons";
import { CopyAddressButton } from "../../../../@/components/ui/CopyAddressButton";
import { ScrollShadow } from "../../../../@/components/ui/ScrollShadow/ScrollShadow";
import { Badge } from "../../../../@/components/ui/badge";
import { Skeleton } from "../../../../@/components/ui/skeleton";
import { cn } from "../../../../@/lib/utils";
import {
  type PayPurchasesData,
  getPayPurchases,
  usePayPurchases,
} from "../hooks/usePayPurchases";
import { ExportToCSVButton } from "./ExportToCSVButton";
import {
  CardHeading,
  NoDataAvailable,
  TableData,
  TableHeading,
  TableHeadingRow,
} from "./common";

type UIData = {
  purchases: PayPurchasesData["purchases"];
  pages: number;
};

const pageSize = 10;

export function PaymentHistory(props: {
  clientId: string;
  from: Date;
  to: Date;
}) {
  const [page, setPage] = useState(1);

  const purchasesQuery = usePayPurchases({
    clientId: props.clientId,
    from: props.from,
    to: props.to,
    start: (page - 1) * pageSize,
    count: pageSize,
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

    const purchases = purchasesQuery.data.purchases;
    const totalCount = purchasesQuery.data.count;

    if (purchases.length === 0) {
      return { isError: true };
    }

    return {
      data: {
        purchases,
        pages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  const uiData = getUIData();

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between gap-2 lg:items-center">
        <CardHeading> Transaction History</CardHeading>
        {!uiData.isError && (
          <ExportToCSVButton
            fileName="transaction_history"
            getData={async () => {
              const purchaseData = await getPayPurchases({
                clientId: props.clientId,
                count: 10000,
                from: props.from,
                start: 0,
                to: props.to,
              });

              return getCSVData(purchaseData.purchases);
            }}
          />
        )}
      </div>

      <div className="h-5" />

      {!uiData.isError ? (
        <RenderData
          data={uiData.data}
          activePage={page}
          setPage={setPage}
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
  isLoadingMore: boolean;
  activePage: number;
  setPage: (page: number) => void;
}) {
  return (
    <div>
      <ScrollShadow>
        <table className="w-full selection:bg-inverted selection:text-inverted-foreground ">
          <thead>
            <TableHeadingRow>
              <TableHeading> Bought </TableHeading>
              <TableHeading> Paid </TableHeading>
              <TableHeading>Type</TableHeading>
              <TableHeading>Status</TableHeading>
              <TableHeading>Recipient</TableHeading>
              <TableHeading>Date</TableHeading>
            </TableHeadingRow>
          </thead>
          <tbody>
            {props.data && !props.isLoadingMore ? (
              <>
                {props.data.purchases.map((purchase) => {
                  return (
                    <TableRow key={purchase.purchaseId} purchase={purchase} />
                  );
                })}
              </>
            ) : (
              <>
                {new Array(pageSize).fill(0).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: ok
                  <SkeletonTableRow key={i} />
                ))}
              </>
            )}
          </tbody>
        </table>
      </ScrollShadow>

      <div className="h-8" />

      <PaginationButtons
        activePage={props.activePage}
        totalPages={props.data?.pages || 5}
        onPageClick={props.setPage}
      />
    </div>
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

function SkeletonTableRow() {
  return (
    <tr className="border-b border-border">
      <TableData>
        <Skeleton className="h-7 w-20" />
      </TableData>
      <TableData>
        <Skeleton className="h-7 w-20" />
      </TableData>
      <TableData>
        <Skeleton className="h-7 w-20 rounded-2xl" />
      </TableData>
      <TableData>
        <Skeleton className="h-7 w-20 rounded-2xl" />
      </TableData>
      <TableData>
        <Skeleton className="h-7 w-[140px]" />
      </TableData>
      <TableData>
        <Skeleton className="h-7 w-[200px]" />
      </TableData>
    </tr>
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
