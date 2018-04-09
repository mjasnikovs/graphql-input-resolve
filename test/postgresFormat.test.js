const test = require('tape')
const schema = require('tape-schema')

const {
	postgresFormat,
	stringFormat,
	integerFormat,
	floatFormat,
	booleanFormat
} = require('../src')

const formatTest = postgresFormat({
	string: stringFormat(),
	integer: integerFormat({naturalNumber: true}),
	float: floatFormat(),
	boolean: booleanFormat(),
	stringList: [stringFormat()],
	integerList: [integerFormat()],
	floatList: [floatFormat()],
	booleanList: [booleanFormat()],
	undefinedList: [stringFormat()]
})

const inputObject = {
	string: 'string',
	integer: 10,
	float: 10.1,
	boolean: true,
	stringList: ['list'],
	integerList: [10],
	floatList: [10.1],
	booleanList: [true]
}

const outputObject = [
	{key: 'string', type: 'text', value: 'string'},
	{key: 'integer', type: 'int', value: 10},
	{key: 'float', type: 'numeric', value: 10.1},
	{key: 'boolean', type: 'boolean', value: true},
	{key: 'stringList', type: 'text[]', value: ['list']},
	{key: 'integerList', type: 'int[]', value: [10]},
	{key: 'floatList', type: 'numeric[]', value: [10.1]},
	{key: 'booleanList', type: 'boolean[]', value: [true]}
]

test('postgresFormat success', t => {
	const result = formatTest(inputObject)
	schema.test(t, outputObject, result)
	t.end()
})