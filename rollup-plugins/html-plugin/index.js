import rollupPluginutils from "rollup-pluginutils";
import htmlMinifier from "html-minifier";

import Template from "./template";

export default (opts) => {
	if (opts === void 0) opts = {};
	if (!opts.include) opts.include = "**/*.html";

	let filter = rollupPluginutils.createFilter(opts.include, opts.exclude);

	return {
		name: "html",
		transform: function (code, id) {
			if (filter(id)) {
				let s = (JSON.stringify(htmlMinifier.minify(code, opts.htmlMinifierOptions)));
				let x = {
					code: Template.create(s)
				};

				return x;
			}
		}
	};
};