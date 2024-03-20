import type { Config } from "jest";

const config: Config = {
    moduleFileExtensions: ["js", "json", "ts"],
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },
    collectCoverageFrom: ["**/*.(t|j)s"],
    coverageDirectory: "../coverage",
    testEnvironment: "node",
    globalSetup: "./test/start.ts",
    globalTeardown: "./test/end.ts",
};

export default config;
