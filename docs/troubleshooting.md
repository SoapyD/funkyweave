
# TroubleShooting

## Nodemon

If you're planning to develop using nodemon, please add the following config script to your package folder so that any data saved to the data folder won't restart the server.

```
	"nodemonConfig": {
		"ignore": [
			"data/*"
		]
	},
```