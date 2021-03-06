import {
	capitalizeConst
} from '../sanitization'

import {
	isObject,
	isUndefined,
	isEmpty,
	inEnum,
	isMaxString,
	isMinString,
	isEmail,
	isString,
	isNaturalNumber,
	isBoolean
} from '../validators'

import {
	trim,
	trimLeft,
	trimRight,
	toLowerCase,
	toUpperCase,
	truncate,
	capitalize
} from '../sanitization'

import {
	NAMESPACE_DEFAULT_NAME,
	IFormatInputOptions,
	defaultFormatOptions,
	IPgOutputType,
	postgresDataTypes
} from '../types'

interface IStringOptions {
	// sanitize
	trim?: boolean,
	trimLeft?: boolean,
	trimRight?: boolean,
	toLowerCase?: boolean,
	toUpperCase?: boolean,
	truncate?: number | false,
	capitalize?: capitalizeConst | false,

	// validate
	notUndef?: boolean,
	notEmpty?: boolean,
	enum?: string[] | false,
	min?: number | false,
	max?: number | false,
	email?: boolean,
	test?: RegExp | false,
	pgType?: postgresDataTypes
}

interface IStringConfig extends IStringOptions {
	name: string
}

const defaultStringOptions: IStringConfig = {
	// config
	name: NAMESPACE_DEFAULT_NAME,

	// sanitize
	trim: false,
	trimLeft: false,
	trimRight: false,
	toLowerCase: false,
	toUpperCase: false,
	truncate: false,
	capitalize: false,

	// validate
	notUndef: false,
	notEmpty: false,
	enum: false,
	min: false,
	max: false,
	email: false,
	test: false,
	pgType: 'text'
}

const stringTest = (
	value: any,
	config: IStringConfig,
	options: IFormatInputOptions = defaultFormatOptions
): null | undefined | Error | string | IPgOutputType => {
	if (config.notUndef === false && config.notEmpty === false && typeof value === 'undefined') {
		if (options.outputType === 'POSTGRES') {
			return {
				value: undefined,
				key: options.key,
				type: config.pgType
			}
		}
		return
	}

	if (config.notUndef === true && isUndefined(value)) {
		return new Error(`Format error. "${options.namespace || config.name}" has invalid value "${value}". Expected string, found undefined value.`)
	}

	if (config.notEmpty === false && value === null) {
		if (options.outputType === 'POSTGRES') {
			return {
				value: null,
				key: options.key,
				type: config.pgType
			}
		}
		return null
	}

	if (config.notEmpty === true && isEmpty(value)) {
		return new Error(`Format error. "${options.namespace|| config.name}" has invalid value "${value}". Expected non-empty string, found "${value}".`)
	}

	if (!isString(value)) {
		return new Error(`Format error. "${options.namespace|| config.name}" has invalid value "${value}". Expected string, found "${value}".`)
	}


	if (config.max !== false && typeof config.max !== 'undefined') {
		if (!isMaxString(value, config.max)) {
			return new Error(`Format error. "${options.namespace|| config.name}" has invalid value "${value}". Expected maximal length of "${config.max}" characters, found "${value.length}" characters.`)
		}
	}

	if (config.min !== false && typeof config.min !== 'undefined') {
		if (!isMinString(value, config.min)) {
			return new Error(`Format error. "${options.namespace|| config.name}" has invalid value "${value}". Expected minimal length of "${config.min}" characters, found "${value.length}" characters.`)
		}
	}

	if (config.enum !== false && typeof config.enum !== 'undefined') {
		if (!inEnum(value, config.enum)) {
			return new Error(`Format error. "${options.namespace|| config.name}" has invalid value "${value}". Expected one of string values "${config.enum}", found "${value}".`)
		}
	}

	if (config.email === true) {
		if (!isEmail(value)) {
			return new Error(`Format error. "${options.namespace || config.name}" has invalid value "${value}". Expected email, found "${value}".`)
		}
	}

	if (config.test !== false && typeof config.test !== 'undefined') {
		if (config.test.exec(value) === null) {
			return new Error(`Format error. "${options.namespace || config.name}" has invalid value "${value}". Expected valid regular expression test (${config.test}), found "${value}".`)
		}
	}

	let string = String(value).slice(0)

	if (config.trim === true) {
		string = trim(string)
	}

	if (config.trimLeft === true && config.trim === false) {
		string = trimLeft(string)
	}

	if (config.trimRight === true && config.trim === false) {
		string = trimRight(string)
	}

	if (config.toLowerCase === true) {
		string = toLowerCase(string)
	}

	if (config.toUpperCase === true) {
		string = toUpperCase(string)
	}

	if (config.truncate) {
		string = truncate(string, config.truncate)
	}

	if (config.capitalize) {
		string = capitalize(string, config.capitalize)
	}

	if (options.outputType === 'POSTGRES') {
		return {
			value: string,
			key: options.key,
			type: config.pgType
		}
	}

	return string
}

