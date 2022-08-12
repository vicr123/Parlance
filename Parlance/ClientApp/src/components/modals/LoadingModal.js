import Modal from "../Modal";
import React from "react";

export default class LoadingModal extends  React.Component {
    #timeout;
    static #stages = [
        "ooooo",
        "Ooooo",
        "OOooo",
        "OOOoo",
        "OOOOo",
        "OOOOO",
        "oOOOO",
        "ooOOO",
        "oooOO",
        "ooooO"
    ]
    
    
    constructor(props) {
        super(props);
        
        this.state = {
            stage: 0
        }
    }
    
    componentDidMount() {
        this.#timeout = setInterval(() => {
            this.setState(state => ({
                stage: state.stage === LoadingModal.#stages.length - 1 ? 0 : state.stage + 1
            }))
        }, 50);
    }
    
    componentWillUnmount() {
        clearInterval(this.#timeout);
    }

    render() {
        return <Modal>
            <div style={{display: "flex", justifyContent: "center", fontFamily: "monospace"}}>
                {LoadingModal.#stages[this.state.stage]}
            </div>
        </Modal>
    }
}