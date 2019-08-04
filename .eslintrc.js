 const eslintSettings = {
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
    },
    rules: {
        "prefer-const": ["error", {
            destructuring: "any",
            ignoreReadBeforeAssign: false
        }]
    },
    // fix: true,
    //  globals: [
    //      'jQuery',
    //      '$'
    //  ],
     // envs: [
     //     'browser',
     //     'es6',
     // ]
};
module.exports = eslintSettings;
