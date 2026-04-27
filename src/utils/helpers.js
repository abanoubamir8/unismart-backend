const calculateLevel = (hours) => {
    if (hours < 28) return 1;
    if (hours < 63) return 2;
    if (hours < 98) return 3;
    return 4;
};

const getGpaMaxHours = (gpa, yearOrLevel = null) => {
    const freshmanIndicators = [1, '1', 'First', 'first', 'الأولى', 'اولى', 'المستوى الأول'];
    
    if (gpa === 0 || gpa === 0.0 || !gpa || freshmanIndicators.includes(yearOrLevel)) {
        return 18;
    }

    if (gpa === 4 || gpa === 4.0) {
        return 21;
    }

    if (gpa < 2.0) {
        return 12;
    }

    if (gpa >= 2.0 && gpa < 3.0) {
        return 18;
    }

    return 21;
};

module.exports = {
    calculateLevel,
    getGpaMaxHours
};
