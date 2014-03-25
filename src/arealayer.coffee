module.exports = class AreaLayer

  @render: (areas, graphics, x, y, scaleX, scaleY, color) ->
    for area in areas
      graphics.beginFill color
      graphics.lineStyle 0, 0x000000
      for p in area
        graphics.lineTo(p.x+x, p.y+y)
      graphics.endFill()
    return
