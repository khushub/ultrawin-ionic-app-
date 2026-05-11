import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";

// import SVLS_API from "../../api-services/svls-api";
import Spinner from "../../components/Spinner/Spinner";
import { fetchButtonVariables } from "../../store/slices/exchBetSlipSlice";
import { setAlertMsg } from "../../store/slices/commonSlice";
import "./ButtonVariablesModal.scss";
import { postAPIAuth } from "../../services/apiInstance";

type StoreProps = {
    buttonVariables: any[];
    fetchButtonVariables: () => void;
    setAlertMsg: Function;
    langData: any;
    onSave?: () => void;
};

const ButtonVariablesModal: React.FC<StoreProps> = (props) => {
    const {
        buttonVariables,
        fetchButtonVariables,
        setAlertMsg,
        langData,
        onSave,
    } = props;
    const dispatch = useDispatch();

    const [loading, setLoading] = useState<boolean>(false);
    const [updateVariables, setUpdateVariables] = useState<any[]>();

    const updateButtonVariables = async () => {
        setLoading(true);
        for (let uV of updateVariables) {
            if (!uV.label || !uV.stake) {
                dispatch(
                    setAlertMsg({
                        type: "error",
                        message: langData?.["invalid_label_or_amount_txt"],
                    }),
                );
                setLoading(false);
                return 0;
            }
        }

        try {
            const data = {};
            updateVariables.forEach((item, index) => {
                const num = index + 1;
                data[`label${num}`] = String(item.label);
                data[`price${num}`] = Number(item.stake);
            });
            

            const response = await postAPIAuth('/updateButtonAPI', data);
            if(response?.data?.success) {
                setAlertMsg({
                    type: "success",
                    message: langData?.["button_variables_save_success_txt"],
                });
                if (onSave) {
                    onSave();
                }
            } else {
                setAlertMsg({
                    type: "error",
                    message: langData?.["general_err_txt"],
                });
            }
        } catch(err) {
            console.log('err: ', err);
            dispatch(
                setAlertMsg({
                    type: "error",
                    message: langData?.["invalid_label_or_amount_txt"],
                }),
            );
        } finally {
            fetchButtonVariables();
            setLoading(false);
        }
    };

    useEffect(() => {
        if (buttonVariables.length === 0) {
            fetchButtonVariables();
        }
    }, []);

    useEffect(() => {
        setUpdateVariables(buttonVariables);
    }, [buttonVariables]);


    const updateButtonLabel = (index: number, label: string) => {
        setUpdateVariables(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, label } : item
            )
        );
    };

    const updateButtonAmount = (index: number, amt: number) => {
        setUpdateVariables(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, stake: amt } : item
            )
        );
    };


    const addOrRemove = (index: number, stake: number, operation: string) => {
        if (stake === undefined || stake === null) {
            dispatch(
                setAlertMsg({
                    type: "error",
                    message: langData?.["enter_min_value_txt"],
                }),
            );
            return;
        }

        const updateBtnVars = [...updateVariables];
        if (operation === "+") {
            updateBtnVars[index].stake += updateBtnVars[index].stake;
        } else {
            updateBtnVars[index].stake -= Math.floor(
                updateBtnVars[index].stake / 2,
            );
            if (updateBtnVars[index].stake <= 0) {
                updateBtnVars[index].stake = 0;
            }
        }
        setUpdateVariables(updateBtnVars);
    };

    return (
        <div className="button-variables-modal-ctn">
            {loading && (
                <div className="modal-spinner">
                    <Spinner />
                </div>
            )}
            <div className="stake-settings-modal-ctn">
                {updateVariables &&
                    updateVariables.map((bV, idx) => (
                        <div
                            key={`modal-stake-btn-${idx}`}
                            className="indv-stake-btn-modal"
                        >
                            <div className="label-text-modal">
                                {idx === 0 && (
                                    <div className="label-text-sub-modal">
                                        {langData?.["button_label"]}
                                    </div>
                                )}

                                <input
                                    type="text"
                                    className="bt-input-modal"
                                    value={bV.label}
                                    onChange={(e) =>
                                        updateButtonLabel(idx, e.target.value)
                                    }
                                />
                            </div>

                            <div className="label-number-modal">
                                {idx === 0 && (
                                    <div className="label-text-sub-modal">
                                        {langData?.["input_value"]}
                                    </div>
                                )}

                                <input
                                    type="number"
                                    className="bt-input-modal"
                                    value={bV.stake}
                                    onChange={(e) =>
                                        updateButtonAmount(
                                            idx,
                                            parseFloat(e.target.value),
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
            </div>

            <div className="modal-actions">
                <button
                    className="save-btn-modal"
                    onClick={updateButtonVariables}
                    disabled={loading}
                >
                    {langData?.["save"]}
                </button>
            </div>
        </div>
    );
};

const mapStateToProps = (state: any) => {
    return {
        buttonVariables: state.exchBetSlip.buttonVariables,
        langData: state.common.langData,
    };
};

const mapDispatchToProps = (dispatch: Function) => {
    return {
        fetchButtonVariables: () => dispatch(fetchButtonVariables()),
        setAlertMsg: (alert: any) => dispatch(setAlertMsg(alert)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ButtonVariablesModal);
