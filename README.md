<div align="center">
<img src="./images/funkyweave_logo.png" alt="Logo"/>
</div>

# FunkyWeave

Have you ever wanted to `visualise the interactions` between each function in your program? **FunkyWeave** logging allows you to do it!

**FunkyWeave** is a light-weight `logger` that can be used to `visualise each step in logic`, outputting `flow diagrams` in `dot format` then drawn using `Graphviz` into multiple formats.

Here's an example of te flows that can be generated by the package:

<img src="./images/cover_flow3.png" alt="cover_flow"/>

## Installation

```
npm i funkyweave
```

## Usage

**FunkyWeave** comes in two parts, `logging` and `visualing`, both of which can be added to code by doing the following:

```
const { logger, visualiser } = require('funkyweave')
```

## Updates

* **v1.0.3** - updated cluster naming to automaticaly remove special characters if used in node naming. 

## Further Reading

For more information on how **FunkyWeave** works, please take a look at the following documentation:

* [Basic Logging](/docs/basic_logging.md)
* [Node Types](/docs/nodes.md)
* [Advanced Logging](/docs/advanced_logging.md)
* [Client-Side Logging](/docs/clientside_logging.md)
* [Visualising Flows](/docs/visualiser.md)
* [Troubleshooting](/docs/troubleshooting.md)