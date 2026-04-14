const calculateLevel = (hours) => {
    if (hours < 28) return 1;
    if (hours < 63) return 2;
    if (hours < 98) return 3;
    return 4;
};

const getGpaMaxHours = (gpa) => {
    if (gpa < 1.0) return 12;
    if (gpa >= 1.0 && gpa < 2.0) return 15;
    if (gpa >= 2.0 && gpa < 3.0) return 18;
    return 21;
};

module.exports = {
    calculateLevel,
    getGpaMaxHours
};
