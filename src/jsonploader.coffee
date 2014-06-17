Floorplan = require './floorplan'
{maskFlip, endsWith} = require './utils'

imageLoadedCounter = null
imageCounter = null
jsonpCounter = null
jsonCache = {}
window.fpAssets = {}
whenTotallyDone = null

module.exports.loadJSONPAssets = (urlArray, callback) ->
    jsonpCounter = urlArray.length
    urlArray.map constructJSONPAsset
    whenTotallyDone = callback

drawAllInCache = ->
    scene = Floorplan.get()
    _addSprite = (key) ->
        sprite = new PIXI.Sprite.fromImage(key)
        sprite.position.x = testX
        sprite.position.y = testY
        scene.assetContainer.addChild(sprite)
  
    for k, v of fpAssets
        testX = Math.random() * 900
        testY = Math.random() * 500
        if v.under then _addSprite k + '.under'
        if v.color then _addSprite k + '.shape'
        if v.over then _addSprite k + '.over'
    return

getJSONP = (url, data, callback) ->
    head = document.getElementsByTagName("head")[0]
    newScript = document.createElement 'script'
    newScript.type = 'text/javascript'
    newScript.src = url
    head.appendChild newScript
    return

onImageLoaded = ->
    imageLoadedCounter += 1
    if imageLoadedCounter >= imageCounter
        console.log 'done loading all images'
        createShapesForAllColorAssets()
    return

constructJSONPAsset = (url) ->
    getJSONP url, {}, window.receive_asset = (asset) ->
        jsonCache[asset.id] = asset
        jsonpCounter -= 1

        if jsonpCounter <= 0
            console.log 'done loading jsonp.'
            for k,v of jsonCache
                data =
                  id:k
                  margin: v.margin
                  offset_x: v.offset_x
                  offset_y: v.offset_y
                  height: v.height
                  width: v.width
                  under: v.under?
                  color: v.color?
                  over: v.over?
                  default_color: v.default_color or "#ffffff"

                fpAssets[k] = data
                
                if v.under
                    imageCounter += 1
                    createImage v.under, k+".under", onImageLoaded
                if v.color
                    imageCounter += 1
                    createImage v.color, k+".color", onImageLoaded
                if v.over
                    imageCounter += 1
                    createImage v.over, k+".over", onImageLoaded
          return

createImage = (data, id, onLoad) ->
    image = new Image()
    image.onload = ->
        baseTexture = new PIXI.BaseTexture image
        texture = new PIXI.Texture baseTexture
        PIXI.Texture.addTextureToCache texture, id
        onLoad()
        return
    image.src = data
    return

createShapesForAllColorAssets = ->
    colorKeys = (k for k,v of PIXI.TextureCache when endsWith(k, '.color'))
    shapeCount = colorKeys.length
    count = 0
    for k in colorKeys
        shapeImage = maskFlip PIXI.TextureCache[k].baseTexture
        createImage shapeImage, k.replace('.color','.shape'), ->
            count += 1
            console.log count, shapeCount
            if count >= shapeCount
                jsonCache = {}
                whenTotallyDone()
                return
    if colorKeys.length is 0
        whenTotallyDone()
    return
                

