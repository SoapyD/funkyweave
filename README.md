<div align="center">
<img src="./images/funkyweave.png" alt="Logo" style="width:200px;"/>
</div>

# FunkyWeave

Have you ever wanted to `visualise the interactions` between each function in your program? **FunkyWeave** logging allows you to do it!

**FunkyWeave** is a light-weight `logger` that can be used to `visualise each step in logic`, outputting `flow diagrams` in `dot format` then drawn using `Graphviz` into multiple formats.

## Installation

```
npm i funkyweave
```

## Usage

**FunkyWeave** comes in two parts, `logging` and `visualing`, both of which can be added to code by doing the following:

```
const { logger, visualiser } = require('funkyweave')
```

## Basic Logging

Logging is broken down into a number of simple steps

* `Start a log` or create a `child of an existing log` for a function
* Add process steps, detailing the `logic of that function`, using common `flow diagram symbols`, for example:
	* Start
	* Database
	* Decision
	* Input/Output
	* Process
	* End

### Start Log

To initialise **FunkyWeave** `logging`, there are 4 required field and a set of optional variables that can be passed into the start function.

#### Function Definition

Source: **funkyweave.logging**

Name: **startLog**

Parameters:
* **Description (string)**: A text description printed in the `node`. For example `start function`.
* **Group (string)**: Used to group one or more `flows` together. For example `page initialisation`, which would contain all flows run during the initialisation of a web-page. 
* **Flow (string)**: Used to group one or more `sources` together. For example, `query user data`, `query shopping items` and `render page` could all be seperate flows within the same `page initialisation` group.
* **Source (string)**: Used to group one or more `descriptions` together. For example, if you wished to seperate out `database queries`, `server functions` and `client-side functions`, each of these can exist as seperate sources within each flow.
* **Options (object) Optional**: A object that contains additional configurations information.
	* **parentLog (Log)**: A log instance that can be used to link one flow to another flow.
	* **offset (int)**: A value used to offset where on the parentLog the flow join is made. This value defaults to 0 if not provided, useful when defining `switch` logs.
	* **directLink (obj)**: A object that can be used to join one object to another without having to pass in a parentLog. This can be used if it impractical to pass logs between functions. 
	* **parentGroup (string)**: If you'd prefer to join one group to another to demonstrate the functional flow, use this parameter to identify that parentGroup.
	* **parentFlow (string)**: If you'd prefer to join one flow to another to demonstrate the functional flow, use this parameter to identify that parentGroup

```
const log = startLog(
	Description,
	Group,
	Flow,
	Source,
	{
		parentFlow,
		offset,
		directLink,
		parentGroup,
		parentFlow
	}
)
```

#### Example

The below script is an example of how a user could initialise a `log instance` for use in a function:

```
const log = logger.start('start function', 'Room_Setup', 'Rooms_Setup', 'server')
```

When the `log` is `initialised`, it will automatically create a `start` node:

**Expected output:**

<img src="./images/start.png" alt="start"/>

Log instances should be created in each function you wish to visualise later.

## Nodes

Once a `log` is created the following `node styles` are available.

Every time a node is created, **FunkyWeave** will also extract the `file name` and `function name` the log was used in, which you will see detailed within the `complete flow examples`.

### Database

Should be used when directly interacting with a database or other data source.

#### Function Definition

Source: **funkyweave.log**

Name: **database**

