import moment from "moment/moment";

function calculateDeadline(deadline) {
    if (deadline) {
        let dl = moment(deadline);
        if (dl.isAfter(moment())) {
            return {
                text: dl.fromNow(true),
                ms: moment.duration(dl.diff(moment())),
                date: dl.format("LL"),
                valid: true,
            };
        }
    }

    return {
        text: "",
        ms: 999999999999999,
        valid: false,
    };
}

export { calculateDeadline };
