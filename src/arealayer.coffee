module.exports = class AreaLayer extends PIXI.Graphics
  constructor: ->
    super()
    @color = '#444444'
    @tint = @color.replace('#', '0x')

  @render: (areas, graphics, x, y, scaleX, scaleY) ->
    for area in areas
      graphics.beginFill 0xaaaaaa
      graphics.lineStyle 0, 0xffffff
      for p in area
        graphics.lineTo(p.x+x, p.y+y)
      graphics.endFill()
    return
