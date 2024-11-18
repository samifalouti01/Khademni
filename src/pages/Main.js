import React from "react";
import Header from "../components/Header";

const Main = () => {
    return (
        <div>
            <Header />
            <div className="main-content">
                <h1>Welcome to the Main Page</h1>
                <p>Select an option from the navigation menu to proceed.</p>
            </div>
        </div>
    );
};

export default Main;
