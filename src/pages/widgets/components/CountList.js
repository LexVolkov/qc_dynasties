import React from "react";

const CountList = ({color,name,count}) => {

    return (
        <div key={color} style={{
            backgroundColor: color,
            padding: "5px",
            marginBottom: "5px",
            whiteSpace: "normal",
            wordWrap: "break-word",
            border: "1px solid rgba(0,0,0,0.5)"
        }}>
            {name}: {count}
        </div>
    );
};

export default CountList;
