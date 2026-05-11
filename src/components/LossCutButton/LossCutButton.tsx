import React from "react";
import { Button } from "@mui/material";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";


export type LossCutButtonProps = {
    /** Display profit (e.g. from getLossCutProfit). Omitted from label when null. */
    profit: number | null;
    onClick: () => void;
    disabled?: boolean;
    /** Optional label override; default "Loss Cut" */
    label?: string;
    /** When '1', apply rounded style (e.g. cricket) */
    sportId?: string;
    className?: string;
};

/**
 * Reusable Loss Cut button for ExchMatchOddsTable and ExchBookmakerMarketTable.
 * Use with class "btn loss-cut-btn" so table-specific SCSS applies.
 */
const LossCutButton: React.FC<LossCutButtonProps> = ({
    profit,
    onClick,
    disabled = false,
    label = "Loss Cut",
    sportId,
    className = "btn loss-cut-btn",
}) => {
    const cFactor = CURRENCY_TYPE_FACTOR[0];
    return (
        <Button
            size="small"
            color="primary"
            variant="contained"
            className={className}
            style={{
                borderRadius: sportId === "1" ? "20px" : undefined,
            }}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
            {profit != null
                ? ` : ₹${(Number(profit) / cFactor).toFixed(2)}`
                : ""}
        </Button>
    );
};

export default LossCutButton;
