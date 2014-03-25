WallGraph = require './wallgraph'

module.exports = class WallLayer
  constructor: ->
    @color = '#ffffff'
    @tint = @color.replace('#', '0x')


  clear: ->
    @wallGraph = new WallGraph()
      
  addWall: (a, b, thickness) ->
    @wallGraph.addWall(a, b, thickness)

  render: (graphics, x, y, scaleX, scaleY) ->
    @drawWalls(graphics, x, y, scaleX, scaleY)

  @render: (corners, graphics, x, y, scaleX, scaleY) ->
    graphics.beginFill 0,0
    graphics.lineStyle 0, 0xffffff
    for corner in corners
      for edge1 in corner.edges
        for edge2 in corner.edges
          if edge1 isnt edge2
            
            # now draw 2 connected lines
            # 1) from  the other end of edge1 to corner
            # 2) from corner to the other end of edge2
            # to save on state changes I test to see if I need to set lineStyle
            
            graphics.moveTo(edge1.getOther(corner).x+ x,
              edge1.getOther(corner).y+ y)
            WallLayer._setLineThickness2 edge1.thickness, graphics
            graphics.lineTo(corner.x+x, corner.y+y)
            WallLayer._setLineThickness2 edge2.thickness, graphics
            graphics.lineTo(edge2.getOther(corner).x+x,
              edge2.getOther(corner).y+y)
    graphics

  @_setLineThickness2 : (thickness, graphics) ->
    if @lastThickness isnt thickness
      @lastThickness = thickness
      graphics.lineStyle @lastThickness, 0xffffff
  

  drawWalls: (graphics, x, y, scaleX, scaleY)->
    graphics.beginFill 0,0
    graphics.lineStyle 0, 0xffffff
    for corner in @wallGraph.getCorners()
      for edge1 in corner.edges
        for edge2 in corner.edges
          if edge1 isnt edge2
            
            # now draw 2 connected lines
            # 1) from  the other end of edge1 to corner
            # 2) from corner to the other end of edge2
            # to save on state changes I test to see if I need to set lineStyle
            
            graphics.moveTo(edge1.getOther(corner).x+ x,
              edge1.getOther(corner).y+ y)
            @_setLineThickness edge1.thickness, graphics
            graphics.lineTo(corner.x+x, corner.y+y)
            @_setLineThickness edge2.thickness, graphics
            graphics.lineTo(edge2.getOther(corner).x+x,
              edge2.getOther(corner).y+y)
    graphics
    
  _setLineThickness : (thickness, graphics) ->
    if @lastThickness isnt thickness
      @lastThickness = thickness
      graphics.lineStyle @lastThickness, 0xffffff
  

