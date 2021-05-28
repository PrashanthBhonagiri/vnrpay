const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;
const GENESIS_DATA = {
    timestamp : 1,
    lastHash : '-----',
    hash : 'genesis hash',
    data : [],
    difficulty : INITIAL_DIFFICULTY,
    nonce : 0,
};

module.exports = {
    GENESIS_DATA,
    INITIAL_DIFFICULTY,
    MINE_RATE
}