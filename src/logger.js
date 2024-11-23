let fs, path, crypto, directory;


if (typeof window === 'undefined') {
	// SERVER
	fs = require('fs')
	path = require('path')
	crypto = require('crypto')

	const rootDir = process.cwd();
	directory = path.join(rootDir, 'data', 'flows')
	fs.mkdirSync(directory, { recursive: true })
}

const Logger = class {
	constructor (options) {
		this.logHandler = options.logHandler
		this.logData = options.logData
	}

	getHashedFilename = async(data, extension = 'txt') => {
		if (!this.logHandler.logging_enabled) {
			return ''
		}
		if (typeof window === 'undefined') {
			// SERVER
			// Create a SHA-256 hash
			const hash = await crypto.createHash('sha256').update(data).digest('hex')
			// Slice to the first 32 characters
			return `${hash.slice(0, 32)}.${extension}`
		} else {
			// CLIENT
			// Encode data into a Uint8Array
			const encoder = new TextEncoder()
			const dataBuffer = encoder.encode(data)

			// Generate a SHA-256 hash
			const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer)

			// Convert the hash buffer to a hex string
			const hashArray = Array.from(new Uint8Array(hashBuffer))
			const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')

			// Slice to the first 32 characters
			return `${hashHex.slice(0, 32)}.${extension}`
		}
	}

	createLeaf = (description, options, shapeName, processType) => {
		const log = this.logHandler.startBranch(this)
		const stackDepth = this.logHandler.stackDepth + 2
		log[processType](description, false, { stackDepth })

		log.save()
		return log
	}

	process = (description, leaf = false, options = {}) => {
		if (leaf) {
			return this.createLeaf(description, options, 'box', 'process')
		} else {
			this.logHandler.log(this.logData, description, options, 'box', 'process')
		}
	}

	input = (description, leaf = false, options = {}) => {
		if (leaf) {
			return this.createLeaf(description, options, 'parallelogram', 'input')
		} else {
			this.logHandler.log(this.logData, description, options, 'parallelogram', 'input')
		}
	}

	output = (description, leaf = false, options = {}) => {
		if (leaf) {
			return this.createLeaf(description, options, 'parallelogram', 'output')
		} else {
			this.logHandler.log(this.logData, description, options, 'parallelogram', 'output')
		}
	}

	database = (description, leaf = false, options = {}) => {
		if (leaf) {
			return this.createLeaf(description, options, 'cylinder', 'database')
		} else {
			this.logHandler.log(this.logData, description, options, 'cylinder', 'database')
		}
	}

	decision = (description, leaf = false, options = {}) => {
		if (leaf) {
			return this.createLeaf(description, options, 'diamond', 'decision')
		} else {
			this.logHandler.log(this.logData, description, options, 'diamond', 'decision')
		}
	}

	end = (description, options = {}) => {
		this.logHandler.log(this.logData, description, options, 'oval', 'end')

		if (this.logData.group && this.logData.flow && this.logData.description) {
			this.save()
		}
	}

	endLoop = (description, options = {}) => {
		this.logHandler.log(this.logData, description, options, 'invtrapezium', 'endLoop')

		if (this.logData.group && this.logData.flow && this.logData.description) {
			this.save()
		}
	}

	save = async() => {
		if (!this.logHandler.logging_enabled) {
			return
		}			
		if (typeof window === 'undefined') {
			// SERVER
			const data = this.logData
			// Convert JSON object to a string
	
			if (!data.flow || !data.description) {
				return
			}
			const jsonData = JSON.stringify(data, null, 2)
	
			const fileName = await this.getHashedFilename(jsonData, 'json')
	
			// Ensure the directory exists or create it
			if (!fs.existsSync(directory)) {
				fs.mkdirSync(directory)
			}
	
			// Write the JSON data to the file
			const filePath = path.join(directory, fileName)
	
			if (!fs.existsSync(filePath)) {
				fs.writeFile(filePath, jsonData, 'utf8', (err) => {
					if (err) {
						console.error('Error writing file', err)
					}
				})
			}
		} else {
			// CLIENT
			const fileName = await this.getHashedFilename(JSON.stringify(this.logData), 'json')

			if (!this.logData.group || !this.logData.flow || !this.logData.description) {
				return
			}

			// check if hashed log has already been sent, if don't don't send it.
			if (this.logHandler.hashes.includes(fileName)) {
				return
			}
			this.logHandler.hashes.push(fileName)

			if(this.logHandler.callBack) {
				this.logHandler.callBack(this)
			}
		}
	}
}

