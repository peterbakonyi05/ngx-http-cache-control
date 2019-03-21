module.exports = {
	bail: true,
	testURL: "http://localhost",
	globals: {
		"ts-jest": {
			tsConfigFile: "./tsconfig.test.json",
			useExperimentalLanguageServer: true
		},
		__TRANSFORM_HTML__: true
	},
	setupTestFrameworkScriptFile: "./test/test-setup.ts",
	transform: {
		"^.+\\.(ts|js|html)$": "<rootDir>/node_modules/jest-preset-angular/preprocessor.js"
	},
	moduleNameMapper: {
		"@ngx-http-cache-control/(.*)": "<rootDir>/packages/$1"
	},
	testRegex: ".*spec.ts$",
	moduleFileExtensions: [
		"ts",
		"js",
		"json"
	],
	transformIgnorePatterns: [
		"/node_modules/",
		"/dist/",
	],
	modulePathIgnorePatterns: [
		"/dist/",
		"/node_modules/"
	],
	projects: [
		"<rootDir>",
		"<rootDir>/packages/*"
	],
	collectCoverageFrom: [
		"packages/*/*/src/**/*.ts",
		"packages/*/src/**/*.ts"
	],
	coveragePathIgnorePatterns: [
		".*(spec|const|config|mock|module|public-api|index|mock|model).ts"
	],
	coverageReporters: [
		"lcovonly",
		"html"
	]
};
