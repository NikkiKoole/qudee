WallGraph = require './wallgraph'

module.exports = class WallLayer extends PIXI.Graphics
  constructor: ->
    super()
    @color = '#ffffff'
    @tint = @color.replace('#', '0x')
    #@tint = @color.replace('#', '0x')
    @clear()
    
  clear: ->
    super()
    @wallGraph = new WallGraph()
      
  addWall: (a, b, thickness) ->
    @wallGraph.addWall(a, b, thickness)

  drawWalls: ->
    @lineStyle 0, 0xffffff
    for corner in @wallGraph.getCorners()
      for edge1 in corner.edges
        for edge2 in corner.edges
          if edge1 isnt edge2
            # now draw 2 connected lines
            # 1) from  the other end of edge1 to corner
            # 2) from corner to the other end of edge2
            # to save on state changes I test to see if I need to set lineStyle
            @moveTo(edge1.getOther(corner).x, edge1.getOther(corner).y)
            @_setLineThickness edge1.thickness
            @lineTo(corner.x, corner.y)
            @_setLineThickness edge2.thickness
            @lineTo(edge2.getOther(corner).x, edge2.getOther(corner).y)

  _setLineThickness : (thickness) ->
    if @lastThickness isnt thickness
      @lastThickness = thickness
      @lineStyle @lastThickness, 0xffffff

