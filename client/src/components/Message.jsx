import React, { Fragment, useContext } from 'react'
import appContext from '../context/appContext'

function Message() {
    const { msg, setMsg } = useContext(appContext);
    return (
        <Fragment>
            {
                (msg) ? (
                    <div className="msg_container">
                        <p className="msg">{ msg }</p>
                    </div>
                ) : null
            }
        </Fragment>
    )
}

export default Message