const FunctionLogHandler = class {
	constructor () {
		this.maxLineWidth = 10
		this.hashes = []
		this.logging_enabled = true
		if (typeof window === 'undefined') {
			this.stackDepth = 4
			this.logging_enabled = (process.env.FUNKY_LOGGING_ENABLED || 'true') === 'true';
		} else {
			this.stackDepth = 3
		}
	}

	setCallBack = (callBack) => {
		this.callBack = callBack
	}

	setLogging = (is_enabled) => {
		this.logging_enabled = is_enabled
	}

	clearFolder = async () => {
		try {
			const files = await fs.promises.readdir(directory);
			console.log(`Deleting files from ${directory}`);
			
			for (const file of files) {
				const filePath = path.join(directory, file);
				await fs.promises.unlink(filePath);
			}
		} catch (err) {
			throw err;
		}
	}

	createBranch = (logData, options = {}) => {
		if (!logData.history) {
			return
		}
		if (logData.history.length === 0) {
			return
		}
		const strippedHistory = logData.history.slice(-1)
		const newLogData = {
			group: logData.group,
			flow: logData.flow,
			source: logData.source,
			description: strippedHistory[0].description,
			functionOverride: '',
			history: strippedHistory
		}

		if (options.source) {
			newLogData.source = options.source
		}

		return newLogData
	}

	getLink = (options) => {
		if ('directLink' in options) {
			options.directLink.description = this.insertLineBreaks(options.directLink.description)
			return options.directLink
		}

		const logData = options.parentLog.logData
		let offset = 0
		if ('offset' in options) {
			offset = options.offset
		}
		const historyItem = logData.history[(logData.history.length - 1) - offset]
		return {
			group: logData.group,
			flow: logData.flow,
			source: historyItem.source,
			file: historyItem.file,
			function: historyItem.function,
			description: historyItem.description
		}
	}

	insertLineBreaks = (text) => {
		if (!this.logging_enabled) {
			return text
		}
		let result = ''
		let currentLineLength = 0

		for (let i = 0; i < text.length; i++) {
			result += text[i]
			currentLineLength++

			// If the maxLineLength is reached, add a line break
			if (currentLineLength >= this.maxLineWidth && text[i] === ' ') {
				result += '\\n'
				currentLineLength = 0 // Reset line length counter
			}
		}

		return result
	}

	getNames = (options) => {

		try{

			if (!this.logging_enabled) {
				return '', ''
			}	
	
			let stackDepth = this.stackDepth
				
			if (options.stackDepth) {
				stackDepth = options.stackDepth
			}
	
			let functionName = 'no functionName'
			let fileName = 'no fileName'
			if (typeof window === 'undefined') {
				// SERVER
				const error = new Error()
				const stack = error.stack.split('\n')
				const callerStackLine = stack[stackDepth].trim()
				const regex = /^(.*)\s*\((.*)\)$/
				const match = callerStackLine.match(regex)
				if(!match){
					return { functionName, fileName }
				}
				functionName = match[1].split(' ')[1]
				functionName = functionName.split('.')[functionName.split('.').length - 1]
				fileName = match[2].split('\\').pop().split(':')[0].split('.')[0]
			} else {
				// CLIENT
				const error = new Error()
				const stack = error.stack.split('\n')
				const callerStackLine = stack[stackDepth].trim()
				fileName = callerStackLine.match(/(\w+\.\w+)/)[0].split('.')[0]
				functionName = callerStackLine.split('@')[0]
				functionName = functionName.split('.')[functionName.split('.').length - 1].replace(/[^a-zA-Z0-9\s]/g, '')
			}
	
			if (functionName === '<anonymous>') {
				functionName = 'no_named_function'
			}
	
			return { functionName, fileName }
		} catch (err) {
			console.log("can't get function or filename")
			return { functionName, fileName }
		}
	}

	log = (logData, description, options, shapeName, processType) => {
		try {

			let data = {
				group: '',
				parentGroup: '',
				flow: '',
				parentFlow: '',
				parentLink: {},
				source: options.source,
				description: '',
				functionOverride: '',
				history: []
			}

			let { functionName, fileName } = this.getNames(options)

			if (Object.keys(logData).length > 0) {
				data = logData
			}

			data.description = description

			if (options.group) {
				data.group = options.group
			}
			if (options.parentGroup) {
				data.parentGroup = options.parentGroup
			}

			if (options.flow) {
				data.flow = options.flow
			}
			if (options.parentFlow) {
				data.parentFlow = options.parentFlow
			}

			if (options.isLoop) {
				if (options.loopName) {
					data.functionOverride = options.loopName
				} else {
					if (data.history.length > 0) {
						const lastItem = data.history[data.history.length - 1].description
						data.functionOverride = `${lastItem} Loop`
					} else {
						data.functionOverride = `${functionName} Loop`
					}
				}
			}
			if (data.functionOverride) {
				functionName = data.functionOverride
			}

			if (description) {
				const newEntry = {
					group: data.group,
					flow: data.flow,
					source: data.source,
					file: fileName,
					function: functionName,
					shape: shapeName,
					type: processType,
					functionOverride: data.functionOverride,
					description: this.insertLineBreaks(description)
				}

				data.history.push(newEntry)

				if (options.parentLink) {
					// const parentLog = options.parentLink.parentLog.logData
					// if (parentLog.group && parentLog.flow && parentLog.source
					// ) {	
					// }
					data.parentLink = {
						parent: this.getLink(options.parentLink),
						child: this.getLink({ parentLog: { logData: data } })
					}
				}
			}

			return data
		} catch (error) {
			console.log('THE FUNCTION LOGGING PROCESS IS ERRORING')
			console.log(error)
			console.log(options)
		}
	}

	start = (description, group, flow, source, options) => {
		const logOptions = {
			group,
			flow,
			source
		}
		if (options) {
			let linkSet = false
			if (options.parentLog) {
				logOptions.parentLink = {
					parentLog: options.parentLog
				}
				if (options.offset) {
					logOptions.parentLink.offset = options.offset
				}
			}
			if (linkSet === false) {
				if (options.directLink) {
					logOptions.parentLink = {
						directLink: options.directLink
					}
					linkSet = true
				}
			}			
			if (linkSet === false) {
				if (options.parentFlow) {
					logOptions.parentFlow = options.parentFlow
				}
				if (options.parentGroup) {
					logOptions.parentGroup = options.parentGroup
				}
			}
		}
		const logData = this.log({}, description, logOptions, 'oval', 'start')
		return new Logger({ logData, logHandler: this })
	}

	restart = (log) => {
		const logData = log.logData
		return new Logger({ logData, logHandler: this })
	}

	startBranch = (log, description = '', source = '') => {
		const options = {}
		let logData = this.createBranch(log.logData, options)
		if (source) {
			logData.source = source
		}		
		if (description) {
			logData = this.log(logData, description, {}, 'oval', 'start')
		}
		return new Logger({ logData, logHandler: this })
	}

	startLoop = (log, description, loopName = '') => {
		const options = {
			loopName,
			isLoop: true
		}
		let logData = this.createBranch(log.logData)
		logData = this.log(logData, description, options, 'trapezium', 'startLoop')
		return new Logger({ logData, logHandler: this })
	}
}

module.exports = new FunctionLogHandler()
// export const logger = new FunctionLogHandler()
