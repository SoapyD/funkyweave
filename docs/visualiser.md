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