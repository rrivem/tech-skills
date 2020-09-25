const path = require('path');
const fs = require('fs');
const csvtojson = require('csvtojson/V2');

const nesting = ['Area', 'Categoria', 'Tema', 'Subtema'];
const getDepth = item => nesting.findIndex(n => item[n]);

function getTree(lines) {
	function addProperties(scope, props, enumerable) {
		for (p in props) {
			Object.defineProperty(scope, p, { enumerable, value: props[p] });
		}
	}
	var TreeNode = function (data, depth) {
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

	var tree = new TreeNode({}, -1);

	var levels = [tree];
	function topnode() {
		return levels[levels.length - 1];
	}

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];

		var depth = getDepth(line);

		if (depth >= 0) {
			//then add node to tree

			while (depth - topnode().depth <= 0) {
				levels.pop();
			}
			var depth = levels.length - 1;
			var node = new TreeNode(line, depth);
			node.parent = topnode();
			node.parent.children.push(node);
			levels.push(node);
		}
	}
	return tree;
}

(async function () {
	const array = await csvtojson().fromFile(path.join(__dirname, 'taxonomy.csv'));
	const root = getTree(array);

	fs.writeFileSync(path.join(__dirname, 'src', 'taxonomy.json'), JSON.stringify(root.children, null, '\t'), {
		encoding: 'utf-8'
	});
})();
