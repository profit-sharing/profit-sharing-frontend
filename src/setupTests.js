const address = "9i4bn2bqn7yYXuM7RQGHqB9kGqqWWiqBaSmU9HvKb3UhTbaTCN3"

beforeAll(() => {
    const ergo = {
        get_change_address: jest.fn(() => address),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    };
})

global.ergo = {
    get_change_address: jest.fn(() => address),
};
// TODO: Remove this file these statements are not what we need here
