import rollupPluginutils from "rollup-pluginutils";
import htmlMinifier from "html-minifier";

export default (opts) => {
	if (opts === void 0) opts = {};
	if (!opts.include) opts.include = "**/*.css";

	let filter = rollupPluginutils.createFilter(opts.include, opts.exclude);

	return {
		name: "css",
		transform: function (code, id) {
			if (filter(id)) {
				let s = (JSON.stringify(htmlMinifier.minify(code, opts.htmlMinifierOptions)));
				let x = {
					code: ("export default " + s)
				};

				return x;
			}
		}
	};
}