export default (options?: IStringOptions) => {
	if (typeof options !== 'undefined' && !isObject(options)) {
		throw new Error(`Format configuration error. Configuration is invalid. Expected object, found "${options}".`)
	}

	const config = {...defaultStringOptions, ...options}

	const invalidConfigKey = Object.keys(config).find(key => Object.keys(defaultStringOptions).indexOf(key) === -1)

	if (typeof invalidConfigKey !== 'undefined') {
		throw new Error(`Format configuration error. Configuration is invalid, param "${invalidConfigKey}" not found. Expected valid configuration object, found invalid key "${invalidConfigKey}".`)
	}

	if (!isString(config.name)) {
		throw new Error(`Format configuration error. "name" param has invalid value "${config.name}". Expected string, found "${config.name}".`)
	}

	if (!isBoolean(config.trim)) {
		throw new Error(`Format configuration error. "trim" param has invalid value "${config.trim}". Expected boolean, found "${config.trim}".`)
	}

	if (!isBoolean(config.trimLeft)) {
		throw new Error(`Format configuration error. "trimLeft" param has invalid value "${config.trimLeft}". Expected boolean, found "${config.trimLeft}".`)
	}

	if (!isBoolean(config.trimRight)) {
		throw new Error(`Format configuration error. "trimRight" param has invalid value "${config.trimRight}". Expected boolean, found "${config.trimRight}".`)
	}

	if (!isBoolean(config.toLowerCase)) {
		throw new Error(`Format configuration error. "toLowerCase" param has invalid value "${config.toLowerCase}". Expected boolean, found "${config.toLowerCase}".`)
	}

	if (!isBoolean(config.toUpperCase)) {
		throw new Error(`Format configuration error. "toUpperCase" param has invalid value "${config.toUpperCase}". Expected boolean, found "${config.toUpperCase}".`)
	}

	if (config.toLowerCase === true && config.toUpperCase === true) {
		throw new Error('Format configuration error. "toUpperCase" and "toLowerCase" params can\'t be true at the same time.')
	}

	if (config.truncate !== false && !isNaturalNumber(config.truncate)) {
		throw new Error(`Format configuration error. "truncate" param has invalid value "${config.truncate}". Expected false or natural number, found "${config.truncate}".`)
	}

	if (config.capitalize !== false && typeof config.capitalize !== 'undefined' && !inEnum(config.capitalize, ['words', 'sentences', 'first'])) {
		throw new Error(`Format configuration error. "capitalize" param has invalid value "${config.capitalize}". Expected false, "words", "sentences" or "first", found "${config.capitalize}".`)
	}

	if (!isBoolean(config.notUndef)) {
		throw new Error(`Format configuration error. "notUndef" param has invalid value "${config.notUndef}". Expected boolean, found "${config.notUndef}".`)
	}

	if (!isBoolean(config.notEmpty)) {
		throw new Error(`Format configuration error. "notEmpty" param has invalid value "${config.notEmpty}". Expected boolean, found "${config.notEmpty}".`)
	}

	if (config.enum !== false) {
		if (!Array.isArray(config.enum)) {
			throw new Error(`Format configuration error. "enum" param has invalid value "${config.enum}". Expected false or array, found "${config.enum}".`)
		}

		const invalidEnum = config.enum.find(val => isString(val) === false)

		if (typeof invalidEnum !== 'undefined') {
			throw new Error(`Format configuration error. "enum" param has invalid value "[${config.enum}]". Expected array with strings, found "[${config.enum}]".`)
		}
	}

	if (config.min !== false && !isNaturalNumber(config.min)) {
		throw new Error(`Format configuration error. "min" param has invalid value "${config.min}". Expected false or natural number, found "${config.min}".`)
	}

	if (config.max !== false && !isNaturalNumber(config.max)) {
		throw new Error(`Format configuration error. "max" param has invalid value "${config.max}". Expected false or natural number, found "${config.max}".`)
	}

	if (!isBoolean(config.email)) {
		throw new Error(`Format configuration error. "email" param has invalid value "${config.email}". Expected boolean, found "${config.email}".`)
	}

	if (config.test !== false && !Boolean(config.test instanceof RegExp)) {
		throw new Error(`Format configuration error. "test" param has invalid value "${config.test}". Expected false or RegExp, found "${config.test}".`)
	}

	return (value: any, privateOptions: IFormatInputOptions) =>
		stringTest(value, config, privateOptions)
}
