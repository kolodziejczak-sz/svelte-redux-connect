import { isObject } from "./utils";

const defaultMapDispatchToProps = dispatch => ({ dispatch });

const mapDispatchToPropsFactory = (draft = defaultMapDispatchToProps) => {
    if (isObject(draft)) {
        const draftEntries = Object.entries(draft);

        return dispatch =>
            draftEntries.reduce(
                (dispatchProps, [key, actionCreator]) => ({
                    ...dispatchProps,
                    [key]: (...args) => dispatch(actionCreator(...args))
                }),
                {}
            );
    }

    return draft;
};

export default mapDispatchToPropsFactory;
