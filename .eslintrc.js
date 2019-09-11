module.exports = {
    "env": {
        "node": true,
        "es6": true,
        "greasemonkey": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "off",
            4
        ],
        "quotes": [
            "warn",
            "double"
        ],
        "semi": [
            "warn",
            "always"
        ],
        "no-unused-vars": [
            "warn", {
                "vars": "all",
                "args": "after-used",
                "ignoreRestSiblings": false
            }
        ],
        "no-irregular-whitespace": "off",
        "no-console": [
            "off"
        ]
    }
};