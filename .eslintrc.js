module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "env": {
    "es6": true,
    "browser": true,
    "mocha": true,
    "jest/globals": true,
  },
  "plugins": [
    "react",
    "mocha",
    "jest",
  ],
  "globals": {
    "React": true,
    "web3": false,
    "artifacts": false,
    "contract": false,
  },
  "rules": {
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "no-underscore-dangle": 0,
    "no-await-in-loop": 0,
    "no-constant-condition": 0,
    "max-len": 0,
    "no-console": 0,
    "react/prop-types": 0,
    "no-nested-ternary": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "no-unused-vars": 0,
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
    "jsx-a11y/label-has-associated-control": [ "error", {
      "required": {
        "some": [ "nesting", "id"  ]
      }
    }],
    "jsx-a11y/label-has-for": [ "error", {
      "required": {
        "some": [ "nesting", "id"  ]
      }
    }],
    "import/prefer-default-export": 0,
    "security/no-block-members": 0,
    "mocha/no-exclusive-tests": "error",
    'no-plusplus': 'off',
    "import/no-named-as-default": 0
  }
};