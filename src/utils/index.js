export const factorial = (n) => {
    return (n != 1) ? n * factorial(n - 1) : 1;
}

export const pow = (x, y) => {
    return Math.pow(x, y);
}
