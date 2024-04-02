import type { BuyWithCryptoQuote } from "../../../../../../../pay/buyWithCrypto/actions/getQuote.js";
import { formatNumber } from "../../../../../../../utils/formatNumber.js";
import { Spacer } from "../../../../components/Spacer.js";
import { Container } from "../../../../components/basic.js";
import { Text } from "../../../../components/text.js";
import { useCustomTheme } from "../../../../design-system/CustomThemeProvider.js";
import { StyledDiv } from "../../../../design-system/elements.js";
import { radius, spacing } from "../../../../design-system/index.js";

/**
 * @internal
 */
export function SwapFees(props: { quote: BuyWithCryptoQuote }) {
  return (
    <Container animate="fadein">
      <BorderContainer>
        <Container
          flex="row"
          style={{
            justifyContent: "space-between",
          }}
        >
          <Text color="primaryText" size="xs">
            Processing Fees
          </Text>
          <Container
            flex="column"
            gap="xxs"
            style={{
              alignItems: "flex-end",
            }}
          >
            {props.quote.processingFees.map((fee) => {
              const feeAmount = formatNumber(Number(fee.amount), 4);

              return (
                <Container key={fee.token.symbol} flex="row" gap="xxs">
                  <Text color="primaryText" size="xs">
                    {feeAmount === 0 ? "~" : ""}
                    {feeAmount} {fee.token.symbol}
                  </Text>
                  <Text color="secondaryText" size="xs">
                    (${fee.amountUSDCents / 100})
                  </Text>
                </Container>
              );
            })}
          </Container>
        </Container>

        <Spacer y="sm" />
        <Container
          flex="row"
          center="y"
          style={{
            justifyContent: "space-between",
          }}
        >
          <Text size="xs" color="primaryText">
            Estimated Duration
          </Text>
          <Text size="xs" color="primaryText">
            ~{" "}
            {props.quote.swapDetails.estimated.durationSeconds
              ? formatSeconds(props.quote.swapDetails.estimated.durationSeconds)
              : ""}
          </Text>
        </Container>
      </BorderContainer>
    </Container>
  );
}

const BorderContainer = /* @__PURE__ */ StyledDiv(() => {
  const theme = useCustomTheme();
  return {
    padding: spacing.sm,
    border: `1px solid ${theme.colors.borderColor}`,
    borderRadius: radius.md,
  };
});

function formatSeconds(seconds: number) {
  console.log("seconds", seconds);
  // hours and minutes
  if (seconds > 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // minutes only
  else if (seconds > 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds < 10) {
      return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${seconds}s`;
}
