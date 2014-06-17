module.exports = class WallLayer extends PIXI.Graphics
    # The rendering of the walls happen around corners.
    # Every corner is rendered by drawing all walls attached to it,
    # all walls attached get drawn in pairs with all other walls attached.
    # this ensures line connections being drawn for every combination,
    # it's also highly inefficient ;) and does work double/triple.
    # but it's super simple.

    # Curved walls have a little issue
    # because they're not drawn in the fashion described above.
    # to connect them up properly I'll need to draw the first and last
    # segment of the curve connected to other edges on that coord.

    constructor: ->
        super()

    render: (corners, curves) ->
        @beginFill 0,0
        @lineStyle 10, 0x000000
        for corner in corners
            for edge1 in corner.edges
                for edge2 in corner.edges
                    if edge1 isnt edge2
                        @moveTo edge1.getOther(corner).x, edge1.getOther(corner).y
                        @setLineThickness edge1.thickness, @, 0x000000
                        @lineTo corner.x, corner.y
                        @setLineThickness edge2.thickness, @, 0x000000
                        @lineTo edge2.getOther(corner).x, edge2.getOther(corner).y

        for curve in curves
            start = {x:curve.start.x, y:curve.start.y}
            end = {x:curve.end.x, y:curve.end.y}
            control = {x:curve.control.x, y:curve.control.y}
            arcTo start, end, control, @

    getDelta = (p1, p2) ->
        Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y)

    arcTo = (start, end, control, graphics) ->
        totalLength = getDelta(start, control) + getDelta(end, control)
        steps = parseInt(totalLength / 25)
        console.log "#{steps} steps in quadratic bezier draw."
        graphics.moveTo start.x, start.y
        for i in [0 ... steps]
            p = bezierPoint start, end, control, (i/steps)
            graphics.lineTo p.x, p.y
        graphics.lineTo end.x, end.y

    bezierPoint = (start, end, control, delta) ->
        t = Math.max delta, 0.0000001
        x: (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x
        y: (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y

    setLineThickness : (thickness, graphics, color) ->
        if @lastThickness isnt thickness
            @lastThickness = thickness
            graphics.lineStyle @lastThickness, color
        return