Parameters:
* **Description (string)**: A text description printed in the `node`. For example "run step".
* **Orphan (boolean)**: A bool controlling where the node is treated as a [Orphan](#orphan) or not.

```
log.database(
	Description,
	Orphan
)
```
#### Example

Here's an example:

```
log.database('log a database step')
```
**Expected output:**

<img src="./images/database.png" alt="database"/>

### Decision

A node that can be used when detailing any if statements.

#### Function Definition

Source: **funkyweave.log**

Name: **decision**

Parameters:
* **Description (string)**: A text description printed in the `node`. For example "run step".
* **Orphan (boolean)**: A bool controlling where the node is treated as a [Orphan](#orphan) or not.

```
log.decision(
	Description,
	Orphan
)
```
#### Example

Here's an example:

```
log.decision('log a decision step')
```
**Expected output:**

<img src="./images/decision.png" alt="decision"/>

### Input

A node to show when data is taken into a flow.

#### Function Definition

Source: **funkyweave.log**

Name: **input**

Parameters:
* **Description (string)**: A text description printed in the `node`. For example "run step".
* **Orphan (boolean)**: A bool controlling where the node is treated as a [Orphan](#orphan) or not.

```
log.input(
	Description,
	Orphan
)
```
#### Example

Here's an example:

```
log.input('log a input step')
```
**Expected output:**

<img src="./images/input.png" alt="input"/>

### Output

A node to show when data is output from a flow.

#### Function Definition

Source: **funkyweave.log**

Name: **output**

Parameters:
* **Description (string)**: A text description printed in the `node`. For example "run step".
* **Orphan (boolean)**: A bool controlling where the node is treated as a [Orphan](#orphan) or not.

```
log.output(
	Description,
	Orphan
)
```
#### Example

Here's an example:

```
log.output('log a output step')
```
**Expected output:**

<img src="./images/output.png" alt="output"/>

### Process

A node that covers basic flow steps that aren't defined using any other type of node.

#### Function Definition

Source: **funkyweave.log**

Name: **process**

Parameters:
* **Description (string)**: A text description printed in the `node`. For example "run step".
* **Orphan (boolean)**: A bool controlling where the node is treated as a [Orphan](#orphan) or not.

```
log.process(
	Description,
	Orphan
)
```
#### Example
Here's an example:

```
log.process('log a process step')
```
**Expected output:**

<img src="./images/process.png" alt="process"/>

### End

To end a flow and save it, create an `end` node. This will save the node to a `./data/flows` folder in the `root of your project`. To avoid duplicate files, `hashing` is used to generate filenames based on their content:

#### Function Definition

Source: **funkyweave.log**

Name: **end**

Parameters:
* **Description (string)**: A text description printed in the `node`. For example "run step".

```
log.end(
	Description,
	Orphan
)
```
#### Example
Here's an example:

```
log.end('log the end step')
```
**Expected output:**

<img src="./images/end.png" alt="end"/>

## Example Flow

Here's a simple example of a single flow script:

```
# Saved within an index.js file
const { logger, visualiser } = require('funkyweave')

const testLog = () => {
	const log = logger.start('start function', 'Room Setup Test Group', 'Rooms Setup', 'server')
	log.database('log a database step')
	log.decision('log a decision step')
	log.input('log a input step')
	log.output('log a output step')
	log.process('log a process step')
	log.end('end function')
}

testLog()
```

Which should produce a flow that looks like this:

<img src="./images/simple_example.png" alt="simple_example"/>

## Advanced Logging

Logging each function is great but what you really want to do is be able to link functions togther. For this we can use one of the following.

### Start Child

If the function you wish to detail is within the same Group, Flow, you pass the parentLog into the function and create a new logging instance from it using **startChild**.

You need to provide a `parentLog`, `description` and optionally, a new `source` for the log. Here's an example:

```
# Saved within an index.js file
const { logger, visualiser } = require('funkyweave')

const testLog = () => {
	const log = logger.start('start function', 'Room Setup Test Group', 'Rooms Setup', 'server')
	log.database('log a database step')
	testLog2(log)
	log.process('log a process step')
	log.end('end function')
}

const testLog2 = (parentLog) => {
	const log = logger.startChild(parentLog, 'start function', 'client')
	log.process('logData2 process')
	log.end('end function')
}

testLog()
```

Which should produce a flow that looks like this:

<img src="./images/example_2.png" alt="example_2"/>

### ParentLog

Imagine this scenario, on the `client` side, a user presses a `start` button, which triggers a message to the `server` which in turn, queries a set of data that's return to the user populates a form for the `client`.

If we define `client` and `server` as two sources, the interaction above is actually detailing two seperate flows:
* A message sent from the `client` to the `server`.
* Data sent from the `server` to the `client`.

To link two flows together, we need to pass the `parentLog within the options object` when we start a new log.

#### Function Definition

Source: **funkyweave.logging**

Name: **startLog**

Parameters: see [startLog](#start-log) options

#### Example

Here's an example:

```
const { logger, visualiser } = require('funkyweave')

const testLog = () => {
	const log = logger.start('start function', 'Room Setup Test Group', 'Rooms Setup', 'server')
	log.process('log a process step')
	testLog3(log)
	log.end('end function')
}

const testLog3 = (parentLog) => {
	const log = logger.start('start function', 'Table Setup Functions', 'Table_Setup', 'server', { parentLog })
	log.process('logData3 process')
	log.output('output')
	log.end('end function')
}

testLog()
```
**Expected output:**

<img src="./images/parentLog.png" alt="parentLog"/>

### Offset

Sometimes you may wish to  offset a `parentLog` join by any number of nodes. For example, in `switch statements`, if there's a lot of code, you may wish to split each section of code into a new flow. This can be especially useful if each switch step belongs to a different `Group`, `Flow` or `Source`.

Source: **funkyweave.logging**

Name: **startLog**

Parameters: see [startLog](#start-log) options

#### Example

Here's an example:

```
const { logger, visualiser } = require('funkyweave')

const testLog8 = () => {
	const log = logger.start('start function', 'Room Setup Test Group', 'Rooms Setup', 'server')
	log.process('run the switch statement 0 position')
	log.process('run the switch statement 1 position')
	log.process('run the switch statement 2 position')

	let log2 = {}
	for (let i = 0; i < 3; i++) {
		switch(i) {
			case 0:
				log2 = logger.start(`start switch pos ${i}`, 'Room Setup Test Group', `Rooms Setup step ${i}`, 'server', {parentLog: log} )
				log2.process("run process")
				log2.end("end function")
				break;
			case 1:
				log2 = logger.start(`start switch pos ${i}`, 'Room Deployment Group', `Rooms Setup step ${i}`, 'server', {parentLog: log, offset: 1} )
				log2.process("run process")
				log2.end("end function")				
				break;
			case 2:
				log2 = logger.start(`start switch pos ${i}`, 'Room Deployment Group', `Rooms Setup step ${i}`, 'server', {parentLog: log, offset: 2} )
				log2.process("run process")
				log2.end("end function")				
				break;									
		}
	}


	log.end('end function')
}

testLog8()
```
**Expected output:**

<img src="./images/offset.png" alt="offSet"/>

### Directlink

As mentioned above, there may be instances where you won't be able to pass a parentLog into a child function in order to link two functions together. In these cases, you can provide a `directLink` object as an option instead.

You need to provide the `Group`, `Flow`, `Source`, `File`, `Function`, `Description` to make the link.

Source: **funkyweave.logging**

Name: **startLog**

Parameters: see [startLog](#start-log) options

#### Example

Here's an example:

```

```
**Expected output:**

<img src="./images/.png" alt="offSet"/>

### ParentGroup & ParentFlow

If you don't need to join two nodes to one another but instead which to demonstrate the flow between `groups` or `flows`, you can pass either `parentGroup` or `parentFlow` as an optional parameter.

Source: **funkyweave.logging**

Name: **startLog**

Parameters: see [startLog](#start-log) options

#### Example

Here's an example:

```
const { logger, visualiser } = require('funkyweave')

const testLog9 = () => {
	const log = logger.start('start function', 'Room Setup Test Group', 'Rooms Setup', 'server')
	log.process('log a process step')
	log.end('end function')
}

const testLog10 = () => {
	const log = logger.start('start function', 'Room Setup Test Group', 'Room Create', 'server', { parentFlow: 'Rooms Setup' })
	log.process('logData3 process')
	log.output('output')
	log.end('end function')
}

const testLog11 = () => {
	const log = logger.start('start function', 'Table Setup Functions', 'Table_Setup', 'client', { parentGroup: 'Room Setup Test Group' })
	log.process('logData3 process')
	log.output('output')
	log.end('end function')
}

testLog9()
testLog10()
testLog11()
```
**Expected output:**

<img src="./images/parentgroup.png" alt="offSet"/>

### Loops

#### startLoop

#### Function Definition

Source: **funkyweave.logging**

Name: **startLog**

Parameters:

#### endLoop

### Orphan

#### Function Definition

Source: **funkyweave.logging**

Name: **startLog**

Parameters:

## Visualise

To render the files within the `./data/flow` folder, you need to use **FunkyWeave's** `visualiser` class.

#### Function Definition

Source: **funkyweave.visualiser**

Name: **run**

Parameters:
* **fileName (str):** The output file name.
* **fileFormat (str):** The output file format which can be any dot rendering [file formats supported by graphViz](https://graphviz.org/docs/outputs/).
* **colours (object):** An object that allows you to set the colour value of all `Groups`, `Flows`, `Sources`, `Classes`, `Functions` or `Flow Nodes` or colour specific sub-types within each of those groups.
	* **group (str | object) Optional:** Used colour names, hex values or provide an object with specific group names as keys, each with their own colour value.
	* **flow (str | object) Optional:** Used colour names, hex values or provide an object with specific flow names as keys, each with their own colour value.
	* **source (str | object) Optional:** Used colour names, hex values or provide an object with specific source names as keys, each with their own colour value.
	* **file (str | object) Optional:** Used colour names, hex values or provide an object with specific file names as keys, each with their own colour value.
	* **function (str | object) Optional:** Used colour names, hex values or provide an object with specific function names as keys, each with their own colour value.
	* **type (str | object) Optional:** Used colour names, hex values or provide an object with specific node type names as keys, each with their own colour value.			
* **rankdir (str) Optional:** Describes which direction you wisk to rank the nodes. This value defaults to `TB` (top to bottom). Any `rankdir` value [used by graphViz can be used here](https://graphviz.org/docs/attrs/rankdir/).

```
const log = visualiser.run(
	fileName,
	fileFormat,
	colours: {
		group,
		flow,
		source,
		class,
		function,
		type
	},
	rankdir
)
```

#### Example

Here's a complete example of how to generate a flow then visualise it:

```

```