import React, { useEffect } from "react";
import LoginForm from '../../components/LoginForm/LoginForm';
import "./index.scss";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { CONFIG } from '../../config/config'
const modalCloseHandler = () => {};

const LoginPage: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    
    return (
        <div className="login-ctn">
            <div className="title-row" onClick={() => history.push("/home")}>
                <img
                    src={CONFIG.logo}
                    alt="website"
                    className="logo"
                />
            </div>

            <div className="login-card">
                <LoginForm modalCloseHandler={modalCloseHandler} />
            </div>
        </div>
    );
};

export default LoginPage;
