import { QuartzTransformerPlugin } from "../types"

export const excalidrawToSvg: QuartzTransformerPlugin = () => {
  console.log("Loaded excalidrawToSvg plugin")
  return {
    name: "excalidrawToSvg",
    markdownPlugins() {
      return [() => {
        return (tree) => {
          function parseChildren(nodes:any){
              return nodes.children.map((child:any)=>{
                if(child.type === "html" && child.value.includes('.excalidraw"')){
                  child.type = "image"
                  child.url = child.value.split('data-url="')[1].split('"')[0] + ".svg"
                  child.data = {
                    hProperties: {
                      width: "auto",
                      height: "auto",
                      alt: "."
                    }
                  }
                }
                else if(child.children) {
                  child.chidlren = parseChildren(child)
                }
                return child
              })
          }
          parseChildren(tree)
        }
      }]
    }
  }
}