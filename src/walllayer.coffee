module.exports = class WallLayer

  @render: (corners, graphics, x, y, scaleX, scaleY, color) ->
    graphics.beginFill 0,0
    console.log color
    graphics.lineStyle 10, color
    for corner in corners
      for edge1 in corner.edges
        for edge2 in corner.edges
          if edge1 isnt edge2
            graphics.moveTo(edge1.getOther(corner).x+ x,
              edge1.getOther(corner).y+ y)
            WallLayer._setLineThickness edge1.thickness, graphics, color
            graphics.lineTo(corner.x+x, corner.y+y)
            WallLayer._setLineThickness edge2.thickness, graphics, color
            graphics.lineTo(edge2.getOther(corner).x+x,
              edge2.getOther(corner).y+y)
    graphics

  @_setLineThickness : (thickness, graphics, color) ->
    if @lastThickness isnt thickness
      @lastThickness = thickness
      graphics.lineStyle @lastThickness, color
    return
