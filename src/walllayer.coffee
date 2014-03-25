module.exports = class WallLayer

  @render: (corners, graphics, x, y, scale, color) ->
    graphics.beginFill 0,0
    graphics.lineStyle 10, color
    for corner in corners
      for edge1 in corner.edges
        for edge2 in corner.edges
          if edge1 isnt edge2
            graphics.moveTo((edge1.getOther(corner).x + x) * scale,
              (edge1.getOther(corner).y+ y)*scale)
            WallLayer._setLineThickness edge1.thickness*scale, graphics, color
            graphics.lineTo((corner.x+x)*scale, (corner.y+y)*scale)
            WallLayer._setLineThickness edge2.thickness*scale, graphics, color
            graphics.lineTo((edge2.getOther(corner).x+x)*scale,
              (edge2.getOther(corner).y+y)*scale)
    graphics

  @_setLineThickness : (thickness, graphics, color) ->
    if @lastThickness isnt thickness
      @lastThickness = thickness
      graphics.lineStyle @lastThickness, color
    return
