const tokenBlacklist = new Set();

function addToBlacklist(token) {
    tokenBlacklist.add(token);

        //milisegundos 24h 60min 60segxmin  100 milise segun
        //60 * 60 * 1000
        // 2 * 60 * 60 * 1000
    setTimeout(() => tokenBlacklist.delete(token),  60 * 60 * 1000); // 1h
}

module.exports = {
    tokenBlacklist,
    addToBlacklist
};
