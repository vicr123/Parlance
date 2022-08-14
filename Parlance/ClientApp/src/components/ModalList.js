import React from 'react';
import Styles from './ModalList.module.css';

class ModalList extends React.Component {
    static displayName = "ModalList";

    render() {
        return <div className={Styles.ModalList}>
            {this.props.children?.map((item, index) => {
                let styles = [Styles.ModalListItem];
                if (item.type === "destructive") styles.push(Styles.DestructiveListItem);
                return <div key={index} className={styles.join(" ")} onClick={item.onClick}>{item.text}</div>;
            })}
        </div>
    }
}

export default ModalList;