const { exec } = require('child_process')
const fs = require('fs')
const path = require('path');

const rootDir = process.cwd();
const directory = path.join(rootDir, 'data', 'diagrams');
const flowsDirectory = path.join(rootDir, 'data', 'flows');
fs.mkdirSync(directory, { recursive: true });

const Visualiser = class {
	
	clearFolder = () => {
		// Function to clear all files in a folder
		fs.readdir(directory, (err, files) => {
			if (err) throw err
			console.log(`Deleting files from ${directory}`)
			for (const file of files) {
				const filePath = path.join(directory, file)
				fs.unlink(filePath, (err) => {
					if (err) throw err
					// console.log(`DELETING ${file}`)
				})
			}
		})
	}

	saveFile = (gvString, fileName) => {

		// Ensure the directory exists or create it
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory)
		}

		// Write the JSON data to the file
		const filePath = path.join(directory, fileName)

		fs.writeFile(filePath, gvString, (err) => {
			if (err) {
				console.error('Error writing to file:', err)
			}
		})
	}

	saveGraphviz = (fileName, exportType = 'png') => {

		// Define paths to the input .dot file and output image file
		const inputFile = path.resolve(directory, fileName)
		// const exportType = 'png'
		const outputFile = path.resolve(directory, `output.${exportType}`)

		// Run the dot command
		exec(`dot -T${exportType} "${inputFile}" -o "${outputFile}"`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing dot: ${error.message}`)
				return
			}
			if (stderr) {
				console.error(`Graphviz error: ${stderr}`)
				return
			}
			console.log('Graph generated successfully:', stdout)
		})
	}

	loadAndCombineJsonFiles = () => {
		const combinedData = []
		const combinedLinks = []
		const combinedFileLinks = []
		const combinedParentLinks = []

		// List all JSON files in the directory
		const files = fs.readdirSync(flowsDirectory).filter(file => file.endsWith('.json'))

		// Load and combine JSON data
		files.forEach(file => {
			const filePath = path.join(flowsDirectory, file)
			const rawData = fs.readFileSync(filePath)
			const jsonData = JSON.parse(rawData)
			combinedData.push(...jsonData.history)
			const uniqueLinks = [...new Set(jsonData.history)]
			combinedLinks.push(uniqueLinks)

			if (jsonData.parentFlow) {
				const name = jsonData.parentFlow.replace(/\s+/g, '_')
				const flowName = jsonData.flow.replace(/\s+/g, '_')				
				const parentFlowJoin = `node_${name} -> node_${flowName} [color=black, arrowhead=normal]`
				if (combinedFileLinks.indexOf(parentFlowJoin) === -1) {
					combinedFileLinks.push(parentFlowJoin)
				}
			}
			if (jsonData.parentGroup) {
				const name = jsonData.parentGroup.replace(/\s+/g, '_')
				const groupName = jsonData.group.replace(/\s+/g, '_')
				const parentGroupJoin = `node_${name} -> node_${groupName} [color=black, arrowhead=normal]`
				if (combinedFileLinks.indexOf(parentGroupJoin) === -1) {
					combinedFileLinks.push(parentGroupJoin)
				}
			}
			if (jsonData.parentLink) {
				combinedParentLinks.push(jsonData.parentLink)
			}
		})

		const fileJoins = combinedFileLinks.join('\n')

		return [combinedData, combinedLinks, combinedParentLinks, fileJoins]
	}

	convertJsonStructure = (data) => {
		// Map the data to the new structure
		const groups = {}

		data.forEach(item => {
			const groupName = item.group
			const flowName = item.flow
			const sourceName = item.source
			const fileName = item.file
			const functionName = item.function
			const description = item.description || ''
			const shapeName = item.shape
			const typeName = item.type

			// Ensure the group object exists
			if (!groups[groupName]) {
				groups[groupName] = {
					name: groupName,
					flows: {}
				}
			}

			const groupObject = groups[groupName]

			// Ensure the source object exists within the group
			if (!groupObject.flows[flowName]) {
				groupObject.flows[flowName] = {
					name: flowName,
					sources: {}
				}
			}

			const flowObject = groupObject.flows[flowName]

			// Ensure the source object exists within the flow
			if (!flowObject.sources[sourceName]) {
				flowObject.sources[sourceName] = {
					name: sourceName,
					files: {}
				}
			}

			const sourceObject = flowObject.sources[sourceName]

			// Ensure the file object exists within the source
			if (!sourceObject.files[fileName]) {
				sourceObject.files[fileName] = {
					name: fileName,
					functions: []
				}
			}

			const fileObject = sourceObject.files[fileName]

			// Find the function or create a new one if it doesn't exist
			let existingFunction = fileObject.functions.find(f => f.name === functionName)
			if (!existingFunction) {
				existingFunction = {
					name: functionName,
					descriptions: []
				}
				fileObject.functions.push(existingFunction)
			}

			// Only push unique descriptions
			if (!existingFunction.descriptions.find(desc => desc.name === description)) {
				existingFunction.descriptions.push({ name: description, shape: shapeName, type: typeName })
			}
		})

		// Convert group and flow objects into arrays
		return {
			groups: Object.values(groups).map(group => ({
				name: group.name,
				flows: Object.values(group.flows).map(flow => ({
					name: flow.name,
					sources: Object.values(flow.sources).map(source => ({
						name: source.name,
						files: Object.values(source.files)
					}))
				}))
			}))
		}
	}

	getColour = (baseColour, colours, itemName, searchName) => {
		if (colours) {
			if (itemName in colours) {
				if (typeof colours[itemName] === 'object') {
					if (searchName in colours[itemName]) {
						return colours[itemName][searchName]
					}
				} else {
					return colours[itemName]
				}
			}
		}

		return baseColour
	}

	formatFunction = (options) => {
		let descriptionsString = ''
		options.descriptions.forEach((item, d) => {
			// descriptionsString += `${item.name}\n\n`
			const descColour = this.getColour('white', options.colours, 'type', item.type)
			descriptionsString += `function_${options.g}_${options.fl}_${options.s}_${options.c}_${options.f}_${d} [label="${item.name}", shape="${item.shape}", fillcolor="${descColour}"]\n`
		})

		const colour = this.getColour('#F1D3CE', options.colours, 'function', options.name)

		const text = `
		subgraph cluster_${options.name.replace(/\s+/g, '_')} {
			style=filled
			color="${colour}"
			label="${options.name}"

			${descriptionsString}         	 
		}    
		`
		return text
	}

	formatFile = (options) => {
		let functionsString = ''
		options.functions.forEach((item) => {
			functionsString += `${item}\n`
		})

		const colour = this.getColour('#FBF6EA', options.colours, 'file', options.name)
		const name = options.name.replace(/\s+/g, '_')

		const text = `
		subgraph cluster_${name}  {
			style=filled
			color="${colour}" 
			label="${options.name}"
			fontsize=14

			${functionsString}          	 
		}    
		`
		return text
	}

	formatSource = (options) => {
		let fileString = ''
		options.files.forEach((item) => {
			fileString += `${item}\n`
		})

		const colour = this.getColour('#F6EACB', options.colours, 'source', options.name)
		const name = options.name.replace(/\s+/g, '_')

		const text = `
		subgraph cluster_${name}  {
			style=filled
			color="${colour}"
			label="${options.name}"
			fontsize=14

			${fileString}          	 
		}    
		`
		return text
	}

	formatFlow = (options) => {
		let sourceString = ''
		options.sources.forEach((item) => {
			sourceString += `${item}\n`
		})

		const colour = this.getColour('#F6EACB', options.colours, 'flow', options.name)
		const name = options.name.replace(/\s+/g, '_')

		const text = `
		subgraph cluster_${name}  {
			style=filled
			color="${colour}"
			label="${options.name}"
			fontsize=14

			node [style=filled, fillcolor=white, shape=box]
			node_${name}[label="", shape=circle, fillcolor="${colour}", color="${colour}"];

			${sourceString}          	 
		}    
		`
		return text
	}

	formatGroup = (options) => {
		let flowString = ''
		options.flows.forEach((item) => {
			flowString += `${item}\n`
		})

		const colour = this.getColour('#BEA9DF', options.colours, 'group', options.name)
		const name = options.name.replace(/\s+/g, '_')

		const text = `
		subgraph cluster_${name} {
			style=filled
			color="${colour}"
			label=<<B>${options.name}</B>>
			fontsize=20  

			node [style=filled, fillcolor=white, shape=box]
			node_${name}[label="", shape=circle, fillcolor="${colour}", color="${colour}"];

			${flowString}
		}
		`
		return text
	}

	graphVizConvert = (sourceJson, links, parentLinks, fileJoins, nodeColours = {}, rankdir = 'TB') => {
		// loop through json and convert it to gv format
		const groupList = []
		// const startIds = []
		sourceJson.groups.forEach((groupItem, gi) => {
			const flowsList = []
			groupItem.flows.forEach((flowItem, fli) => {
				const sourcesList = []
				flowItem.sources.forEach((sourceItem, si) => {
					const filesList = []
					sourceItem.files.forEach((fileItem, ci) => {
						const functionsList = []
						fileItem.functions.forEach((functionItem, fi) => {
							functionsList.push(this.formatFunction({
								name: functionItem.name,
								descriptions: functionItem.descriptions,
								g: gi,
								fl: fli,
								s: si,
								c: ci,
								f: fi,
								colours: nodeColours
							}))
						})

						filesList.push(this.formatFile({
							name: fileItem.name,
							functions: functionsList,
							colours: nodeColours
						}))
					})

					sourcesList.push(this.formatSource({
						name: sourceItem.name,
						files: filesList,
						colours: nodeColours
					}))
				})

				flowsList.push(this.formatFlow({
					name: flowItem.name,
					sources: sourcesList,
					colours: nodeColours
				}))
				// saved = false
			})
			groupList.push(this.formatGroup({
				name: groupItem.name,
				flows: flowsList,
				colours: nodeColours
			}))
		})

		// const startJoins = startIds.join('\n')

		let gvString = ''
		groupList.forEach((flow) => {
			gvString += `${flow}\n`
		})

		gvString =
		`
		digraph G {
			rankdir=${rankdir}
			// ranksep=1.0
			// nodesep=0.7
			splines=ortho
			edge [penwidth=2]     
		
			${gvString}

			// file joins
			${fileJoins}

			// process joins
			${links}

			// parent links
			${parentLinks}
		}
		`

		return gvString
	}

	searchObject = (obj, searchTerms) => {
		let id = 'function_'

		obj.groups.forEach((groupItem, groupId) => {
			if (groupItem.name === searchTerms.group) {
				id += `${groupId}_`
				groupItem.flows.forEach((flowItem, flowId) => {
					if (flowItem.name === searchTerms.flow) {
						id += `${flowId}_`

						flowItem.sources.forEach((sourceItem, sourceId) => {
							if (sourceItem.name === searchTerms.source) {
								id += `${sourceId}_`

								sourceItem.files.forEach((fileItem, fileId) => {
									if (fileItem.name === searchTerms.file) {
										id += `${fileId}_`

										fileItem.functions.forEach((functionItem, functionId) => {
											if (functionItem.name === searchTerms.function) {
												id += `${functionId}_`
												functionItem.descriptions.forEach((descriptionItem, descriptionId) => {
													if (descriptionItem.name === searchTerms.description) {
														id += `${descriptionId}`
													}
												})
											}
										})
									}
								})
							}
						})
					}
				})
			}
		})

		return id
	}

	getLinks = (loadedJson, formattedJson) => {
		let links = ''
		loadedJson.forEach((file) => {
			const idList = []
			file.forEach((item) => {
				const id = this.searchObject(formattedJson, item)
				const underscores = (id.match(/_/g) || []).length
				if (underscores < 6) {
					console.log('missing links for: ', item)
				}
				idList.push(id)
			})
			let savedLink = ''
			idList.forEach((link) => {
				if (savedLink) {
					const nextLink = `${savedLink} -> ${link} [color=black, arrowhead=normal]\n`
					if (!links.includes(nextLink)) {
						links += `${savedLink} -> ${link} [color=black, arrowhead=normal]\n`
					}
				}
				savedLink = link
			})
		})

		return links
	}

	getParentLinks = (parentLinks, formattedJson) => {
		let links = ''
		const keysToCheck = ['parent']
		parentLinks.forEach((parentLink) => {
			if (keysToCheck.every(key => key in parentLink)) {
				const parentId = this.searchObject(formattedJson, parentLink.parent)
				let underscores = (parentId.match(/_/g) || []).length
				if (underscores < 6) {
					console.log('missing links for parentLink->parent: ', parentLink)
				}
				const childId = this.searchObject(formattedJson, parentLink.child)
				underscores = (childId.match(/_/g) || []).length
				if (underscores < 6) {
					console.log('missing links for parentLink->child: ', parentLink)
				}

				const nextLink = `${parentId} -> ${childId} [color=black, arrowhead=normal]\n`
				if (!links.includes(nextLink)) {
					links += `${parentId} -> ${childId} [color=black, arrowhead=normal]\n`
				}
			}
		})

		return links
	}

	run = async (filename, fileFormat, colours, rankdir = 'TB') => {
		const [combinedData, combinedLinks, combinedParentLinks, fileJoins] = this.loadAndCombineJsonFiles()
		const formattedJson = this.convertJsonStructure(combinedData)
		this.saveFile(JSON.stringify(formattedJson, null, 2), 'formatted_json.json')
		const links = this.getLinks(combinedLinks, formattedJson)
		const parentLinks = this.getParentLinks(combinedParentLinks, formattedJson)

		const gvString = this.graphVizConvert(formattedJson, links, parentLinks, fileJoins, colours, rankdir)
		this.saveFile(gvString, `${filename}.dot`)
		this.saveGraphviz(`${filename}.dot`, fileFormat)
	}
}

module.exports = new Visualiser()