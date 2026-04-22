import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

type UserRouteProps = {
    component: React.FC;
    exact?: boolean;
    path: string;
};

const ProtectedRoute: React.FC<UserRouteProps> = ({ component, exact, path }) => {
    const loggedIn = useSelector((state:any) => state.auth.loggedIn);

    if (!loggedIn)               return <Redirect to="/" />;

    return <Route component={component} path={path} exact={exact} />;
};

export default ProtectedRoute;