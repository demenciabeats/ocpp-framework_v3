function compareData(actual, expected) {
    return JSON.stringify(actual) === JSON.stringify(expected);
}

export default compareData;
