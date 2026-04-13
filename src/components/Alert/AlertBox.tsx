import React, { useState, useEffect, FC } from "react";
import { Box, Typography, IconButton, styled, keyframes } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import WarningOutlinedIcon from "@mui/icons-material/WarningOutlined";
import { connect } from "react-redux";
import { setAlertMsg } from "../../store/slices/commonSlice";

// 1. Define Animations (equivalent to your transition property)
const shrinkWidth = keyframes`
    from { width: 100%; }
    to { width: 0%; }
`;

// 2. Create a Styled Component for the Container
// We pass 'alertType' as a custom prop to handle conditional styling
const AlertContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== "alertType",
})<{ alertType?: "success" | "error" | "warning" | string }>(
    ({ theme, alertType }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
        boxShadow: theme.shadows[3],
        borderWidth: "2px",
        borderStyle: "solid",
        width: "300px",
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 11,
        backgroundColor: "#fff", // default

        // Conditional styles based on alertType
        ...(alertType === "success" && {
            borderColor: "#4caf50",
            backgroundColor: "#e6f4ea",
        }),
        ...(alertType === "error" && {
            borderColor: "#f44336",
            backgroundColor: "#fcecea",
        }),
        ...(alertType === "warning" && {
            borderColor: "#ff9800",
            backgroundColor: "#fff4e5",
        }),
        [theme.breakpoints.down("sm")]: {
            // 'xs' is now 'sm' or treated differently in v5 depending on setup, but standard is down('sm') for mobile
            right: 0,
            left: 0,
            margin: "auto",
            top: "40px",
        },
    }),
);

// 3. Define Types
type StateProps = {
    alert: any;
    setAlertMsg: Function;
};

const AlertBox: FC<StateProps> = ({ alert, setAlertMsg }) => {
    const handleClose = () => {
        setAlertMsg({
            type: "",
            message: "",
        });
    };

    useEffect(() => {
        if (!alert?.message) return;

        const timerDuration =
            alert?.message === "Signed up successfully" ? 30000 : 5000;

        const closeTimer = setTimeout(() => {
            handleClose();
        }, timerDuration);

        return () => {
            clearTimeout(closeTimer);
        };
    }, [alert, handleClose]); // Added dependencies to satisfy linter

    if (!alert?.message) return null;

    return (
        <AlertContainer
            alertType={alert.type}
            className={
                alert?.message === "Signed up successfully"
                    ? "sign-up-success-gtm"
                    : ""
            }
        >
            <Box display="flex" alignItems="center">
                {/* Icon Logic */}
                {alert?.type === "success" ? (
                    <CheckCircleIcon sx={{ mr: 1, color: "#4caf50" }} />
                ) : alert?.type === "warning" ? (
                    <WarningOutlinedIcon sx={{ mr: 1, color: "#ff9800" }} />
                ) : (
                    <ErrorIcon sx={{ mr: 1, color: "#f44336" }} />
                )}

                {/* Message */}
                <Typography
                    sx={{
                        fontFamily: "Lato",
                        fontWeight: 500,
                        fontSize: "13px",
                    }}
                >
                    {alert?.message}
                </Typography>
            </Box>

            {/* Close Button */}
            <IconButton
                size="small"
                onClick={() => handleClose()}
                sx={{
                    borderRadius: "50%",
                    border: "1.25px solid gray",
                    padding: "4px",
                    height: "20px",
                    width: "20px",
                    ml: 1, // Add some margin left if needed
                }}
            >
                <CloseIcon sx={{ fontSize: "15px" }} />
            </IconButton>

            {/* Progress Bar (Optional - Re-implemented with sx if you need it) */}
            {/* <Box
                    sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "4px",
                    backgroundColor: alert.type === 'success' ? "#4caf50" : "#f44336",
                    animation: `${shrinkWidth} ${alert.message === "Signed up successfully" ? "30s" : "5s"} linear forwards`
                    }}
                /> 
            */}
        </AlertContainer>
    );
};

const mapStateToProps = (state: any) => ({
    alert: state.common.alert,
});

const mapDispatchToProps = (dispatch: Function) => ({
    setAlertMsg: (alert: any) => dispatch(setAlertMsg(alert)),
});

export const StyledAlertBox = connect(
    mapStateToProps,
    mapDispatchToProps,
)(AlertBox);
