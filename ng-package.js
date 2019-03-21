module.exports = {
	deleteDestPath: !process.env.WATCH_MODE,
	lib: {
		entryFile: "public-api.ts",
		cssUrl: "inline",
		umdModuleIds: {
			// vendors
			"tslib": "tslib",
			"lodash": "_",

			// local
			"@ngx-http-cache-control/core": "ngx-http-cache-control.core"
		}
	},
	whitelistedNonPeerDependencies: ["."]
}
