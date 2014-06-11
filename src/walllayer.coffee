module.exports = class WallLayer
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

    @renderCurved: (curves, graphics, x, y, scale, color) ->
        graphics.beginFill 0,0
        graphics.lineStyle 10, color
        for curve in curves
            start = {x:(curve.start.x+x)*scale, y:(curve.start.y+y)*scale}
            end = {x:(curve.end.x+x)*scale, y:(curve.end.y+y)*scale}
            control = {x:(curve.control.x+x)*scale, y:(curve.control.y+y)*scale}
            arcTo start, end, control, graphics

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

    @render: (corners, graphics, x, y, scale, color) ->
        graphics.beginFill 0,0
        graphics.lineStyle 10, color
        for corner in corners
            for edge1 in corner.edges
                for edge2 in corner.edges
                    if edge1 isnt edge2
                        graphics.moveTo((edge1.getOther(corner).x + x) * scale, (edge1.getOther(corner).y+ y)*scale)
                        WallLayer._setLineThickness edge1.thickness*scale, graphics, color
                        graphics.lineTo((corner.x+x)*scale, (corner.y+y)*scale)
                        WallLayer._setLineThickness edge2.thickness*scale, graphics, color
                        graphics.lineTo((edge2.getOther(corner).x+x)*scale,(edge2.getOther(corner).y+y)*scale)
        graphics

    @_setLineThickness : (thickness, graphics, color) ->
        if @lastThickness isnt thickness
            @lastThickness = thickness
            graphics.lineStyle @lastThickness, color
        return
