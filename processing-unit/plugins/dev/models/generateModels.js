const fs = require('fs');
const readline = require('readline');
const path = require('path');
const fp = require('fastify-plugin');

/**
 * @param {Fastify} fastify
 * @param {*} opts
 */
const plugin = async function (fastify, opts) {
	const generateAllTypedefs = async function () {
		const typedefs = await fastify.convertTypedefs.toArray();

		for (const typedef of typedefs) {
			generateForTypedef({ typedef });
		}
	};

	/**
	 *
	 * @param {object} opt
	 * @param {import('./convertTypedefs').Typedef} opt.typedef
	 */
	const generateForTypedef = async function ({ typedef }) {
		const inputFile = path.join(__dirname, 'template.txt');

		const tableName = typedef.name;
		const pluginName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1);
		const outputFile = path.join(__dirname, '..', '..', 'pu', 'models', `${pluginName}.js`);

		if (fs.existsSync(outputFile)) {
			fs.rmSync(outputFile);
		}

		const rl = readline.createInterface({
			input: fs.createReadStream(inputFile),
			crlfDelay: Infinity,
		});

		const output = fs.createWriteStream(outputFile);
		const replacements = getReplacementsFromTypedef({ typedef });

		rl.on('line', (line) => {
			let replaced = line;
			for (const [template, value] of Object.entries(replacements)) {
				replaced = replaced.split(template).join(value);
			}

			output.write(replaced + '\n');
		});

		rl.on('close', async () => {
			output.end();

			// Format the generated file with Prettier
			const prettier = require('prettier');
			const generatedCode = fs.readFileSync(outputFile, 'utf8');
			const formatted = await prettier.format(generatedCode, { parser: 'babel' });

			fs.writeFileSync(outputFile, formatted, 'utf8');
			fastify.log.info('[+] File generated and formatted:', outputFile);
		});
	};

	/**
	 *
	 * @param {object} opt
	 * @param {import('./convertTypedefs').Typedef} opt.typedef
	 */
	const getReplacementsFromTypedef = function ({ typedef }) {
		const tableName = typedef.name;
		const pluginName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1);
		const primaryKey = typedef.properties[0].name;

		const paramsList = [];
		const paramsAssign = [];
		const paramsJsdoc = [];
		const paramsListObjectRow = [];
		const paramsListInsert = [];
		const paramsListFilter = [];
		const paramsListSorter = [];

		for (const property of typedef.properties) {
			paramsList.push(`${property.name}`);
			paramsAssign.push(`this.${property.name} = ${property.name};`);
			paramsJsdoc.push(`* @param {${property.type}} opt.${property.name}`);

			paramsListFilter.push(`* @param {query.Filter} opt.filters.${property.name}`);
			paramsListSorter.push(`* @param {query.Sorter} opt.sorters.${property.name}`);

			// Change formatting of insert statement based on the data type
			switch (property.type) {
				// Don't escape numbers
				case 'Number':
				case 'BigInt':
					paramsListInsert.push(`\${model.${property.name}}`);
					break;

				default:
					paramsListInsert.push(`'\${model.${property.name}}'`);
					break;
			}

			// Handle big ints to convert them into regular numbers
			//! Assumes bigInts are only used for unix timestamp that can be represented using regular numbers
			switch (property.type) {
				// Don't escape numbers
				case 'BigInt':
					paramsListObjectRow.push(`${property.name}: fastify.query.bigIntToNumber(row.${property.name})`);
					break;

				default:
					paramsListObjectRow.push(`${property.name}: row.${property.name}`);
					break;
			}
		}

		const replacements = {
			'<TABLE>': tableName,
			'<PARAMS_JSDOC>': paramsJsdoc.join('\n'),
			'<PARAMS_LIST>': paramsList.join(', '),
			'<PARAMS_ASSIGN>': paramsAssign.join('\n'),
			'<PRIMARY_KEY>': primaryKey,
			'<PARAMS_LIST_INSERT>': paramsListInsert.join(', '),
			'<PARAMS_LIST_OBJECT_ROW>': paramsListObjectRow.join(',\n'),
			'<PLUGIN>': pluginName,
			'<PARAMS_LIST_FILTER>': paramsListFilter.join('\n'),
			'<PARAMS_LIST_SORTER>': paramsListSorter.join('\n'),
		};

		return replacements;
	};

	fastify.decorate('generateModels', {
		generateAllTypedefs,
	});

	module.exports.generateAllTypedefs = generateAllTypedefs;
};

module.exports = fp(plugin, {
	fastify: '>=3.0.0',
	name: 'fastify-generate-models',
});
