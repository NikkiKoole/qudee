module.exports = class WallLayer
# The rendering of the walls happen around corners.
# Every corner is rendered by drawing all walls attached to it,
# all walls attached get drawn in pairs with all other walls attached.
# this ensures line connections being drawn for every combination,
# it's also highly inefficient ;) and does work double/triple.
# but it's super simple.

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
