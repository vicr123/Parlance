import Modal from "../Modal";
import React from "react";
import Spinner from "../Spinner";

export default function LoadingModal() : React.ReactElement {
    return <Modal>
        <Spinner.Container/>
    </Modal>
}