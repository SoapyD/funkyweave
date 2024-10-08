const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const rootDir = process.cwd();
const directory = path.join(rootDir, 'data', 'flows');
fs.mkdirSync(directory, { recursive: true });

const Logger = class {
	constructor (options) {
		this.logHandler = options.logHandler
		this.logData = options.logData
	}

	getHashedFilename = (data, extension = 'txt') => {
		// Create a SHA-256 hash
		const hash = crypto.createHash('sha256').update(data).digest('hex')
		// Slice to the first 32 characters
		return `${hash.slice(0, 32)}.${extension}`
	}

	createOrphan = (description, options, shapeName, processType) => {
		const log = this.logHandler.startChild(this)
		log[processType](description, false, { stackDepth: 5 })

		log.save()
		return log
	}

	save = () => {
		const data = this.logData
		// Convert JSON object to a string

		if (!data.flow || !data.description) {
			return
		}
		const jsonData = JSON.stringify(data, null, 2)

		const fileName = this.getHashedFilename(jsonData, 'json')

		// Ensure the directory exists or create it
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory)
		}

		// Write the JSON data to the file
		const filePath = path.join(directory, fileName)

		fs.writeFile(filePath, jsonData, 'utf8', (err) => {
			if (err) {
				console.error('Error writing file', err)
			}
		})
	}

	process = (description, orphan = false, options = {}) => {
		if (orphan) {
			return this.createOrphan(description, options, 'box', 'process')
		} else {
			this.logHandler.log(this.logData, description, options, 'box', 'process')
		}
	}

	input = (description, orphan = false, options = {}) => {
		if (orphan) {
			return this.createOrphan(description, options, 'parallelogram', 'input')
		} else {
			this.logHandler.log(this.logData, description, options, 'parallelogram', 'input')
		}
	}

	output = (description, orphan = false, options = {}) => {
		if (orphan) {
			return this.createOrphan(description, options, 'parallelogram', 'output')
		} else {
			this.logHandler.log(this.logData, description, options, 'parallelogram', 'output')
		}
	}

	database = (description, orphan = false, options = {}) => {
		if (orphan) {
			return this.createOrphan(description, options, 'cylinder', 'database')
		} else {
			this.logHandler.log(this.logData, description, options, 'cylinder', 'database')
		}
	}

	decision = (description, orphan = false, options = {}) => {
		if (orphan) {
			return this.createOrphan(description, options, 'diamond', 'decision')
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

	remoteLog = (socket, options) => {
		this.save()
	}
}

const FunctionLogHandler = class {
	constructor (options) {
		this.maxLineWidth = 10
	}

	clearFolder = () => {
		// Function to clear all files in a folder
		fs.readdir(directory, (err, files) => {
			if (err) throw err
			console.log(`Deleting files from ${directory}`)
			for (const file of files) {
				const filePath = path.join(directory, file)
				fs.unlink(filePath, (err) => {
					if (err) throw err
				})
			}
		})
	}

	createChild = (logData, options = {}) => {
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
			class: historyItem.class,
			function: historyItem.function,
			description: historyItem.description
		}
	}

	insertLineBreaks = (text) => {
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

	log = (logData, description, options, shapeName, processType) => {
		try {
			// if (options.orphan) {
			// 	logData = this.createChild({ ...logData })
			// }

			let stackDepth = 3
			if (options.stackDepth) {
				stackDepth = options.stackDepth
			}

			const error = new Error()
			const stack = error.stack.split('\n')
			const callerStackLine = stack[stackDepth].trim()
			const regex = /^(.*)\s*\((.*)\)$/
			const match = callerStackLine.match(regex)
			let functionName = match[1].split(' ')[1]
			functionName = functionName.split('.')[functionName.split('.').length - 1]
			const className = match[2].split('\\').pop().split(':')[0].split('.')[0]
			if (functionName === '<anonymous>') {
				functionName = 'no_named_function'
			}

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
					data.functionOverride = `${functionName}_Loop`
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
					class: className,
					function: functionName,
					shape: shapeName,
					type: processType,
					functionOverride: data.functionOverride,
					description: this.insertLineBreaks(description)
				}

				data.history.push(newEntry)

				if (options.parentLink) {
					const parentLog = options.parentLink.parentLog.logData
					if (parentLog.group && parentLog.flow && parentLog.source
					) {
						data.parentLink = {
							parent: this.getLink(options.parentLink),
							child: this.getLink({ parentLog: { logData: data } })
						}
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
			if (options.parentLog) {
				logOptions.parentLink = {
					parentLog: options.parentLog
				}
				if (options.offset) {
					logOptions.parentLink.offset = options.offset
				}
			} else {
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

	startChild = (log, description = '', source = '') => {
		const options = {}
		if (source) {
			// options.source = source
			log.logData.source = source
		}
		let logData = this.createChild(log.logData, options)
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
		let logData = this.createChild(log.logData)
		logData = this.log(logData, description, options, 'trapezium', 'startLoop')
		return new Logger({ logData, logHandler: this })
	}
}

module.exports = new FunctionLogHandler()