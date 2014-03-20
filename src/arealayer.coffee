module.exports = class AreaLayer extends PIXI.Graphics
  constructor: ->
    super()
    @color = '#444444'
    @tint = @color.replace('#', '0x')

  drawArea : (area) ->
    @beginFill 0xffffff
    @lineStyle 0, 0xffffff
    for p in area
      @lineTo(p.x, p.y)
    @endFill()
