const path = require('path');
const fs = require('fs');
const csvtojson = require('csvtojson/v2');

const nesting = ['Area', 'Categoria', 'Tema', 'Subtema'];
const getDepth = item => nesting.findIndex(n => item[n]);

function getTree(lines) {
	function addProperties(scope, props, enumerable) {
		for (const p in props) {
			Object.defineProperty(scope, p, { enumerable, value: props[p] });
		}
	}
	const TreeNode = function (data, depth) {
		this.parent = null;
		addProperties(
			this,
			{
				depth,
				parent: null
			},
			false
		);
		addProperties(
			this,
			{
				title: data[nesting[getDepth(data)]],
				usado: data.Usado === 'Preguntar',
				conocimiento: data.Conocimiento === 'Preguntar',
				interes: data.Interes === 'Preguntar',
				children: []
			},
			true
		);
	};

	const tree = new TreeNode({}, -1);

	const levels = [tree];
	function topnode() {
		return levels[levels.length - 1];
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		const depth = getDepth(line);

		if (depth >= 0) {
			//then add node to tree

			while (depth - topnode().depth <= 0) {
				levels.pop();
			}
			const nodeDepth = levels.length - 1;
			const node = new TreeNode(line, nodeDepth);
			node.parent = topnode();
			node.parent.children.push(node);
			levels.push(node);
		}
	}
	return tree;
}

function simplify(node) {
	const { children, title, ...values } = node;
	return {
		[title]: { ...values, children: children.reduce((res, node) => ({ ...res, ...simplify(node) }), {}) }
	};
}

(async function () {
	const csv = fs.readFileSync(path.join(__dirname, 'taxonomy.tsv'), { encoding: 'utf-8' }).replace(/\t/g, ',');
	const array = await csvtojson().fromString(csv);
	const root = getTree(array);
	const simplified = root.children.reduce((res, c) => ({ ...res, ...simplify(c) }), {});
	fs.writeFileSync(path.join(__dirname, 'src', 'taxonomy.json'), JSON.stringify(simplified, null, '\t'), {
		encoding: 'utf-8'
	});
})();
