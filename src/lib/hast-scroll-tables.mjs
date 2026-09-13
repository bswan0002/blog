/** @type {import('satteri').HastPluginDefinition} */
const scrollTables = {
  name: "scroll-tables",
  element: {
    filter: ["table"],
    visit(node, context) {
      const parent = context.parent(node)
      const classes = parent?.type === "element" ? parent.properties.className : []
      if (Array.isArray(classes) && classes.includes("typeset-scroll")) return

      context.wrapNode(node, {
        type: "element",
        tagName: "div",
        properties: {
          className: ["typeset-scroll"],
          tabIndex: 0,
          role: "region",
          ariaLabel: "Scrollable table",
        },
        children: [],
      })
    },
  },
}

export default scrollTables
