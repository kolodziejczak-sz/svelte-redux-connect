const defaultMapStateToProps = state => ({ state });

const mapStateToPropsFactory = (draft = defaultMapStateToProps) => {
    return draft;
};

export default mapStateToPropsFactory;
