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

To initialise `FunkyWeave logging`, there are 4 required field and a set of optional variables that can be passed into the start function, these are:

* **Description**: A text description printed in the `starting flow`. For example `start function`
* **Group**: Used to group one or more `flows` together. For example `page initialisation`, which would contain all flows run during the initialisation of a web-page. 
* **Flow**: Used to group one or more `sources` together. For example, `query user data`, `query shopping items` and `render page` could all be seperate flows within the same `page initialisation` group.
* **Source**: Used to group one or more `descriptions` together. For example, if you wished to seperate out `database queries`, `server functions` and `client-side functions`, each of these can exist as seperate sources within each flow.
* **Options**: A object that contains additional configurations information which will be detailed later.

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

```
log.database('log a database step')
```
**Expected output:**

<img src="./images/database.png" alt="database"/>

### Decision

```
log.decision('log a decision step')
```
**Expected output:**

<img src="./images/decision.png" alt="decision"/>

### Input/Output

```
log.input('log a input step')
```
**Expected output:**

<img src="./images/input.png" alt="input"/>

```
log.output('log a output step')
```
**Expected output:**

<img src="./images/output.png" alt="output"/>

### Process

```
log.process('log a process step')
```
**Expected output:**

<img src="./images/process.png" alt="process"/>

### End

To end a flow and save it, run the following:

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
	testLog2(log)
	log.process('log a process step')
	testLog2a(log)
	log.end('end function')
}

testLog()
```

Which should produce a flow that looks like this:

<img src="./images/simple_example.png" alt="simple_example"/>

## Advanced Logging

### Loops

### ParentLog

### Start Child

### Orphans